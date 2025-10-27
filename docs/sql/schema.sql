-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pieces table
CREATE TABLE IF NOT EXISTS pieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  creator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Story Protocol IP Asset fields
  ip_id TEXT UNIQUE,                    -- Story Protocol IP Asset ID
  token_id TEXT,                         -- NFT Token ID
  token_contract TEXT,                   -- NFT Contract Address (SPG)
  transaction_hash TEXT,                 -- Blockchain transaction hash

  -- IPFS Metadata URIs
  ip_metadata_uri TEXT,                  -- IPFS URI for IP metadata
  ip_metadata_hash TEXT,                 -- SHA-256 hash of IP metadata
  nft_metadata_uri TEXT,                 -- IPFS URI for NFT metadata
  nft_metadata_hash TEXT,                -- SHA-256 hash of NFT metadata

  -- Legacy fields
  provenance_hash TEXT NOT NULL,         -- Original provenance hash (kept for compatibility)
  can_remix BOOLEAN DEFAULT false,       -- Whether remixing is allowed
  license_price DECIMAL(10, 2),          -- License price in $IP tokens

  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remixes table
CREATE TABLE IF NOT EXISTS remixes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_piece_id UUID NOT NULL REFERENCES pieces(id) ON DELETE CASCADE,
  remix_piece_id UUID NOT NULL REFERENCES pieces(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(original_piece_id, remix_piece_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pieces_creator ON pieces(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_pieces_tags ON pieces USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_pieces_created_at ON pieces(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pieces_ip_id ON pieces(ip_id) WHERE ip_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pieces_token_id ON pieces(token_id) WHERE token_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_remixes_original ON remixes(original_piece_id);
CREATE INDEX IF NOT EXISTS idx_remixes_remix ON remixes(remix_piece_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE remixes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Pieces policies
CREATE POLICY "Pieces are viewable by everyone"
  ON pieces FOR SELECT
  USING (true);

CREATE POLICY "Creators can insert their own pieces"
  ON pieces FOR INSERT
  WITH CHECK (
    creator_user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

CREATE POLICY "Creators can update their own pieces"
  ON pieces FOR UPDATE
  USING (
    creator_user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

CREATE POLICY "Creators can delete their own pieces"
  ON pieces FOR DELETE
  USING (
    creator_user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- Remixes policies
CREATE POLICY "Remixes are viewable by everyone"
  ON remixes FOR SELECT
  USING (true);

CREATE POLICY "Users can create remixes of remixable pieces"
  ON remixes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pieces 
      WHERE id = original_piece_id AND can_remix = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pieces_updated_at
  BEFORE UPDATE ON pieces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
