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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure user can only like a portfolio once
  UNIQUE(portfolio_id, user_id, type) WHERE type = 'like'
);

-- Create indexes for better performance
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_category ON portfolios(category);
CREATE INDEX idx_portfolios_created_at ON portfolios(created_at DESC);
CREATE INDEX idx_interactions_portfolio_id ON interactions(portfolio_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_type ON interactions(type);