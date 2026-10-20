import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AppLayout from '@/components/Layout/AppLayout';
import LearnReader from '@/components/LearnView/LearnReader';
import SectionPing from '@/components/common/SectionPing';
import { LEARN_KINDS, isLearnKind, learnKind } from '@/lib/dailyLearning/kinds';

interface Params { params: { kind: string } }

export function generateStaticParams() {
  return LEARN_KINDS.map(k => ({ kind: k.kind }));
}

export function generateMetadata({ params }: Params): Metadata {
  if (!isLearnKind(params.kind)) return {};
  const { label } = learnKind(params.kind);
  const title = `${label} — הלימוד של היום`;
  const description = `${label}: הלימוד היומי של היום לקריאה באתר, מתוך לוח הלימוד של ספריא.`;
  const path = `/today/learn/${params.kind}`;
  return { title, description, alternates: { canonical: path }, openGraph: { title, description, url: path } };
}

export default function LearnPage({ params }: Params) {
  if (!isLearnKind(params.kind)) notFound();
  return (
    <AppLayout>
      <SectionPing metric="today" />
      <LearnReader kind={params.kind} />
    </AppLayout>
  );
}
