'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SITE_URL } from '@/lib/siteUrl';
import OraytaLogo from '@/components/common/OraytaLogo';
import { QrSvg } from '@/components/PlayView/QrCode';

/**
 * The notice-board page itself: white paper, espresso ink, gold rules — the
 * same in both themes, since it is made for a printer. Every size is in cqw
 * (1% of the sheet's width), so the on-screen preview and the printed A4 are
 * the same drawing at two scales. Codes are 38mm wide on paper — readable
 * from a step away.
 */
const PAPER = theme.game.qrLight;
const INK = theme.game.qrDark;
const GOLD = theme.game.goldDeep;
const SOFT = `color-mix(in srgb, ${INK} 68%, ${PAPER})`;

const Paper = styled.div`
  container-type: inline-size;
  width: 100%; aspect-ratio: 210 / 297;
  background: ${PAPER}; color: ${INK}; direction: rtl;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
`;

const Inner = styled.div`
  height: 100%; padding: 4.5cqw;
  display: flex; flex-direction: column;
`;

const Frame = styled.div`
  flex: 1; min-height: 0; padding: 3.2cqw 5cqw 3cqw;
  display: flex; flex-direction: column; justify-content: space-between; gap: 1.6cqw;
  border: 0.5cqw solid ${GOLD}; outline: 0.16cqw solid ${GOLD}; outline-offset: 0.9cqw;
  border-radius: 1.6cqw;
`;

const Brand = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 3cqw;
  svg { width: 11cqw; height: 11cqw; flex: none; }
`;

const Word = styled.p`
  font-family: ${theme.fonts.body}; font-size: 8.6cqw; font-weight: 700; line-height: 1;
`;

const Line = styled.p`margin-top: 1cqw; font-size: 2.9cqw; font-weight: 500; color: ${SOFT};`;

const For = styled.p`
  text-align: center; font-family: ${theme.fonts.body}; font-size: 3.5cqw; font-weight: 700; color: ${GOLD};
`;

const Head = styled.div`
  text-align: center; padding: 1.6cqw 0;
  border-block: 0.16cqw solid ${GOLD};
  h2 { font-family: ${theme.fonts.body}; font-size: 5.6cqw; font-weight: 700; line-height: 1.15; color: ${INK}; }
  p { margin-top: 0.8cqw; font-size: 2.7cqw; font-weight: 500; color: ${SOFT}; }
`;

const Tiles = styled.ol`
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 1.8cqw;
`;

const Tile = styled.li`display: flex; align-items: center; gap: 4.5cqw;`;

const Code = styled.div<{ $w: number }>`
  flex: none; width: ${p => p.$w}cqw; height: ${p => p.$w}cqw; padding: ${p => p.$w * 0.045}cqw;
  background: ${PAPER}; border: 0.22cqw solid ${INK}; border-radius: 1.2cqw;
  svg { display: block; width: 100%; height: 100%; }
`;

const TileText = styled.div`
  flex: 1; min-width: 0;
  h3 { font-family: ${theme.fonts.body}; font-size: 5.6cqw; font-weight: 700; line-height: 1.1; color: ${INK}; }
  p { margin-top: 0.9cqw; font-size: 2.9cqw; line-height: 1.42; color: ${SOFT}; }
`;

const Num = styled.span`
  display: block; margin-bottom: 0.5cqw; line-height: 1;
  font-family: ${theme.fonts.body}; font-size: 2.6cqw; font-weight: 700; letter-spacing: 0.1em; color: ${GOLD};
`;

const Foot = styled.div`
  display: flex; align-items: center; gap: 3.5cqw;
  padding-top: 1.8cqw; border-top: 0.16cqw solid ${GOLD};
`;

const More = styled.div`
  flex: 1; min-width: 0;
  h4 { font-size: 2.5cqw; font-weight: 700; color: ${GOLD}; }
  p { margin-top: 0.6cqw; font-size: 2.55cqw; line-height: 1.55; color: ${INK}; }
`;

const Url = styled.p`
  margin-top: 0.9cqw; direction: ltr; text-align: right;
  font-family: ${theme.fonts.ui}; font-size: 2.5cqw; font-weight: 700; letter-spacing: 0.02em; color: ${INK};
`;

const Home = styled.div`
  flex: none; display: flex; flex-direction: column; align-items: center; gap: 0.6cqw;
  span { font-size: 2.1cqw; font-weight: 700; color: ${SOFT}; }
`;

const LETTERS = ['א', 'ב', 'ג'];

export default function PosterSheet({ name }: { name: string }) {
  const host = SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return (
    <Paper data-poster>
      <Inner>
        <Frame>
          <Brand>
            <OraytaLogo size={96} />
            <div>
              <Word>{HE.APP_NAME}</Word>
              <Line>{HE.POSTER_BRAND_LINE}</Line>
            </div>
          </Brand>

          {name && <For>{HE.POSTER_FOR(name)}</For>}

          <Head>
            <h2>{HE.POSTER_HEAD}</h2>
            <p>{HE.POSTER_HEAD_SUB}</p>
          </Head>

          <Tiles>
            {HE.POSTER_TILES.map((t, i) => (
              <Tile key={t.path}>
                <Code $w={18} role="img" aria-label={HE.POSTER_QR_ARIA(t.title)}>
                  <QrSvg value={`${SITE_URL}${t.path}`} />
                </Code>
                <TileText>
                  <Num aria-hidden="true">{LETTERS[i]}</Num>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </TileText>
              </Tile>
            ))}
          </Tiles>

          <Foot>
            <More>
              <h4>{HE.POSTER_MORE_TITLE}</h4>
              <p>{HE.POSTER_MORE.join(' · ')}</p>
              <Url>{host}</Url>
            </More>
            <Home>
              <Code $w={10} role="img" aria-label={HE.POSTER_QR_ARIA(HE.POSTER_HOME)}>
                <QrSvg value={SITE_URL} />
              </Code>
              <span>{HE.POSTER_HOME}</span>
            </Home>
          </Foot>
        </Frame>
      </Inner>
    </Paper>
  );
}
