const NON_ACTIONABLE_SUBSCRIPTION_ERROR_PATTERNS = [
  'Attribute without value',
  'Non-whitespace before first tag.',
  'Unexpected close tag',
  'Feed not recognized as RSS 1 or 2.',
  'Invalid character in entity name',
  'Invalid character in tag name',
  'Status code 403',
  'Status code 404',
  'Status code 429',
  'Status code 502',
  'Request timed out after 60000ms',
  'AggregateError',
  'read ECONNRESET',
  'socket hang up',
  'getaddrinfo ENOTFOUND',
  'connect EACCES',
  'net::ERR_CONNECTION_RESET',
  'net::ERR_TIMED_OUT',
  'net::ERR_NAME_NOT_RESOLVED',
  'net::ERR_PROXY_CONNECTION_FAILED',
  'net::ERR_INTERNET_DISCONNECTED',
  'Client network socket disconnected before secure TLS connection was established'
] as const

/**
 * Normalize a subscription error signal so pattern checks stay stable.
 */
const normalizeSubscriptionErrorSignal = (value: string): string => value.trim().toLowerCase()

/**
 * Collect normalized subscription error signals from unknown error input.
 */
const collectSubscriptionErrorSignals = (error: unknown): string[] => {
  const signals = new Set<string>()

  const addSignal = (value: unknown): void => {
    if (typeof value !== 'string') {
      return
    }
    const normalized = normalizeSubscriptionErrorSignal(value)
    if (normalized) {
      signals.add(normalized)
    }
  }

  if (typeof error === 'string') {
    addSignal(error)
    return [...signals]
  }

  if (error instanceof Error) {
    addSignal(error.name)
    addSignal(error.message)
    addSignal(error.stack)

    // Sentry issues VIDBEE-39 / VIDBEE-DA / VIDBEE-133 / VIDBEE-134 showed
    // that parser and transport failures can arrive with an empty message.
    if (error instanceof AggregateError) {
      for (const nestedError of error.errors) {
        for (const signal of collectSubscriptionErrorSignals(nestedError)) {
          signals.add(signal)
        }
      }
    }
  }

  return [...signals]
}

/**
 * Resolve the best display message for subscription failures.
 */
export const getSubscriptionCheckErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message || error.name || 'Unknown RSS error'
  }

  return 'Unknown RSS error'
}

/**
 * Returns true when a subscription check failure should be reported to Sentry.
 */
export const shouldCaptureSubscriptionCheckError = (error: unknown): boolean => {
  const signals = collectSubscriptionErrorSignals(error)
  return !NON_ACTIONABLE_SUBSCRIPTION_ERROR_PATTERNS.some((pattern) =>
    signals.some((signal) => signal.includes(pattern.toLowerCase()))
  )
}
