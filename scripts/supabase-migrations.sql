-- 1. Profiles table (auto-created on user signup)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_display_name ON profiles(display_name);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Anonymous'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_point_id INTEGER NOT NULL REFERENCES address_points(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_reviews_address_point_id ON reviews(address_point_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE UNIQUE INDEX idx_reviews_user_address ON reviews(user_id, address_point_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Review likes table (one like per user per review)
CREATE TABLE review_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX idx_review_likes_user_review ON review_likes(user_id, review_id);
CREATE INDEX idx_review_likes_review_id ON review_likes(review_id);

ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Review likes are viewable by everyone"
  ON review_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like reviews"
  ON review_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike reviews"
  ON review_likes FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Add saved columns to profiles (if not already present)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS saved JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS saved_homes JSONB DEFAULT '[]'::jsonb;

-- 5. RPC: Get reviewed addresses within a bounding box (for map heatmap)
CREATE OR REPLACE FUNCTION get_reviewed_addresses(
  p_south FLOAT,
  p_north FLOAT,
  p_west FLOAT,
  p_east FLOAT,
  p_min_reviews INT DEFAULT 1
)
RETURNS TABLE(
  address_point_id INT,
  address TEXT,
  streetname TEXT,
  latitude FLOAT,
  longitude FLOAT,
  average_rating NUMERIC,
  review_count BIGINT
) AS $$
  SELECT
    ap.id AS address_point_id,
    ap.address,
    ap.streetname,
    ap.latitude::FLOAT,
    ap.longitude::FLOAT,
    ROUND(AVG(r.rating), 2) AS average_rating,
    COUNT(r.id) AS review_count
  FROM address_points ap
  JOIN reviews r ON r.address_point_id = ap.id
  WHERE ap.latitude BETWEEN p_south AND p_north
    AND ap.longitude BETWEEN p_west AND p_east
  GROUP BY ap.id, ap.address, ap.streetname, ap.latitude, ap.longitude
  HAVING COUNT(r.id) >= p_min_reviews;
$$ LANGUAGE sql STABLE;
