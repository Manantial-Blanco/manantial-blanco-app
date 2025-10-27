/**
 * Generate a provenance hash for a piece
 * This is a simple implementation - in production, you'd want to use a more robust method
 */
export async function generateProvenanceHash(data: {
  title: string;
  description: string;
  imageUrl: string;
  creatorWallet: string;
  timestamp: string;
}): Promise<string> {
  const content = JSON.stringify(data);

  // Use Web Crypto API if available
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  // Fallback for environments without crypto.subtle
  return `hash_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate a SHA-256 hash from a File object
 * @param file - File to hash
 * @returns Hex string hash with 0x prefix
 */
export async function generateFileHash(file: File): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
  }

  throw new Error('Web Crypto API not available');
}
