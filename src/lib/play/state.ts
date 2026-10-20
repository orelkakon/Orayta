import type {
  PlayBoardEntry, PlayMe, PlayQuestion, PlaySettings, PlayState, PlayStatus,
} from '@/types/play';
import { GRACE_MS, questionWindow, rankOf } from './rules';

/**
 * Turns one DB snapshot of a game into what a given viewer may see (pure —
 * tested). The correct answer and anyone's correctness stay hidden until the
 * question is revealed; secrets (key hashes) never leave this module.
 */
export interface SnapPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  kicked: boolean;
}

export interface SnapAnswer {
  playerId: string;
  choice: number;
  correct: boolean;
  points: number;
}

export interface Snapshot {
  id: string;
  code: string;
  status: PlayStatus;
  current: number;
  phaseAt: number;
  questionMs: number;
  version: number;
  settings: PlaySettings;
  questions: PlayQuestion[];
  players: SnapPlayer[];
  /** Answers to the current question only. */
  answers: SnapAnswer[];
}

export interface Viewer { playerId?: string; isHost: boolean; }

const BOARD_SIZE = 10;
const ROSTER_SIZE = 100;

export function activePlayers(s: Snapshot): SnapPlayer[] {
  return s.players.filter(p => !p.kicked);
}

/** True once the current question should flip to reveal on its own. */
export function shouldAutoReveal(s: Snapshot, now: number): boolean {
  if (s.status !== 'question') return false;
  const q = s.questions[s.current];
  if (!q) return false;
  const { endsAt } = questionWindow(s.phaseAt, q.leadMs, s.questionMs);
  if (now > endsAt + GRACE_MS) return true;
  const active = activePlayers(s);
  const answered = new Set(s.answers.map(a => a.playerId));
  return active.length > 0 && active.every(p => answered.has(p.id));
}

function board(s: Snapshot, players: SnapPlayer[]): PlayBoardEntry[] {
  const pts = new Map(s.answers.map(a => [a.playerId, a.points]));
  const before = players.map(p => ({ p, score: p.score - (pts.get(p.id) ?? 0) }));
  const now = rankOf(players);
  const prev = rankOf(before);
  const prevOf = new Map(before.map(b => [b.p.id, prev.get(b)!]));
  return [...players]
    .sort((a, b) => now.get(a)! - now.get(b)!)
    .map(p => ({
      id: p.id, name: p.name, avatar: p.avatar, score: p.score,
      rank: now.get(p)!, prevRank: prevOf.get(p.id)!, delta: pts.get(p.id) ?? 0,
    }));
}

function me(s: Snapshot, players: SnapPlayer[], ranked: PlayBoardEntry[], playerId: string): PlayMe | null {
  const p = s.players.find(x => x.id === playerId);
  if (!p) return null;
  const answer = s.answers.find(a => a.playerId === p.id);
  const revealed = s.status !== 'question';
  const mine = ranked.find(r => r.id === p.id);
  const above = mine ? ranked.filter(r => r.rank < mine.rank).pop() : undefined;
  return {
    id: p.id, name: p.name, avatar: p.avatar, score: p.score, streak: p.streak, kicked: p.kicked,
    rank: mine?.rank ?? players.length + 1,
    answered: !!answer,
    choice: answer?.choice ?? null,
    correct: revealed && answer ? answer.correct : revealed && s.current >= 0 ? false : null,
    points: revealed ? answer?.points ?? 0 : null,
    gapUp: above ? above.score - p.score : null,
  };
}

export function buildState(s: Snapshot, viewer: Viewer, now: number): PlayState {
  const players = activePlayers(s);
  const q = s.current >= 0 ? s.questions[s.current] : undefined;
  const live = s.status === 'question' || s.status === 'reveal';
  const shown = s.status === 'reveal' || s.status === 'board' || s.status === 'ended';
  const ranked = board(s, players);
  const win = q && s.status === 'question'
    ? questionWindow(s.phaseAt, q.leadMs, s.questionMs)
    : { opensAt: s.phaseAt, endsAt: s.phaseAt };
  const counts = q ? q.options.map((_, i) => s.answers.filter(a => a.choice === i).length) : [];
  const activeIds = new Set(players.map(p => p.id));

  return {
    code: s.code,
    status: s.status,
    version: s.version,
    serverNow: now,
    total: s.questions.length,
    current: s.current,
    settings: s.settings,
    playerCount: players.length,
    answeredCount: s.answers.filter(a => activeIds.has(a.playerId)).length,
    roster: viewer.isHost || s.status === 'lobby'
      ? players.slice(0, ROSTER_SIZE).map(p => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score }))
      : [],
    question: q && live
      ? { index: s.current, kind: q.kind, prompt: q.prompt, body: q.body, options: q.options, shownAt: s.phaseAt, ...win }
      : null,
    reveal: q && shown && s.status !== 'ended' ? { correct: q.correct, counts, explain: q.explain } : null,
    board: shown ? ranked.slice(0, BOARD_SIZE) : [],
    me: viewer.playerId ? me(s, players, ranked, viewer.playerId) : null,
    isHost: viewer.isHost,
  };
}
