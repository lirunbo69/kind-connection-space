
-- Backfill profiles for existing auth users
INSERT INTO public.profiles (id, email, phone, created_at)
SELECT id, email, phone, created_at FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Backfill user_points
INSERT INTO public.user_points (user_id, remaining_points)
SELECT id, 200 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Backfill user_roles (default 'user')
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user' FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- Set the FIRST registered user as admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users ORDER BY created_at LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;
