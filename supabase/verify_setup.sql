-- Verification script to check if Supabase setup is complete
-- Run this after setup.sql to verify everything is working correctly

-- Check if all tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'portfolios', 'interactions')
ORDER BY table_name;

-- Check if all indexes exist
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'portfolios', 'interactions')
ORDER BY tablename, indexname;

-- Check if RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'portfolios', 'interactions');

-- Check if all functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'handle_new_user',
    'handle_updated_at',
    'increment_portfolio_views',
    'get_portfolio_with_stats'
  )
ORDER BY routine_name;

-- Check if all triggers exist
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND event_object_table IN ('profiles', 'portfolios', 'interactions')
ORDER BY event_object_table, trigger_name;

-- Check if storage buckets exist
SELECT 
  id,
  name,
  public
FROM storage.buckets 
WHERE id IN ('avatars', 'portfolios');

-- Check RLS policies count
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'portfolios', 'interactions')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Test basic functionality (optional - only run if you want to create test data)
/*
-- Test profile creation (this would normally happen through auth signup)
INSERT INTO profiles (id, username, full_name, bio) VALUES
  ('00000000-0000-0000-0000-000000000001', 'test_user', 'Test User', 'This is a test profile')
ON CONFLICT (id) DO NOTHING;

-- Test portfolio creation
INSERT INTO portfolios (user_id, title, description, category, image_url, tags) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Test Portfolio', 'This is a test portfolio', 'digital-art', 'https://example.com/test.jpg', ARRAY['test', 'portfolio'])
ON CONFLICT (id) DO NOTHING;

-- Clean up test data
DELETE FROM portfolios WHERE title = 'Test Portfolio';
DELETE FROM profiles WHERE username = 'test_user';
*/

-- If all queries above return expected results, your Supabase setup is complete!