INSERT INTO professores (id, nome)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email, 'Professor(a)')
FROM auth.users
ON CONFLICT (id) DO NOTHING;
