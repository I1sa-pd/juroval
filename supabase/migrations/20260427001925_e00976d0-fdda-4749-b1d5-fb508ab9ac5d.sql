-- ============================================================
-- Normalización del esquema legal + tablas nuevas + storage 250MB
-- ============================================================

-- 1) CATÁLOGOS (normalización)
-- Áreas del derecho (penal, civil, laboral, etc.)
CREATE TABLE IF NOT EXISTS public.areas_derecho (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Especialidades (subcategorías por área)
CREATE TABLE IF NOT EXISTS public.especialidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id uuid REFERENCES public.areas_derecho(id) ON DELETE SET NULL,
  nombre text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Juzgados / despachos
CREATE TABLE IF NOT EXISTS public.juzgados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  ciudad text,
  tipo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (nombre, ciudad)
);

-- Tipos de proceso (Tutela, Ordinario, Penal, etc.)
CREATE TABLE IF NOT EXISTS public.tipos_proceso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  area_id uuid REFERENCES public.areas_derecho(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Vincular profiles.especialidad -> especialidad_id (mantenemos texto por compatibilidad)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS especialidad_id uuid REFERENCES public.especialidades(id) ON DELETE SET NULL;

-- 3) Vincular cases a catálogos (manteniendo columnas de texto por compatibilidad)
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS tipo_proceso_id uuid REFERENCES public.tipos_proceso(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS juzgado_id uuid REFERENCES public.juzgados(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES public.areas_derecho(id) ON DELETE SET NULL;

-- 4) NUEVAS TABLAS DEL FLUJO LEGAL

-- Partes procesales del caso (demandante, demandado, terceros, apoderados externos…)
CREATE TABLE IF NOT EXISTS public.partes_procesales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  rol text NOT NULL,                -- demandante / demandado / tercero / apoderado_contraparte
  nombre text NOT NULL,
  identificacion text,
  tipo_identificacion text,         -- CC, NIT, CE, PA…
  email text,
  telefono text,
  direccion text,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Actuaciones procesales / historial del caso
CREATE TABLE IF NOT EXISTS public.actuaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  tipo text NOT NULL,               -- auto, sentencia, traslado, recurso, oficio…
  descripcion text NOT NULL,
  termino_dias integer,             -- días para responder
  vence_at date,
  cumplida boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Audiencias / agenda
CREATE TABLE IF NOT EXISTS public.audiencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  tipo text,                        -- conciliación, juicio, lectura, virtual, etc.
  fecha_inicio timestamptz NOT NULL,
  fecha_fin timestamptz,
  modalidad text DEFAULT 'presencial', -- presencial / virtual / mixta
  enlace_virtual text,
  ubicacion text,
  resultado text,
  notas text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Honorarios y movimientos económicos por caso
CREATE TABLE IF NOT EXISTS public.honorarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  concepto text NOT NULL,
  monto numeric(14,2) NOT NULL CHECK (monto >= 0),
  moneda text NOT NULL DEFAULT 'COP',
  estado text NOT NULL DEFAULT 'pendiente',  -- pendiente / pagado / vencido / anulado
  fecha_emision date NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento date,
  fecha_pago date,
  metodo_pago text,
  notas text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5) Triggers updated_at
DO $$ BEGIN
  CREATE TRIGGER trg_partes_updated  BEFORE UPDATE ON public.partes_procesales FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_actuaciones_updated BEFORE UPDATE ON public.actuaciones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_audiencias_updated BEFORE UPDATE ON public.audiencias FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_honorarios_updated BEFORE UPDATE ON public.honorarios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 6) Índices
CREATE INDEX IF NOT EXISTS idx_partes_case      ON public.partes_procesales(case_id);
CREATE INDEX IF NOT EXISTS idx_actuaciones_case ON public.actuaciones(case_id);
CREATE INDEX IF NOT EXISTS idx_actuaciones_vence ON public.actuaciones(vence_at) WHERE cumplida = false;
CREATE INDEX IF NOT EXISTS idx_audiencias_case  ON public.audiencias(case_id);
CREATE INDEX IF NOT EXISTS idx_audiencias_fecha ON public.audiencias(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_honorarios_case  ON public.honorarios(case_id);
CREATE INDEX IF NOT EXISTS idx_cases_abogado    ON public.cases(abogado_id);
CREATE INDEX IF NOT EXISTS idx_cases_cliente    ON public.cases(cliente_id);
CREATE INDEX IF NOT EXISTS idx_documents_case   ON public.documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_recipient ON public.documents(recipient_id);

-- 7) RLS para todas las tablas nuevas
ALTER TABLE public.areas_derecho     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.especialidades    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.juzgados          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_proceso     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partes_procesales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actuaciones       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audiencias        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.honorarios        ENABLE ROW LEVEL SECURITY;

