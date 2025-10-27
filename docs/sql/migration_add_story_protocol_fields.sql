-- Migration: Add Story Protocol fields to pieces table
-- Run this if you already have an existing pieces table

-- Add Story Protocol IP Asset fields
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS ip_id TEXT UNIQUE;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS transaction_hash TEXT;

-- Add IPFS Metadata URIs
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS ip_metadata_uri TEXT;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS ip_metadata_hash TEXT;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS nft_metadata_uri TEXT;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS nft_metadata_hash TEXT;

-- Add license price field
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS license_price DECIMAL(10, 2);

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_pieces_ip_id ON pieces(ip_id) WHERE ip_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pieces_token_id ON pieces(token_id) WHERE token_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN pieces.ip_id IS 'Story Protocol IP Asset ID (unique identifier for registered IP)';
COMMENT ON COLUMN pieces.transaction_hash IS 'Blockchain transaction hash from Story Protocol registration';
COMMENT ON COLUMN pieces.ip_metadata_uri IS 'IPFS URI for IP metadata (includes creators, title, description)';
COMMENT ON COLUMN pieces.ip_metadata_hash IS 'SHA-256 hash of IP metadata for verification';
COMMENT ON COLUMN pieces.nft_metadata_uri IS 'IPFS URI for NFT metadata (ERC-721 standard)';
COMMENT ON COLUMN pieces.nft_metadata_hash IS 'SHA-256 hash of NFT metadata for verification';
COMMENT ON COLUMN pieces.license_price IS 'License price in $IP tokens for using this IP asset';
