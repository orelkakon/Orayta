'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';

const HEADER = 'לַמְנַצֵּחַ בִּנְגִינֹת מִזְמוֹר שִׁיר';

/* Psalm 67 — ordered v1…v7 (Hebrew right-to-left reading order) */
const VERSES = [
  { n: 'א', text: 'אֱלֹהִים יְחָנֵּנוּ וִיבָרְכֵנוּ יָאֵר פָּנָיו אִתָּנוּ סֶלָה' },
  { n: 'ב', text: 'לָדַעַת בָּאָרֶץ דַּרְכֶּךָ בְּכָל גּוֹיִם יְשׁוּעָתֶךָ' },
  { n: 'ג', text: 'יוֹדוּךָ עַמִּים אֱלֹהִים יוֹדוּךָ עַמִּים כֻּלָּם' },
  { n: 'ד', text: 'יִשְׂמְחוּ וִירַנְּנוּ לְאֻמִּים כִּי תִשְׁפֹּט עַמִּים מִישׁוֹר וּלְאֻמִּים בָּאָרֶץ תַּנְחֵם סֶלָה' },
  { n: 'ה', text: 'יוֹדוּךָ עַמִּים אֱלֹהִים יוֹדוּךָ עַמִּים כֻּלָּם' },
  { n: 'ו', text: 'אֶרֶץ נָתְנָה יְבוּלָהּ יְבָרְכֵנוּ אֱלֹהִים אֱלֹהֵינוּ' },
  { n: 'ז', text: 'יְבָרְכֵנוּ אֱלֹהִים וְיִירְאוּ אוֹתוֹ כָּל אַפְסֵי אָרֶץ' },
];

/* In RTL display: index 0 (v1) is rightmost, index 3 (v4) is center, index 6 (v7) is leftmost */
/* Branch x-positions in 560 viewbox — right side = v1, center = v4, left = v7             */
const BX = [519, 439, 359, 280, 201, 121, 41];   // branch x per verse
const FY = [118,  85,  55,  20,  55,  85, 118];   // flame tip y per verse
const AY = [230, 192, 154];                        // arm connection y on center pole (pairs 1/7, 2/6, 3/5)

const GOLD   = '#B8830F';
const GOLD_L = '#D4A520';
const GOLD_D = '#7A5A08';

const Wrap = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.lg};
`;

const HeaderBox = styled.div`
  text-align: center;
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  background: ${GOLD}14;
  border: 1px solid ${GOLD}40;
  border-radius: ${theme.radii.lg};
`;

const HeaderText = styled.p`
  font-family: ${theme.fonts.body};
  font-size: 1.1rem; font-weight: 600;
  color: ${GOLD_D};
  letter-spacing: 0.03em;
`;

const SVGWrap = styled.div`
  width: 100%; max-width: 560px;
  filter: drop-shadow(0 4px 16px ${GOLD}30);
`;

const VerseList = styled.div`
  width: 100%; display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  border: 1px solid ${GOLD}30; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${GOLD}08;
`;

const VerseRow = styled.div`
  display: flex; align-items: baseline; gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xs} 0;
  border-bottom: 1px dashed ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }
  direction: rtl;
`;

const VerseNum = styled.span`
  font-size: 0.72rem; font-weight: 700;
  color: ${GOLD}; min-width: 20px; flex-shrink: 0;
`;

const VerseText = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 0.95rem; color: ${theme.colors.text};
  line-height: 1.7;
`;

const Label = styled.div`
  font-size: 0.72rem; color: ${theme.colors.textMuted};
  text-align: center; letter-spacing: 0.04em;
`;

export default function MenorahPsalmView() {
  return (
    <Wrap>
      <HeaderBox>
        <HeaderText>{HEADER}</HeaderText>
      </HeaderBox>

      <SVGWrap>
        <svg
          viewBox="0 0 560 330"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="צורת המנורה — תהילים ס״ז"
        >
          {/* ── Base & stand ─────────────────────────────────── */}
          <rect x="40"  y="300" width="480" height="10" rx="5" fill={GOLD}/>
          <rect x="200" y="310" width="160" height="8"  rx="4" fill={GOLD_D}/>
          <rect x="220" y="318" width="120" height="6"  rx="3" fill={GOLD_D}/>

          {/* ── Central vertical pole ────────────────────────── */}
          <rect x="272" y="20" width="16" height="280" rx="6" fill={GOLD}/>

          {/* ── Outer arms (v1 right / v7 left) — connect at AY[0]=230 ── */}
          <path d={`M288,${AY[0]} H${BX[0]} V${FY[0]}`}
            stroke={GOLD} strokeWidth="10" fill="none"
            strokeLinecap="round" strokeLinejoin="round"/>
          <path d={`M272,${AY[0]} H${BX[6]} V${FY[6]}`}
            stroke={GOLD} strokeWidth="10" fill="none"
            strokeLinecap="round" strokeLinejoin="round"/>

          {/* ── Middle arms (v2 right / v6 left) — connect at AY[1]=192 ── */}
          <path d={`M288,${AY[1]} H${BX[1]} V${FY[1]}`}
            stroke={GOLD} strokeWidth="10" fill="none"
            strokeLinecap="round" strokeLinejoin="round"/>
          <path d={`M272,${AY[1]} H${BX[5]} V${FY[5]}`}
            stroke={GOLD} strokeWidth="10" fill="none"
            strokeLinecap="round" strokeLinejoin="round"/>

          {/* ── Inner arms (v3 right / v5 left) — connect at AY[2]=154 ── */}
          <path d={`M288,${AY[2]} H${BX[2]} V${FY[2]}`}
            stroke={GOLD} strokeWidth="10" fill="none"
            strokeLinecap="round" strokeLinejoin="round"/>
          <path d={`M272,${AY[2]} H${BX[4]} V${FY[4]}`}
            stroke={GOLD} strokeWidth="10" fill="none"
            strokeLinecap="round" strokeLinejoin="round"/>

          {/* ── Flame cups & numbers at top of each branch ───── */}
          {VERSES.map((v, i) => (
            <g key={i}>
              {/* Cup */}
              <ellipse cx={BX[i]} cy={FY[i]} rx="11" ry="7" fill={GOLD_L}/>
              {/* Flame glow */}
              <ellipse cx={BX[i]} cy={FY[i] - 10} rx="5" ry="8" fill="#F5A623" opacity="0.85"/>
              <ellipse cx={BX[i]} cy={FY[i] - 15} rx="3" ry="5" fill="#FFDE59" opacity="0.9"/>
              {/* Branch number */}
              <text
                x={BX[i]} y={FY[i] + 22}
                textAnchor="middle" fontSize="10" fill={GOLD_D}
                fontWeight="bold" fontFamily="sans-serif"
              >
                ({v.n})
              </text>
            </g>
          ))}
        </svg>
      </SVGWrap>

      <VerseList>
        {VERSES.map((v, i) => (
          <VerseRow key={i}>
            <VerseNum>({v.n})</VerseNum>
            <VerseText>{v.text}</VerseText>
          </VerseRow>
        ))}
      </VerseList>

      <Label>תהילים פרק ס״ז — צורת המנורה</Label>
    </Wrap>
  );
}
