-- 1. Add current_streak to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

-- 2. Create daily_game_guesses table
CREATE TABLE IF NOT EXISTS daily_game_guesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  guess INTEGER NOT NULL,
  actual_rating INTEGER NOT NULL,
  difference INTEGER NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Each user can only have one guess per movie
  UNIQUE(user_id, movie_id)
);

-- 3. Add RLS policies for daily_game_guesses
ALTER TABLE daily_game_guesses ENABLE ROW LEVEL SECURITY;

-- Users can insert their own guesses
CREATE POLICY "Users can insert their own guesses"
  ON daily_game_guesses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own guesses
CREATE POLICY "Users can view their own guesses"
  ON daily_game_guesses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Create function to update streaks daily
CREATE OR REPLACE FUNCTION reset_missing_daily_players()
RETURNS void AS $$
BEGIN
  -- Reset streaks for users who didn't play yesterday
  UPDATE profiles
  SET current_streak = 0
  WHERE id NOT IN (
    SELECT user_id 
    FROM daily_game_guesses 
    WHERE created_at > (NOW() - INTERVAL '1 day')
  ) AND current_streak > 0;
END;
$$ LANGUAGE plpgsql;
