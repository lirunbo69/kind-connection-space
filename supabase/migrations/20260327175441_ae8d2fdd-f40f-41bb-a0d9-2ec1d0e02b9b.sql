
-- Set lirunbo69@gmail.com as admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'lirunbo69@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
