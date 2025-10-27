-- Migration: Add network field to pieces table
-- This allows distinguishing between mainnet and testnet IP assets

-- Add network field
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS network TEXT DEFAULT 'mainnet';

-- Add index for filtering by network
CREATE INDEX IF NOT EXISTS idx_pieces_network ON pieces(network);

-- Add comment
COMMENT ON COLUMN pieces.network IS 'Blockchain network: mainnet, aeneid (testnet), etc.';

-- Update existing records to mainnet (if any)
UPDATE pieces SET network = 'mainnet' WHERE network IS NULL;
