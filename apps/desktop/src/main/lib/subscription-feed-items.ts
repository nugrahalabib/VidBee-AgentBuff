export interface SubscriptionFeedItemLike {
  id: string
  title: string
  url: string
  publishedAt: number
  thumbnail?: string
  addedToQueue: boolean
  downloadId?: string
}

/**
 * Remove duplicate subscription feed items while keeping the first copy for each item id.
 *
 * @param items The ordered subscription feed items to normalize.
 * @returns The deduped feed items in their original order.
 */
export const dedupeSubscriptionFeedItems = <T extends SubscriptionFeedItemLike>(
  items: T[]
): T[] => {
  const seenIds = new Set<string>()
  const deduped: T[] = []

  for (const item of items) {
    if (seenIds.has(item.id)) {
      continue
    }

    seenIds.add(item.id)
    deduped.push(item)
  }

  return deduped
}
