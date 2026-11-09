import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServiceReader from '@/components/SiddurView/ServiceReader';
import SectionPing from '@/components/common/SectionPing';
import { SERVICE_IDS, getService, isServiceId } from '@/lib/siddur';
import { shareMeta } from '@/lib/og/meta';

interface Params { params: { service: string } }

export function generateStaticParams() {
  return SERVICE_IDS.map(service => ({ service }));
}

export function generateMetadata({ params }: Params): Metadata {
  if (!isServiceId(params.service)) return {};
  const s = getService(params.service);
  const title = `תפילת ${s.title} — נוסח עדות המזרח`;
  const description = `תפילת ${s.title} לימות החול בנוסח עדות המזרח: ${s.sections.map(x => x.title).join(', ')}.`;
  const path = `/siddur/${s.id}`;
  return { title, description, alternates: { canonical: path }, ...shareMeta(title, description, path, { p: 'siddur', s: s.id }) };
}

export default function ServicePage({ params }: Params) {
  if (!isServiceId(params.service)) notFound();
  return (
    <>
      <SectionPing metric="content" />
      <ServiceReader id={params.service} />
    </>
  );
}
