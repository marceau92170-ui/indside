-- Game templates (pre-built games)
CREATE TABLE IF NOT EXISTS game_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  color_from TEXT NOT NULL,
  color_to TEXT NOT NULL,
  question_count INTEGER DEFAULT 0
);

-- Template questions (pre-filled)
CREATE TABLE IF NOT EXISTS template_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES game_templates(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'yes_no',
  order_index INTEGER DEFAULT 0
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_by TEXT NOT NULL,
  template_id UUID REFERENCES game_templates(id),
  points_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'yes_no',
  points INTEGER DEFAULT 10,
  order_index INTEGER DEFAULT 0
);

-- Players
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  nickname TEXT NOT NULL,
  is_host BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  value BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, question_id)
);

-- Scores
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  points INTEGER DEFAULT 0,
  UNIQUE(player_id, room_id)
);

-- RLS
ALTER TABLE game_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public game_templates" ON game_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public template_questions" ON template_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public questions" ON questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public answers" ON answers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public scores" ON scores FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE scores;

-- Migration: sync game flow
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS current_question_index INT DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS question_phase TEXT DEFAULT 'answering';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS question_started_at TIMESTAMPTZ;
