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
