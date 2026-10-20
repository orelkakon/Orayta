import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { Glass, press } from './playStyles';

/** Form pieces shared by the join screen and the new-game setup. */
export const Card = styled(Glass)`
  width: 100%;
  max-width: 520px;
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  text-align: right;
`;
export const Label = styled.label`
  font-size: ${theme.fontSizes.sm};
  font-weight: 700;
  color: ${theme.game.inkMuted};
`;
export const Field = styled.input`
  width: 100%;
  min-height: 56px;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.radii.lg};
  border: 2px solid ${theme.game.glassLine};
  background: rgba(0,0,0,0.25);
  color: ${theme.game.ink};
  font-family: ${theme.fonts.ui};
  font-size: 1.15rem;
  outline: none;
  &:focus { border-color: ${theme.game.gold}; }
  &::placeholder { color: ${theme.game.inkFaint}; }
`;
export const PinField = styled(Field)`
  text-align: center;
  direction: ltr;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: 0.4em;
  padding-inline-start: 0.4em;
  font-variant-numeric: tabular-nums;
`;
export const Select = styled.select`
  width: 100%;
  min-height: 48px;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  border: 2px solid ${theme.game.glassLine};
  background: ${theme.game.stageSolid};
  color: ${theme.game.ink};
  font-family: ${theme.fonts.ui};
  font-size: ${theme.fontSizes.md};
`;
export const ErrorBox = styled.div`
  color: ${theme.game.ink};
  background: rgba(224,71,91,0.22);
  border: 1px solid ${theme.game.wrong};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.fontSizes.sm};
`;
export const Segments = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 6px;
  padding: 4px;
  border-radius: ${theme.radii.lg};
  background: rgba(0,0,0,0.25);
`;
export const Segment = styled.button<{ $on: boolean }>`
  ${press};
  min-height: 44px;
  border-radius: ${theme.radii.md};
  background: ${({ $on }) => ($on ? theme.game.gold : 'transparent')};
  color: ${({ $on }) => ($on ? theme.game.onGold : theme.game.ink)};
  font-family: ${theme.fonts.ui};
  font-weight: 700;
  font-size: ${theme.fontSizes.md};
  font-variant-numeric: tabular-nums;
`;
export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto ${theme.spacing.md};
  a { color: ${theme.game.inkMuted}; font-size: ${theme.fontSizes.sm}; text-decoration: none; }
  strong { font-family: ${theme.fonts.body}; color: ${theme.game.gold}; font-size: ${theme.fontSizes.lg}; }
`;
