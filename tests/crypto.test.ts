import { describe, it, expect } from 'vitest';
import { generateProvenanceHash } from '@/lib/crypto';

describe('crypto', () => {
  it('should generate a provenance hash', async () => {
    const hash = await generateProvenanceHash({
      title: 'Test Piece',
      description: 'Test Description',
      imageUrl: 'https://example.com/image.jpg',
      creatorWallet: '0x1234567890abcdef',
      timestamp: '2024-01-01T00:00:00Z',
    });

    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should generate different hashes for different data', async () => {
    const hash1 = await generateProvenanceHash({
      title: 'Piece 1',
      description: 'Description 1',
      imageUrl: 'https://example.com/1.jpg',
      creatorWallet: '0x1234567890abcdef',
      timestamp: '2024-01-01T00:00:00Z',
    });

    const hash2 = await generateProvenanceHash({
      title: 'Piece 2',
      description: 'Description 2',
      imageUrl: 'https://example.com/2.jpg',
      creatorWallet: '0x1234567890abcdef',
      timestamp: '2024-01-01T00:00:00Z',
    });

    expect(hash1).not.toBe(hash2);
  });
});
