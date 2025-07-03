// Rough estimate: 1 token ≈ 0.75 words or ~4 characters
export function estimateTokens(text: string): number {
  const approxTokenRatio = 4; // ~4 characters per token
  const cleanText = text.trim().replace(/\s+/g, " ");
  return Math.ceil(cleanText.length / approxTokenRatio);
}
