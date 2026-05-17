-- SQL Setup Script for Supabase Game Saves persistence
-- Run this in the Supabase SQL Editor to initialize or update your database

-- 1. Create the game_saves table if it does not exist
CREATE TABLE IF NOT EXISTS game_saves (
    player_id TEXT PRIMARY KEY,                       -- Unique player identifier (anonymous UUID/localstorage ID)
    state JSONB NOT NULL,                             -- Complete JSON-serialized game state (level, stats, inventory, achievements, etc.)
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Safely alter table to add columns in case the table existed previously with a different schema
ALTER TABLE game_saves ADD COLUMN IF NOT EXISTS state JSONB;
ALTER TABLE game_saves ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;

-- 4. Drop policy if it exists to avoid conflicts, then recreate it
DROP POLICY IF EXISTS "Public Game Saves" ON game_saves;

-- 5. Allow public reading, inserting, and updating of states
-- This is perfect for single-page standalone web RPGs where anyone can play and sync their progress
CREATE POLICY "Public Game Saves" ON game_saves
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
