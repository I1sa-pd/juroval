-- 1) Columnas de seguimiento de acceso
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_sign_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS sign_in_count integer NOT NULL DEFAULT 0;

-- 2) Función para registrar inicio de sesión (llamada desde el cliente)
CREATE OR REPLACE FUNCTION public.record_sign_in()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_sign_in_at = now(),
      sign_in_count = sign_in_count + 1
  WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.record_sign_in() FROM public;
GRANT EXECUTE ON FUNCTION public.record_sign_in() TO authenticated;

-- 3) Datos de prueba: áreas de derecho
INSERT INTO public.areas_derecho (nombre, descripcion) VALUES
  ('Civil', 'Derecho civil: contratos, obligaciones, propiedad'),
  ('Penal', 'Derecho penal: delitos y procedimientos penales'),
  ('Laboral', 'Derecho laboral: relaciones empleador-trabajador'),
  ('Familia', 'Derecho de familia: divorcios, custodia, sucesiones'),
  ('Administrativo', 'Derecho administrativo: relaciones con entidades públicas'),
  ('Comercial', 'Derecho comercial: empresas, sociedades, mercantil')
ON CONFLICT DO NOTHING;

-- 4) Tipos de proceso por área
INSERT INTO public.tipos_proceso (nombre, area_id)
SELECT t.nombre, a.id FROM (VALUES
  ('Civil', 'Proceso Ejecutivo'),
  ('Civil', 'Proceso Ordinario'),
  ('Civil', 'Proceso Verbal'),
  ('Penal', 'Proceso Penal Ordinario'),
  ('Penal', 'Tutela'),
  ('Laboral', 'Despido Injustificado'),
  ('Laboral', 'Reclamación de Prestaciones'),
  ('Familia', 'Divorcio'),
  ('Familia', 'Custodia y Alimentos'),
  ('Familia', 'Sucesión'),
  ('Administrativo', 'Nulidad y Restablecimiento'),
  ('Administrativo', 'Acción de Reparación Directa'),
  ('Comercial', 'Cobro de Cartera'),
  ('Comercial', 'Disolución de Sociedad')
) AS t(area_nombre, nombre)
JOIN public.areas_derecho a ON a.nombre = t.area_nombre
ON CONFLICT DO NOTHING;

-- 5) Juzgados
INSERT INTO public.juzgados (nombre, tipo, ciudad) VALUES
  ('Juzgado 1 Civil del Circuito', 'Civil', 'Bogotá'),
  ('Juzgado 5 Civil Municipal', 'Civil', 'Bogotá'),
  ('Juzgado 12 Penal del Circuito', 'Penal', 'Bogotá'),
  ('Juzgado 3 Laboral del Circuito', 'Laboral', 'Bogotá'),
  ('Juzgado 7 de Familia', 'Familia', 'Bogotá'),
  ('Tribunal Administrativo de Cundinamarca', 'Administrativo', 'Bogotá'),
  ('Juzgado 2 Civil del Circuito', 'Civil', 'Medellín'),
  ('Juzgado 4 Penal del Circuito', 'Penal', 'Medellín'),
  ('Juzgado 1 Laboral del Circuito', 'Laboral', 'Cali'),
  ('Juzgado 3 de Familia', 'Familia', 'Cali')
ON CONFLICT DO NOTHING;

-- 6) Especialidades por área
INSERT INTO public.especialidades (nombre, area_id)
SELECT e.nombre, a.id FROM (VALUES
  ('Civil', 'Contratos'),
  ('Civil', 'Responsabilidad Civil'),
  ('Penal', 'Delitos contra el Patrimonio'),
  ('Penal', 'Delitos contra la Vida'),
  ('Laboral', 'Despidos'),
  ('Laboral', 'Seguridad Social'),
  ('Familia', 'Divorcios'),
  ('Familia', 'Sucesiones'),
  ('Administrativo', 'Contratación Estatal'),
  ('Comercial', 'Sociedades')
) AS e(area_nombre, nombre)
JOIN public.areas_derecho a ON a.nombre = e.area_nombre
ON CONFLICT DO NOTHING;