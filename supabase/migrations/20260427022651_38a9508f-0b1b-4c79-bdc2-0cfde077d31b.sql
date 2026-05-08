
-- Actualizar handle_new_user (ya no escribe 'especialidad' que fue eliminada)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, cedula)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'cedula'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'cliente'::public.app_role))
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Revocar EXECUTE de anon en las funciones SECURITY DEFINER de notificaciones
REVOKE ALL ON FUNCTION public.notif_on_case_assigned() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.notif_on_audiencia() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.notif_on_actuacion() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.notif_on_documento() FROM PUBLIC, anon;
