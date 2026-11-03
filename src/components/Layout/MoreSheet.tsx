'use client';

import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import Sheet from '@/components/ui/Sheet';
import SearchField from '@/components/common/SearchField';
import { PRIMARY_NAV, NAV_GROUPS, NavItem } from './navItems';
import MoreGrid, { GroupTitle } from './MoreGrid';
import MoreSettings from './MoreSettings';

/**
 * "עוד" — everything that isn't a tab, as an app-launcher sheet: a search
 * box that finds any page or prayer by name or synonym, the destinations in
 * four groups, then settings (theme, notifications, accessibility) and admin.
 */
const Empty = styled.p`
  padding: ${theme.spacing.xl} 0; text-align: center;
  color: ${theme.colors.textMuted}; font-size: ${theme.fontSizes.sm};
`;

const Results = styled.div`margin-top: ${theme.spacing.md};`;

/** Search-normalize Hebrew: no nikud/cantillation, no geresh/gershayim/quotes. */
function norm(s: string): string {
  return s.replace(/[\u0591-\u05C7]/g, '').replace(/["'\u05F3\u05F4\u05BE-]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

const ALL_ITEMS: NavItem[] = [...PRIMARY_NAV, ...NAV_GROUPS.flatMap(g => g.items)];

function search(query: string): NavItem[] {
  const words = norm(query).split(' ').filter(Boolean);
  if (words.length === 0) return [];
  const seen = new Set<string>();
  return ALL_ITEMS.filter(item => {
    const hay = norm(`${item.label} ${item.keywords ?? ''}`);
    const hit = words.every(w => hay.includes(w));
    const key = `${item.href}|${item.label}`;
    if (!hit || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

interface Props {
  open: boolean;
  onClose: () => void;
  pathname: string;
  isAdmin: boolean;
  onLogout: () => void;
  tickerOn: boolean;
  onTickerChange: (on: boolean) => void;
}

export default function MoreSheet({ open, onClose, pathname, isAdmin, onLogout, tickerOn, onTickerChange }: Props) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => search(query), [query]);
  const close = () => { setQuery(''); onClose(); };

  return (
    <Sheet open={open} onClose={close} title={HE.MORE_TITLE} tall maxWidth={620}>
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder={HE.MORE_SEARCH}
        ariaLabel={HE.MORE_SEARCH_ARIA}
        debounceMs={0}
      />
      {query.trim() ? (
        results.length > 0
          ? <Results><MoreGrid items={results} pathname={pathname} onNavigate={close} /></Results>
          : <Empty role="status">{HE.MORE_EMPTY}</Empty>
      ) : (
        <>
          {NAV_GROUPS.map(group => (
            <section key={group.id} aria-label={group.label}>
              <GroupTitle>{group.label}</GroupTitle>
              <MoreGrid items={group.items} pathname={pathname} onNavigate={close} />
            </section>
          ))}
          <MoreSettings
            isAdmin={isAdmin}
            onLogout={onLogout}
            tickerOn={tickerOn}
            onTickerChange={onTickerChange}
            onNavigate={close}
          />
        </>
      )}
    </Sheet>
  );
}
