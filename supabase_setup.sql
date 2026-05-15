-- Create a table for game saves
CREATE TABLE IF NOT EXISTS game_saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id TEXT UNIQUE NOT NULL, -- This can be an anonymous ID from localstorage
    player_name TEXT,
    class TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    hp INTEGER,
    max_hp INTEGER,
    mp INTEGER,
    max_mp INTEGER,
    atk INTEGER,
    def INTEGER,
    potions INTEGER DEFAULT 2,
    companion TEXT,
    inventory_items JSONB,
    equipment JSONB,
    quests JSONB,
    karma INTEGER DEFAULT 0,
    achievements JSONB,
    relationships JSONB,
    narrative_node TEXT,
    perspective TEXT DEFAULT 'second',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;

-- Safely add new columns for updates to existing tables
ALTER TABLE game_saves ADD COLUMN IF NOT EXISTS karma INTEGER DEFAULT 0;
ALTER TABLE game_saves ADD COLUMN IF NOT EXISTS achievements JSONB;
ALTER TABLE game_saves ADD COLUMN IF NOT EXISTS relationships JSONB;
ALTER TABLE game_saves ADD COLUMN IF NOT EXISTS narrative_node TEXT;
ALTER TABLE game_saves ADD COLUMN IF NOT EXISTS perspective TEXT DEFAULT 'second';

-- Drop policy if it exists to avoid 42710 error, then recreate it
DROP POLICY IF EXISTS "Public Game Saves" ON game_saves;

-- Allow public access for this demo (or restrict by player_id if using auth)
CREATE POLICY "Public Game Saves" ON game_saves
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
