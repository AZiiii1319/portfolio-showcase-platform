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