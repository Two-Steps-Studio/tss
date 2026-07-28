-- User Integrations Schema for Discord and future providers
-- Run this in Supabase SQL Editor

-- Create user_integrations table
CREATE TABLE IF NOT EXISTS user_integrations (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'discord', 'github', 'steam', 'google', etc.
    provider_user_id TEXT NOT NULL, -- Discord ID, GitHub ID, etc.
    username TEXT, -- Discord username, GitHub username, etc.
    avatar TEXT, -- Avatar URL from provider
    access_token TEXT, -- OAuth access token (encrypted in production)
    refresh_token TEXT, -- OAuth refresh token (encrypted in production)
    token_expires_at TIMESTAMP WITH TIME ZONE, -- Token expiration time
    metadata JSONB DEFAULT '{}', -- Additional provider-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider), -- One integration per provider per user
    UNIQUE(provider, provider_user_id) -- One Discord account per user
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_provider ON user_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_user_integrations_provider_user_id ON user_integrations(provider_user_id);

-- Enable RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own integrations
CREATE POLICY "Users can view own integrations"
ON user_integrations FOR SELECT
USING (auth.uid()::text = user_id);

-- Users can insert their own integrations
CREATE POLICY "Users can insert own integrations"
ON user_integrations FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own integrations
CREATE POLICY "Users can update own integrations"
ON user_integrations FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own integrations
CREATE POLICY "Users can delete own integrations"
ON user_integrations FOR DELETE
USING (auth.uid()::text = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_integrations_updated_at
BEFORE UPDATE ON user_integrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Verify table creation
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_integrations' 
ORDER BY ordinal_position;
