-- Vincular abogados a áreas de derecho
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas_derecho(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_area_id ON public.profiles(area_id);

-- Migrar datos existentes: matchear especialidad (texto) con areas_derecho.nombre
UPDATE public.profiles p
SET area_id = a.id
FROM public.areas_derecho a
WHERE p.area_id IS NULL
  AND p.especialidad IS NOT NULL
  AND LOWER(TRIM(p.especialidad)) = LOWER(a.nombre);