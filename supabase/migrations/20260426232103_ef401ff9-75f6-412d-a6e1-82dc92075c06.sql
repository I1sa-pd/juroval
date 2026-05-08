-- ============ ROLES ============
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('jefe', 'abogado', 'cliente');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  cedula TEXT,
  especialidad TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Profiles RLS
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'jefe') OR public.has_role(auth.uid(), 'abogado'));
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'jefe'));
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'jefe'));

-- user_roles RLS
DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'jefe') OR public.has_role(auth.uid(), 'abogado'));
DROP POLICY IF EXISTS "user_roles_insert" ON public.user_roles;
CREATE POLICY "user_roles_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'jefe'));
DROP POLICY IF EXISTS "user_roles_update" ON public.user_roles;
CREATE POLICY "user_roles_update" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'jefe'));
DROP POLICY IF EXISTS "user_roles_delete" ON public.user_roles;
CREATE POLICY "user_roles_delete" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'jefe'));

-- Trigger: create profile + cliente role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, cedula, especialidad)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'cedula',
    NEW.raw_user_meta_data->>'especialidad'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'cliente'::public.app_role))
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CASES ============
DO $$ BEGIN
  CREATE TYPE public.case_status AS ENUM ('Creación', 'Recaudo Probatorio', 'Proyección', 'Revisión', 'Proyección de Recursos', 'Recabar Pruebas', 'Audiencia', 'Cerrado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  radicado TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  cliente_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  juzgado TEXT,
  abogado_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  etapa public.case_status NOT NULL DEFAULT 'Creación',
  observaciones TEXT,
  urgente BOOLEAN NOT NULL DEFAULT false,
  fecha_vencimiento DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cases_select" ON public.cases;
CREATE POLICY "cases_select" ON public.cases FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'jefe')
    OR (public.has_role(auth.uid(), 'abogado') AND abogado_id = auth.uid())
    OR (public.has_role(auth.uid(), 'cliente') AND cliente_id = auth.uid())
  );
DROP POLICY IF EXISTS "cases_insert" ON public.cases;
CREATE POLICY "cases_insert" ON public.cases FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'jefe'));
DROP POLICY IF EXISTS "cases_update" ON public.cases;
CREATE POLICY "cases_update" ON public.cases FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'jefe') OR (public.has_role(auth.uid(), 'abogado') AND abogado_id = auth.uid()));
DROP POLICY IF EXISTS "cases_delete" ON public.cases;
CREATE POLICY "cases_delete" ON public.cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'jefe'));

DROP TRIGGER IF EXISTS cases_updated_at ON public.cases;
CREATE TRIGGER cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ DOCUMENTS ============
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  description TEXT,
  shared_with_client BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select" ON public.documents;
CREATE POLICY "documents_select" ON public.documents FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'jefe')
    OR uploaded_by = auth.uid()
    OR recipient_id = auth.uid()
    OR (public.has_role(auth.uid(), 'abogado') AND case_id IN (SELECT id FROM public.cases WHERE abogado_id = auth.uid()))
    OR (public.has_role(auth.uid(), 'cliente') AND shared_with_client AND case_id IN (SELECT id FROM public.cases WHERE cliente_id = auth.uid()))
  );
DROP POLICY IF EXISTS "documents_insert" ON public.documents;
CREATE POLICY "documents_insert" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid() AND (public.has_role(auth.uid(), 'jefe') OR public.has_role(auth.uid(), 'abogado')));
DROP POLICY IF EXISTS "documents_delete" ON public.documents;
CREATE POLICY "documents_delete" ON public.documents FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'jefe') OR uploaded_by = auth.uid());

-- ============ COMENTARIOS INTERNOS ============
CREATE TABLE IF NOT EXISTS public.case_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  abogado_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  texto TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.case_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "case_comments_select" ON public.case_comments;
CREATE POLICY "case_comments_select" ON public.case_comments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'jefe') OR (public.has_role(auth.uid(), 'abogado') AND abogado_id = auth.uid()));
DROP POLICY IF EXISTS "case_comments_insert" ON public.case_comments;
CREATE POLICY "case_comments_insert" ON public.case_comments FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND (public.has_role(auth.uid(), 'jefe') OR public.has_role(auth.uid(), 'abogado')));
DROP POLICY IF EXISTS "case_comments_delete" ON public.case_comments;
CREATE POLICY "case_comments_delete" ON public.case_comments FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'jefe'));

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-documents', 'case-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for case-documents bucket
DROP POLICY IF EXISTS "documents_storage_select" ON storage.objects;
CREATE POLICY "documents_storage_select" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'case-documents'
    AND (
      public.has_role(auth.uid(), 'jefe')
      OR EXISTS (SELECT 1 FROM public.documents d WHERE d.file_path = name AND (
        d.uploaded_by = auth.uid()
        OR d.recipient_id = auth.uid()
        OR (public.has_role(auth.uid(), 'abogado') AND d.case_id IN (SELECT id FROM public.cases WHERE abogado_id = auth.uid()))
        OR (public.has_role(auth.uid(), 'cliente') AND d.shared_with_client AND d.case_id IN (SELECT id FROM public.cases WHERE cliente_id = auth.uid()))
      ))
    )
  );

DROP POLICY IF EXISTS "documents_storage_insert" ON storage.objects;
CREATE POLICY "documents_storage_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'case-documents'
    AND (public.has_role(auth.uid(), 'jefe') OR public.has_role(auth.uid(), 'abogado'))
  );

DROP POLICY IF EXISTS "documents_storage_delete" ON storage.objects;
CREATE POLICY "documents_storage_delete" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'case-documents'
    AND (public.has_role(auth.uid(), 'jefe') OR owner = auth.uid())
  );