/**
 * Token Tracker for Keepa API
 *
 * Monitors and limits Keepa API token usage to stay within budget.
 * The €49/month plan provides 20 tokens/minute = 28,800 tokens/day.
 *
 * Strategy: Maximize products with 1-2x daily updates
 * - 25,000 tokens for product updates
 * - 3,800 tokens buffer for discovery/errors
 */

// Token budget configuration
export const TOKEN_BUDGET = {
  // €49 plan limits
  TOKENS_PER_MINUTE: 20,
  TOKENS_PER_DAY: 28_800,

  // Simplified allocation (maximize products)
  DAILY_ALLOCATION: {
    updates: 25_000, // ~25,000 products with 1x daily refresh
    discovery: 2_000, // New product discovery
    buffer: 1_800, // Error handling buffer
  },

  // Safety thresholds
  WARNING_THRESHOLD: 0.85, // 85% of daily budget
  CRITICAL_THRESHOLD: 0.95, // 95% of daily budget
} as const;

// In-memory token tracking (resets on deploy)
let dailyTokensUsed = 0;
let lastResetDate = new Date().toDateString();

/**
 * Record token usage
 */
export function recordTokenUsage(tokens: number): void {
  const today = new Date().toDateString();

  // Reset counter on new day
  if (today !== lastResetDate) {
    dailyTokensUsed = 0;
    lastResetDate = today;
  }

  dailyTokensUsed += tokens;

  // Log warnings
  const percentUsed = dailyTokensUsed / TOKEN_BUDGET.TOKENS_PER_DAY;
  if (percentUsed >= TOKEN_BUDGET.CRITICAL_THRESHOLD) {
    console.error(
      `[Keepa Token Tracker] CRITICAL: ${Math.round(percentUsed * 100)}% of daily budget used!`,
    );
  } else if (percentUsed >= TOKEN_BUDGET.WARNING_THRESHOLD) {
    console.warn(
      `[Keepa Token Tracker] WARNING: ${Math.round(percentUsed * 100)}% of daily budget used`,
    );
  }
}

/**
 * Get current token usage status
 */
export function getTokenStatus(): {
  tokensUsedToday: number;
  tokensRemaining: number;
  percentUsed: number;
  canProceed: boolean;
} {
  const today = new Date().toDateString();

  // Reset counter on new day
  if (today !== lastResetDate) {
    dailyTokensUsed = 0;
    lastResetDate = today;
  }

  const tokensRemaining = TOKEN_BUDGET.TOKENS_PER_DAY - dailyTokensUsed;
  const percentUsed = dailyTokensUsed / TOKEN_BUDGET.TOKENS_PER_DAY;

  return {
    tokensUsedToday: dailyTokensUsed,
    tokensRemaining: Math.max(0, tokensRemaining),
    percentUsed,
    canProceed: percentUsed < TOKEN_BUDGET.CRITICAL_THRESHOLD,
  };
}

/**
 * Check if we have budget for a specific operation
 */
export function hasTokenBudget(requiredTokens: number): boolean {
  const { tokensRemaining, canProceed } = getTokenStatus();
  return canProceed && tokensRemaining >= requiredTokens;
}

/**
 * Get recommended batch size based on remaining budget
 * For maximum products strategy, we process larger batches
 */
export function getRecommendedBatchSize(): number {
  const { tokensRemaining, canProceed } = getTokenStatus();

  if (!canProceed) return 0;

  // Process up to 100 products per batch to stay efficient
  return Math.min(100, tokensRemaining);
}

/**
 * Get maximum products we can update today
 */
export function getMaxProductsToday(): number {
  const { tokensRemaining } = getTokenStatus();
  // Reserve some for discovery
  return Math.max(0, tokensRemaining - TOKEN_BUDGET.DAILY_ALLOCATION.discovery);
}
