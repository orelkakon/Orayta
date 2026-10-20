'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FeedComment, FeedCommentsPage, FeedCommentCreated, FeedCommentsTarget } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { validateComment } from '@/lib/feedComments';
import { loadCommentTokens, rememberCommentToken, forgetCommentToken } from './commentStorage';

type Status = 'loading' | 'ready' | 'error';

const errorText = (code: string) => HE.COMMENTS_ERRORS[code] ?? HE.COMMENTS_ERRORS.generic;

/**
 * One post's comment thread: paged loading, posting and deleting.
 * `onTotal` reports the authoritative count back so the feed's badge stays
 * in sync without refetching the feed.
 */
export function useCommentThread(target: FeedCommentsTarget, onTotal: (n: number) => void) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>({});

  const base = `/api/feed/comments?type=${target.type}&id=${encodeURIComponent(target.id)}`;

  const applyTotal = useCallback((n: number) => { setTotal(n); onTotal(n); }, [onTotal]);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetch(base, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const page = await res.json() as FeedCommentsPage;
      setComments(page.comments);
      setCursor(page.nextCursor);
      applyTotal(page.total);
      setStatus('ready');
    } catch { setStatus('error'); }
  }, [base, applyTotal]);

  useEffect(() => { setTokens(loadCommentTokens()); void load(); }, [load]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`${base}&cursor=${encodeURIComponent(cursor)}`, { cache: 'no-store' });
      if (res.ok) {
        const page = await res.json() as FeedCommentsPage;
        setComments(prev => {
          const seen = new Set(prev.map(c => c.id));
          return [...prev, ...page.comments.filter(c => !seen.has(c.id))];
        });
        setCursor(page.nextCursor);
      }
    } finally { setLoadingMore(false); }
  }, [base, cursor, loadingMore]);

  /** Returns a Hebrew error message, or null on success. */
  const post = useCallback(async (name: string, text: string, website: string): Promise<string | null> => {
    const v = validateComment(name, text);
    if (!v.ok) return errorText(v.error);
    try {
      const res = await fetch('/api/feed/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: target.type, id: target.id, name: v.name ?? '', text: v.text, website }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        return errorText(err.error ?? 'generic');
      }
      const { comment, token } = await res.json() as FeedCommentCreated;
      rememberCommentToken(comment.id, token);
      setTokens(prev => ({ ...prev, [comment.id]: token }));
      setComments(prev => [comment, ...prev]);
      setFreshId(comment.id);
      applyTotal(total + 1);
      return null;
    } catch { return errorText('generic'); }
  }, [target, total, applyTotal]);

  const remove = useCallback(async (id: string) => {
    const prev = comments;
    setComments(cs => cs.filter(c => c.id !== id));
    applyTotal(Math.max(0, total - 1));
    const res = await fetch(`/api/feed/comments/${id}`, {
      method: 'DELETE',
      headers: tokens[id] ? { 'x-comment-token': tokens[id] } : {},
    }).catch(() => null);
    if (res?.ok) { forgetCommentToken(id); return; }
    setComments(prev);           // roll back the optimistic removal
    applyTotal(total);
  }, [comments, total, tokens, applyTotal]);

  return { comments, total, status, hasMore: cursor !== null, loadingMore, freshId, tokens, load, loadMore, post, remove };
}
