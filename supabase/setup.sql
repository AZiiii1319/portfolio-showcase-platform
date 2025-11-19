-- Complete Supabase Setup Script
-- Run this in your Supabase SQL Editor to set up the entire backend

-- ============================================================================
-- STEP 1: Initial Schema Setup
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolios table
CREATE TABLE portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  image_url TEXT NOT NULL,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interactions table
CREATE TABLE interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'comment')),
  content TEXT, -- Only used for comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_category ON portfolios(category);
CREATE INDEX idx_portfolios_created_at ON portfolios(created_at DESC);
CREATE INDEX idx_interactions_portfolio_id ON interactions(portfolio_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_type ON interactions(type);

-- Create unique index to prevent duplicate likes
CREATE UNIQUE INDEX idx_unique_likes ON interactions(portfolio_id, user_id) WHERE type = 'like';

-- ============================================================================
-- STEP 2: Row Level Security Policies
-- ============================================================================

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Portfolios RLS Policies
CREATE POLICY "Portfolios are viewable by everyone" ON portfolios
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own portfolios" ON portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios" ON portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios" ON portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Interactions RLS Policies
CREATE POLICY "Interactions are viewable by everyone" ON interactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert interactions" ON interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" ON interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions or portfolio owners can delete comments" ON interactions
  FOR DELETE USING (
    auth.uid() = user_id OR 
    (type = 'comment' AND auth.uid() IN (
      SELECT user_id FROM portfolios WHERE id = portfolio_id
    ))
  );

-- ============================================================================
-- STEP 3: Functions and Triggers
-- ============================================================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at on profiles and portfolios
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_portfolio_views(portfolio_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE portfolios 
  SET view_count = view_count + 1 
  WHERE id = portfolio_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get portfolio with interaction counts
CREATE OR REPLACE FUNCTION public.get_portfolio_with_stats(portfolio_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title VARCHAR(200),
  description TEXT,
  category VARCHAR(50),
  image_url TEXT,
  tags TEXT[],
  is_featured BOOLEAN,
  view_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  like_count BIGINT,
  comment_count BIGINT,
  user_has_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.title,
    p.description,
    p.category,
    p.image_url,
    p.tags,
    p.is_featured,
    p.view_count,
    p.created_at,
    p.updated_at,
    COALESCE(likes.like_count, 0) as like_count,
    COALESCE(comments.comment_count, 0) as comment_count,
    COALESCE(user_like.user_has_liked, false) as user_has_liked
  FROM portfolios p
  LEFT JOIN (
    SELECT portfolio_id, COUNT(*) as like_count
    FROM interactions 
    WHERE type = 'like'
    GROUP BY portfolio_id
  ) likes ON p.id = likes.portfolio_id
  LEFT JOIN (
    SELECT portfolio_id, COUNT(*) as comment_count
    FROM interactions 
    WHERE type = 'comment'
    GROUP BY portfolio_id
  ) comments ON p.id = comments.portfolio_id
  LEFT JOIN (
    SELECT portfolio_id, true as user_has_liked
    FROM interactions 
    WHERE type = 'like' AND user_id = auth.uid()
  ) user_like ON p.id = user_like.portfolio_id
  WHERE p.id = portfolio_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: Storage Setup
-- ============================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('portfolios', 'portfolios', true);

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for portfolios bucket
CREATE POLICY "Portfolio images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolios');

CREATE POLICY "Authenticated users can upload portfolio images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolios' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own portfolio images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolios' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own portfolio images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolios' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- Setup Complete!
-- ============================================================================

-- Your Supabase backend is now ready for the Portfolio Showcase Platform
-- Next steps:
-- 1. Configure your environment variables in your frontend application
-- 2. Enable email authentication in Supabase Auth settings
-- 3. Test the setup by creating a user and some sample data