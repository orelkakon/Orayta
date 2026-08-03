'use client';

import { LineIcon } from '@/components/common/LineIcons';
import { HE } from '@/lib/hebrewTexts';
import { STORY_ART } from '@/lib/stories';
import type { StoryContent } from '@/lib/storyImage';
import type { DailyStory } from '@/types';
import * as P from './StoryCardParts';

/** The inner content of one story card — layout varies per category. */
export function StoryCardBody({ story }: { story: DailyStory }) {
  const accent = STORY_ART[story.key].accent;
  switch (story.key) {
    case 'rabbi': {
      const r = story.data;
      return (<>
        {r.imageUrl
          ? <P.RabbiPhoto src={r.imageUrl} alt={r.name} />
          : <P.Medallion $accent={accent}><LineIcon name="user" size={40} /></P.Medallion>}
        <P.TitleText>{r.name}</P.TitleText>
        {r.fullName && <P.SubText>{r.fullName}</P.SubText>}
        <P.SourceChip>{r.datePeriod}</P.SourceChip>
        <P.MainText $size="1.02rem" $clamp={7}>{r.bio}</P.MainText>
      </>);
    }
    case 'citation': {
      const c = story.data;
      const l = c.locations[0];
      const src = l ? `${l.masechet} ${HE.STUDY_DAF} ${l.daf}${l.amud ? ` ${HE.STUDY_AMUD} ${l.amud}` : ''}` : null;
      return (<>
        <P.QuoteMark aria-hidden="true">”</P.QuoteMark>
        <P.MainText $size="1.34rem" $clamp={8}>{c.content}</P.MainText>
        <P.GoldRule />
        {src && <P.SourceChip>{src}</P.SourceChip>}
      </>);
    }
    case 'reel':
      return (<>
        <P.PlayRing $accent={accent}><P.PlayGlyph /></P.PlayRing>
        <P.TitleText>{HE.FEED_TITLE}</P.TitleText>
        <P.SubText>{HE.STORY_REEL_SUB}</P.SubText>
        {story.data.username && <P.SourceChip>@{story.data.username}</P.SourceChip>}
      </>);
    case 'parasha':
      return (<>
        <P.KickerText $accent={accent}>{HE.STORY_LABELS.parasha}</P.KickerText>
        <P.TitleText>{HE.STORY_PARASHA_PREFIX} {story.data.name}</P.TitleText>
        <P.GoldRule />
        <P.MainText $clamp={8}>{story.data.insight}</P.MainText>
      </>);
    case 'halacha':
      return (<>
        <P.Medallion $accent={accent}><LineIcon name="candle" size={38} /></P.Medallion>
        <P.MainText $clamp={8}>{story.data.text}</P.MainText>
        <P.GoldRule />
        <P.SourceChip>{story.data.source}</P.SourceChip>
      </>);
    case 'sikum': {
      const s = story.data;
      const mins = Math.max(1, Math.round(s.text.trim().split(/\s+/).length / 180));
      return (<>
        <P.KickerText $accent={accent}>{s.bookName}</P.KickerText>
        {s.title && <P.TitleText>{s.title}</P.TitleText>}
        <P.SourceChip>{HE.STORY_READ_TIME(mins)}</P.SourceChip>
        <P.MainText $size="1.02rem" $clamp={8}>{s.text}</P.MainText>
      </>);
    }
    case 'chidush': {
      const c = story.data;
      const src = [c.author, c.source].filter(Boolean).join(' · ');
      return (<>
        <P.Medallion $accent={accent}><LineIcon name="bulb" size={38} /></P.Medallion>
        <P.MainText $clamp={9}>{c.text}</P.MainText>
        {src && <><P.GoldRule /><P.SourceChip>{src}</P.SourceChip></>}
      </>);
    }
    case 'tale':
      return (<>
        <P.KickerText $accent={accent}>{HE.STORY_LABELS.tale}</P.KickerText>
        <P.TitleText>{story.data.title}</P.TitleText>
        <P.MainText $size="1.05rem" $clamp={10}>{story.data.text}</P.MainText>
        <P.SourceChip>{story.data.source}</P.SourceChip>
      </>);
    case 'gematria': {
      const g = story.data;
      return (<>
        <P.KickerText $accent={accent}>{HE.STORY_LABELS.gematria}</P.KickerText>
        <P.BigValue>{g.word} = {g.value}</P.BigValue>
        {g.matches.length > 0 && (<>
          <P.SubText>{HE.STORY_GEMATRIA_MATCHES}</P.SubText>
          <P.ChipsRow>{g.matches.map(w => <P.WordChip key={w}>{w}</P.WordChip>)}</P.ChipsRow>
        </>)}
      </>);
    }
    case 'daf':
      return (<>
        <P.Medallion $accent={accent}><LineIcon name="calendar" size={38} /></P.Medallion>
        <P.KickerText $accent={accent}>{HE.STORY_LABELS.daf}</P.KickerText>
        <P.TitleText>{story.data.display}</P.TitleText>
        <P.SubText>{HE.STORY_DAF_SUB}</P.SubText>
      </>);
  }
}

export interface StoryCta {
  label: string;
  href: string;
  external?: boolean;
}

export function storyCta(story: DailyStory): StoryCta | null {
  switch (story.key) {
    case 'rabbi':    return { label: HE.STORY_CTA_RABBI, href: '/rabbis' };
    case 'citation': return { label: HE.STORY_CTA_CITATION, href: '/study' };
    case 'reel':     return { label: HE.STORY_CTA_REEL, href: '/feed' };
    case 'parasha':  return { label: HE.STORY_CTA_PARASHA, href: '/today' };
    case 'sikum':    return { label: HE.STORY_CTA_SIKUM, href: '/sikumim' };
    case 'chidush':  return { label: HE.STORY_CTA_CHIDUSH, href: '/chidushim' };
    case 'gematria': return { label: HE.STORY_CTA_GEMATRIA, href: '/gematria' };
    case 'daf':      return { label: HE.STORY_CTA_DAF, href: story.data.url, external: true };
    default:         return null;
  }
}

/** Text stories share as branded story images via the existing canvas pipeline. */
export function storyShareContent(story: DailyStory): StoryContent | null {
  const accent = STORY_ART[story.key].accent;
  const badge = HE.STORY_LABELS[story.key];
  switch (story.key) {
    case 'rabbi':
      return { badge, title: story.data.name, text: story.data.bio, source: story.data.datePeriod, accent };
    case 'citation': {
      const l = story.data.locations[0];
      const source = l ? `${l.masechet} ${HE.STUDY_DAF} ${l.daf}${l.amud ? ` ${HE.STUDY_AMUD} ${l.amud}` : ''}` : undefined;
      return { badge, text: `"${story.data.content}"`, source, accent };
    }
    case 'parasha':
      return { badge, title: `${HE.STORY_PARASHA_PREFIX} ${story.data.name}`, text: story.data.insight, accent };
    case 'halacha':
      return { badge, text: story.data.text, source: story.data.source, accent };
    case 'chidush': {
      const source = [story.data.author, story.data.source].filter(Boolean).join(' · ');
      return { badge, text: story.data.text, source: source || undefined, accent };
    }
    case 'tale':
      return { badge, title: story.data.title, text: story.data.text, source: story.data.source, accent };
    default:
      return null;
  }
}
