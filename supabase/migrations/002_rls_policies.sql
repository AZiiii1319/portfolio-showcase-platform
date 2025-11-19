-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Portfolios RLS Policies
-- Everyone can view portfolios
CREATE POLICY "Portfolios are viewable by everyone" ON portfolios
  FOR SELECT USING (true);

-- Users can insert their own portfolios
CREATE POLICY "Users can insert their own portfolios" ON portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own portfolios
CREATE POLICY "Users can update their own portfolios" ON portfolios
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own portfolios
CREATE POLICY "Users can delete their own portfolios" ON portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Interactions RLS Policies
-- Everyone can view interactions
CREATE POLICY "Interactions are viewable by everyone" ON interactions
  FOR SELECT USING (true);

-- Authenticated users can insert interactions
CREATE POLICY "Authenticated users can insert interactions" ON interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own interactions
CREATE POLICY "Users can update their own interactions" ON interactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own interactions OR portfolio owners can delete comments on their portfolios
CREATE POLICY "Users can delete their own interactions or portfolio owners can delete comments" ON interactions
  FOR DELETE USING (
    auth.uid() = user_id OR 
    (type = 'comment' AND auth.uid() IN (
      SELECT user_id FROM portfolios WHERE id = portfolio_id
    ))
  );