import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

export const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.55); }
  70%      { box-shadow: 0 0 0 9px rgba(220,38,38,0); }
`;

export const Page = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.lg};
`;

export const Hero = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.xs}; text-align: center;
`;

export const HeroTitleRow = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
`;

export const LiveDot = styled.span.attrs({ className: 'anim-loop' })<{ $on: boolean }>`
  width: 13px; height: 13px; border-radius: 50%;
  background: ${p => (p.$on ? '#dc2626' : theme.colors.textLight)};
  ${p => p.$on && css`animation: ${pulse} 1.6s ease-out infinite;`}
`;

export const HeroTitle = styled.h1`
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.h1}; font-weight: 800; color: ${theme.colors.primary};
`;

export const HeroSub = styled.p`
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};
  line-height: 1.6; max-width: 48ch;
`;

export const CountChip = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(220,38,38,0.1); color: #dc2626;
  border: 1px solid rgba(220,38,38,0.35);
  font-size: ${theme.fontSizes.xs}; font-weight: 800;
  padding: 3px 12px; border-radius: 999px;
`;

export const Grid = styled.div`
  display: grid; width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: ${theme.spacing.sm};
  /* Phones always fit two cards side by side. */
  ${theme.media.sm} { grid-template-columns: repeat(2, 1fr); gap: ${theme.spacing.xs}; }
`;

export const EmptyCard = styled.div`
  width: 100%; max-width: 560px;
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.sm};
  text-align: center;
  background: ${theme.colors.surface};
  border: 1px dashed ${theme.colors.borderStrong};
  border-radius: ${theme.radii.xl};
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  color: ${theme.colors.textMuted};
`;

export const EmptyTitle = styled.p`
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.text};
`;

export const EmptySub = styled.p`
  font-size: ${theme.fontSizes.sm}; line-height: 1.6; max-width: 40ch;
`;

export const SectionTitle = styled.h2`
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.primary};
  margin-top: ${theme.spacing.sm};
`;

export const ChannelsRow = styled.div`
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: ${theme.spacing.md}; width: 100%;
`;

export const ChannelItem = styled.a<{ $live: boolean }>`
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  width: 96px; text-align: center;
  transition: transform ${theme.motion.fast} ease;
  &:hover { transform: translateY(-3px); }
`;

export const ChannelDisc = styled.span<{ $live: boolean }>`
  width: 62px; height: 62px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  font-family: ${theme.fonts.body}; font-size: 1.5rem; font-weight: 800;
  color: ${theme.colors.primary};
  background: radial-gradient(circle at 32% 28%, rgba(196,149,106,0.32), rgba(196,149,106,0.08));
  border: 2px solid ${p => (p.$live ? '#dc2626' : 'rgba(196,149,106,0.55)')};
  box-shadow: ${theme.shadows.sm};
`;

export const ChannelAvatarImg = styled.img`
  width: 100%; height: 100%; object-fit: cover; display: block;
`;

export const ChannelName = styled.span`
  font-size: ${theme.fontSizes.xs}; font-weight: 600; color: ${theme.colors.text};
  line-height: 1.3;
`;

export const ChannelLiveTag = styled.span`
  font-size: 0.6rem; font-weight: 900; letter-spacing: 0.12em;
  color: #dc2626;
`;