-- Catálogos: lectura para autenticados, escritura solo jefe
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['areas_derecho','especialidades','juzgados','tipos_proceso'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)', t||'_select', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),''jefe''))', t||'_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),''jefe''))', t||'_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.has_role(auth.uid(),''jefe''))', t||'_delete', t);
  END LOOP;
END $$;

-- Helper: ¿el usuario tiene visibilidad sobre el caso?
CREATE OR REPLACE FUNCTION public.can_view_case(_case_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cases c
    WHERE c.id = _case_id AND (
      public.has_role(auth.uid(),'jefe')
      OR (public.has_role(auth.uid(),'abogado') AND c.abogado_id = auth.uid())
      OR (public.has_role(auth.uid(),'cliente') AND c.cliente_id = auth.uid())
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_edit_case(_case_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cases c
    WHERE c.id = _case_id AND (
      public.has_role(auth.uid(),'jefe')
      OR (public.has_role(auth.uid(),'abogado') AND c.abogado_id = auth.uid())
    )
  );
$$;

-- Partes procesales
CREATE POLICY partes_select ON public.partes_procesales FOR SELECT TO authenticated USING (public.can_view_case(case_id));
CREATE POLICY partes_insert ON public.partes_procesales FOR INSERT TO authenticated WITH CHECK (public.can_edit_case(case_id));
CREATE POLICY partes_update ON public.partes_procesales FOR UPDATE TO authenticated USING (public.can_edit_case(case_id));
CREATE POLICY partes_delete ON public.partes_procesales FOR DELETE TO authenticated USING (public.can_edit_case(case_id));

-- Actuaciones
CREATE POLICY actuaciones_select ON public.actuaciones FOR SELECT TO authenticated USING (public.can_view_case(case_id));
CREATE POLICY actuaciones_insert ON public.actuaciones FOR INSERT TO authenticated WITH CHECK (public.can_edit_case(case_id) AND created_by = auth.uid());
CREATE POLICY actuaciones_update ON public.actuaciones FOR UPDATE TO authenticated USING (public.can_edit_case(case_id));
CREATE POLICY actuaciones_delete ON public.actuaciones FOR DELETE TO authenticated USING (public.can_edit_case(case_id));

-- Audiencias
CREATE POLICY audiencias_select ON public.audiencias FOR SELECT TO authenticated USING (public.can_view_case(case_id));
CREATE POLICY audiencias_insert ON public.audiencias FOR INSERT TO authenticated WITH CHECK (public.can_edit_case(case_id) AND created_by = auth.uid());
CREATE POLICY audiencias_update ON public.audiencias FOR UPDATE TO authenticated USING (public.can_edit_case(case_id));
CREATE POLICY audiencias_delete ON public.audiencias FOR DELETE TO authenticated USING (public.can_edit_case(case_id));

-- Honorarios: solo jefe ve/modifica; cliente puede ver los suyos
CREATE POLICY honorarios_select ON public.honorarios FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'jefe')
  OR EXISTS (SELECT 1 FROM public.cases c WHERE c.id = honorarios.case_id AND c.cliente_id = auth.uid() AND public.has_role(auth.uid(),'cliente'))
);
CREATE POLICY honorarios_insert ON public.honorarios FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'jefe') AND created_by = auth.uid());
CREATE POLICY honorarios_update ON public.honorarios FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'jefe'));
CREATE POLICY honorarios_delete ON public.honorarios FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'jefe'));

-- 8) Datos semilla de catálogos
INSERT INTO public.areas_derecho (nombre, descripcion) VALUES
  ('Civil','Derecho civil y obligaciones'),
  ('Penal','Derecho penal y procesal penal'),
  ('Laboral','Derecho laboral y seguridad social'),
  ('Familia','Derecho de familia'),
  ('Comercial','Derecho comercial y societario'),
  ('Administrativo','Derecho administrativo y contencioso'),
  ('Constitucional','Tutela y acciones constitucionales'),
  ('Tributario','Derecho tributario')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.tipos_proceso (nombre) VALUES
  ('Ordinario'),('Ejecutivo'),('Tutela'),('Habeas Corpus'),
  ('Acción Popular'),('Acción de Cumplimiento'),('Conciliación'),
  ('Penal Acusatorio'),('Liquidación'),('Sucesión')
ON CONFLICT (nombre) DO NOTHING;

-- 9) Storage: subir el límite del bucket case-documents a 250 MB
UPDATE storage.buckets
SET file_size_limit = 262144000  -- 250 MB
WHERE id = 'case-documents';