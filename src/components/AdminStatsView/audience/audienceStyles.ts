import styled from 'styled-components';
import { theme } from '@/lib/theme';

/* Same visual language as the רבי־בוט / nearby cards. */
export {
  Card, TitleRow, TitleIcon, CardTitle, CardSub, Kpi, KpiValue, KpiLabel, DeltaTag, Empty, Section, SectionTitle,
} from '../rabbiBot/adminBotStyles';

export const Stack = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

/** Six KPIs: 3 per row on wide screens, 2 on phones. */
export const Kpis6 = styled.div`
  display: grid; grid-template-columns: repeat(6, 1fr); gap: ${theme.spacing.sm};
  @media (max-width: 960px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 520px) { grid-template-columns: repeat(2, 1fr); }
`;

/** Four KPIs in a row, 2 on phones. */
export const Kpis4 = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: ${theme.spacing.sm};
  @media (max-width: 520px) { grid-template-columns: repeat(2, 1fr); }
`;

export const KpiSub = styled.span`font-size: 0.7rem; color: ${theme.colors.textLight}; font-variant-numeric: tabular-nums;`;

/** A text cell in a numbers table (campaign source). */
export const TextCell = styled.td`
  && { font-family: inherit; font-weight: 600; color: ${theme.colors.textMuted}; }
`;
