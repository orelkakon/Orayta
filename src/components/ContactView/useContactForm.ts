'use client';

import { useEffect, useMemo, useState } from 'react';
import { CONTACT_LIMITS, ContactTopic, contactWaText, waLink } from '@/lib/contact';

export type ContactError = 'required' | 'rate' | 'mail' | 'generic';
export type ContactSent = { via: 'mail' | 'wa'; message: string; reply: boolean; href?: string } | null;

/** Form state, the live wa.me link and the two send paths of /contact. */
export function useContactForm() {
  const [topic, setTopic] = useState<ContactTopic | null>(null);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [rating, setRating] = useState(0);
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ContactError | null>(null);
  const [sent, setSent] = useState<ContactSent>(null);
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/contact').then(r => r.json() as Promise<{ wa: string | null }>)
      .then(d => { if (alive) setPhone(d.wa); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const trimmed = message.trim();
  const fields = {
    topic: topic ?? undefined, message: trimmed, name: name.trim() || undefined,
    replyTo: replyTo.trim() || undefined, rating: rating || undefined, website,
  };
  // Built on every keystroke so the WhatsApp button is a plain link: opening it
  // after an await is a blocked pop-up on iPhone.
  const waHref = useMemo(
    () => (phone && trimmed ? waLink(phone, contactWaText({ ...fields, message: trimmed })) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phone, trimmed, topic, name, rating],
  );
  const directWa = phone ? waLink(phone) : null;

  const post = (channel: 'wa' | 'email') => fetch('/api/contact', {
    method: 'POST', keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...fields, channel }),
  });

  const sendMail = async () => {
    if (!trimmed) { setError('required'); return; }
    setBusy(true); setError(null);
    try {
      const res = await post('email');
      if (res.ok) setSent({ via: 'mail', message: trimmed, reply: !!fields.replyTo });
      else setError(res.status === 429 ? 'rate' : res.status === 502 ? 'mail' : 'generic');
    } catch { setError('generic'); }
    setBusy(false);
  };

  /** Click handler of the WhatsApp link: the link itself opens the app. */
  const sendWa = (e: { preventDefault: () => void }) => {
    if (!trimmed || !waHref) { e.preventDefault(); setError(trimmed ? 'generic' : 'required'); return; }
    setError(null);
    post('wa').catch(() => {});
    window.setTimeout(() => setSent({ via: 'wa', message: trimmed, reply: true, href: waHref }), 400);
  };

  const reset = () => {
    setTopic(null); setMessage(''); setRating(0); setSent(null); setError(null);
  };

  return {
    topic, setTopic, message, setMessage: (v: string) => { setMessage(v.slice(0, CONTACT_LIMITS.message)); if (error === 'required') setError(null); },
    name, setName, replyTo, setReplyTo, rating, setRating, website, setWebsite,
    busy, error, sent, waHref, directWa, sendMail, sendWa, reset,
  };
}

export type ContactForm = ReturnType<typeof useContactForm>;
