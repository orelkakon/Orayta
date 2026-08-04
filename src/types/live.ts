/* "Live Torah" (שידור חי) types — YouTube channels and detected livestreams. */

/** A YouTube channel followed by the live section. */
export interface LiveChannel {
  id: string;
  channelId: string;
  name: string;
  url: string;
  /** Scraped channel avatar; null = never fetched, empty string = none found. */
  avatarUrl: string | null;
  active: boolean;
  createdAt: string;
}

/** One currently-active livestream, as detected from a channel's /live page. */
export interface LiveStream {
  channelId: string;
  channelName: string;
  videoId: string;
  title: string;
  thumbnail: string;
}

/** Cached result of a full sweep over all active live channels. */
export interface LiveSnapshot {
  checkedAt: number;
  streams: LiveStream[];
}
