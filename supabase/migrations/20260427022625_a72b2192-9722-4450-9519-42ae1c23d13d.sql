
-- =========================================================
-- 1. Tabla notificaciones (normalizada)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  tipo text NOT NULL,                -- 'caso_asignado' | 'audiencia_creada' | 'actuacion_creada' | 'documento_recibido' | 'caso_urgente'
  titulo text NOT NULL,
  mensaje text NOT NULL,
  leida boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_user_unread
  ON public.notificaciones (user_id, leida, created_at DESC);

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select_own" ON public.notificaciones
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notif_update_own" ON public.notificaciones
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notif_delete_own" ON public.notificaciones
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Inserción solo desde triggers (security definer). Sin policy de INSERT pública.

-- =========================================================
-- 2. Triggers que crean notificaciones automáticamente
-- =========================================================

-- 2a. Cuando se asigna o reasigna un abogado a un caso
CREATE OR REPLACE FUNCTION public.notif_on_case_assigned()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.abogado_id IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.abogado_id IS DISTINCT FROM OLD.abogado_id) THEN
    INSERT INTO public.notificaciones (user_id, case_id, tipo, titulo, mensaje)
    VALUES (
      NEW.abogado_id, NEW.id, 'caso_asignado',
      'Nuevo caso asignado',
      'Te asignaron el caso ' || NEW.radicado || ' (' || NEW.cliente_nombre || ')'
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notif_case_assigned ON public.cases;
CREATE TRIGGER trg_notif_case_assigned
  AFTER INSERT OR UPDATE OF abogado_id ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.notif_on_case_assigned();

-- 2b. Cuando se crea una audiencia → notifica al abogado del caso
CREATE OR REPLACE FUNCTION public.notif_on_audiencia()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_abogado uuid;
  v_radicado text;
BEGIN
  SELECT abogado_id, radicado INTO v_abogado, v_radicado FROM public.cases WHERE id = NEW.case_id;
  IF v_abogado IS NOT NULL AND v_abogado <> NEW.created_by THEN
    INSERT INTO public.notificaciones (user_id, case_id, tipo, titulo, mensaje)
    VALUES (v_abogado, NEW.case_id, 'audiencia_creada',
            'Nueva audiencia agendada',
            'Audiencia "' || NEW.titulo || '" en caso ' || COALESCE(v_radicado,'-'));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notif_audiencia ON public.audiencias;
CREATE TRIGGER trg_notif_audiencia
  AFTER INSERT ON public.audiencias
  FOR EACH ROW EXECUTE FUNCTION public.notif_on_audiencia();

-- 2c. Cuando se crea una actuación
CREATE OR REPLACE FUNCTION public.notif_on_actuacion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_abogado uuid;
  v_radicado text;
BEGIN
  SELECT abogado_id, radicado INTO v_abogado, v_radicado FROM public.cases WHERE id = NEW.case_id;
  IF v_abogado IS NOT NULL AND v_abogado <> NEW.created_by THEN
    INSERT INTO public.notificaciones (user_id, case_id, tipo, titulo, mensaje)
    VALUES (v_abogado, NEW.case_id, 'actuacion_creada',
            'Nueva actuación registrada',
            NEW.tipo || ' en caso ' || COALESCE(v_radicado,'-'));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notif_actuacion ON public.actuaciones;
CREATE TRIGGER trg_notif_actuacion
  AFTER INSERT ON public.actuaciones
  FOR EACH ROW EXECUTE FUNCTION public.notif_on_actuacion();

-- 2d. Cuando se sube un documento dirigido a alguien
CREATE OR REPLACE FUNCTION public.notif_on_documento()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_abogado uuid;
  v_radicado text;
  v_target uuid;
BEGIN
  -- Si tiene case_id → notificar al abogado del caso
  IF NEW.case_id IS NOT NULL THEN
    SELECT abogado_id, radicado INTO v_abogado, v_radicado FROM public.cases WHERE id = NEW.case_id;
    v_target := COALESCE(NEW.recipient_id, v_abogado);
    IF v_target IS NOT NULL AND v_target <> NEW.uploaded_by THEN
      INSERT INTO public.notificaciones (user_id, case_id, tipo, titulo, mensaje)
      VALUES (v_target, NEW.case_id, 'documento_recibido',
              'Nuevo documento recibido',
              NEW.file_name || COALESCE(' · Caso ' || v_radicado, ''));
    END IF;
  ELSIF NEW.recipient_id IS NOT NULL AND NEW.recipient_id <> NEW.uploaded_by THEN
    INSERT INTO public.notificaciones (user_id, case_id, tipo, titulo, mensaje)
    VALUES (NEW.recipient_id, NULL, 'documento_recibido',
            'Nuevo documento recibido', NEW.file_name);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notif_documento ON public.documents;
CREATE TRIGGER trg_notif_documento
  AFTER INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.notif_on_documento();

-- =========================================================
-- 3. Habilitar Realtime en tablas relevantes
-- =========================================================
ALTER TABLE public.cases REPLICA IDENTITY FULL;
ALTER TABLE public.audiencias REPLICA IDENTITY FULL;
ALTER TABLE public.actuaciones REPLICA IDENTITY FULL;
ALTER TABLE public.documents REPLICA IDENTITY FULL;
ALTER TABLE public.notificaciones REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.cases; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.audiencias; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.actuaciones; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.documents; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notificaciones; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- =========================================================
-- 4. Normalización: eliminar columna texto duplicada cases.juzgado
--    (ya existe juzgado_id que referencia el catálogo)
-- =========================================================
ALTER TABLE public.cases DROP COLUMN IF EXISTS juzgado;

-- También eliminar profiles.especialidad (texto suelto, ya existe area_id)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS especialidad;
