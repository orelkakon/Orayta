'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';

const HEADER = 'לַמְנַצֵּחַ בִּנְגִינֹת מִזְמוֹר שִׁיר';

const VERSES = [
  { n: 'א', text: 'אֱלֹהִים יְחָנֵּנוּ וִיבָרְכֵנוּ יָאֵר פָּנָיו אִתָּנוּ סֶלָה' },
  { n: 'ב', text: 'לָדַעַת בָּאָרֶץ דַּרְכֶּךָ בְּכָל גּוֹיִם יְשׁוּעָתֶךָ' },
  { n: 'ג', text: 'יוֹדוּךָ עַמִּים אֱלֹהִים יוֹדוּךָ עַמִּים כֻּלָּם' },
  { n: 'ד', text: 'יִשְׂמְחוּ וִירַנְּנוּ לְאֻמִּים כִּי תִשְׁפֹּט עַמִּים מִישׁוֹר וּלְאֻמִּים בָּאָרֶץ תַּנְחֵם סֶלָה' },
  { n: 'ה', text: 'יוֹדוּךָ עַמִּים אֱלֹהִים יוֹדוּךָ עַמִּים כֻּלָּם' },
  { n: 'ו', text: 'אֶרֶץ נָתְנָה יְבוּלָהּ יְבָרְכֵנוּ אֱלֹהִים אֱלֹהֵינוּ' },
  { n: 'ז', text: 'יְבָרְכֵנוּ אֱלֹהִים וְיִירְאוּ אוֹתוֹ כָּל אַפְסֵי אָרֶץ' },
];

/* Branch heights in px — outer shortest, center tallest */
const HEIGHTS = [130, 175, 220, 270, 220, 175, 130];

const Wrap = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.xl};
`;

const HeaderBox = styled.div`
  text-align: center; padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.surfaceAlt};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
`;

const HeaderText = styled.p`
  font-family: ${theme.fonts.body}; font-size: 1.1rem;
  color: ${theme.colors.textMuted}; font-style: italic;
`;

const MenorahOuter = styled.div`
  display: flex; flex-direction: column; align-items: center;
  width: 100%;
`;

const BranchesRow = styled.div`
  display: flex; align-items: flex-end; justify-content: center;
  gap: 2px;
  @media (max-width: 600px) { gap: 1px; }
`;

const Branch = styled.div<{ $h: number }>`
  display: flex; flex-direction: column; align-items: center;
  height: ${p => p.$h}px;
  width: 88px;
  @media (max-width: 600px) { width: 42px; }
`;

const Flame = styled.div`
  font-size: 1.1rem; line-height: 1; margin-bottom: 3px;
  @media (max-width: 600px) { font-size: 0.8rem; }
`;

const VerseNum = styled.div`
  font-size: 0.62rem; font-weight: 700;
  color: ${theme.colors.textLight};
  margin-bottom: 2px;
`;

const VerseText = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 0.68rem;
  color: ${theme.colors.text};
  text-align: center;
  line-height: 1.5;
  padding: 0 3px;
  direction: rtl;
  @media (max-width: 600px) { font-size: 0.55rem; padding: 0 1px; }
`;

const Pole = styled.div`
  flex: 1; width: 5px; margin-top: 6px;
  background: linear-gradient(to bottom, ${theme.colors.secondary}CC, ${theme.colors.primary});
  border-radius: 3px 3px 0 0;
`;

const Base = styled.div`
  width: 100%; height: 10px;
  background: linear-gradient(90deg, ${theme.colors.primary}55, ${theme.colors.primary}, ${theme.colors.primary}55);
  border-radius: ${theme.radii.sm};
`;

const Stem = styled.div`
  width: 14px; height: 32px;
  background: ${theme.colors.primary};
`;

const Stand = styled.div`
  width: 140px; height: 12px;
  background: ${theme.colors.primary};
  border-radius: 0 0 ${theme.radii.md} ${theme.radii.md};
  box-shadow: 0 4px 12px ${theme.colors.primary}40;
`;

const PsalmLabel = styled.div`
  font-size: 0.75rem; color: ${theme.colors.textMuted};
  text-align: center; letter-spacing: 0.04em;
`;

export default function MenorahPsalmView() {
  return (
    <Wrap>
      <HeaderBox>
        <HeaderText>{HEADER}</HeaderText>
      </HeaderBox>

      <MenorahOuter>
        <BranchesRow>
          {VERSES.map((v, i) => (
            <Branch key={i} $h={HEIGHTS[i]}>
              <Flame>🕯️</Flame>
              <VerseNum>({v.n})</VerseNum>
              <VerseText>{v.text}</VerseText>
              <Pole />
            </Branch>
          ))}
        </BranchesRow>
        <Base />
        <Stem />
        <Stand />
      </MenorahOuter>

      <PsalmLabel>תהילים פרק ס״ז · מנורת המזמור</PsalmLabel>
    </Wrap>
  );
}
