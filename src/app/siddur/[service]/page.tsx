import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AppLayout from '@/components/Layout/AppLayout';
import ServiceReader from '@/components/SiddurView/ServiceReader';
import SectionPing from '@/components/common/SectionPing';
import { SERVICE_IDS, getService, isServiceId } from '@/lib/siddur';

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
  return { title, description, alternates: { canonical: path }, openGraph: { title, description, url: path } };
}

export default function ServicePage({ params }: Params) {
  if (!isServiceId(params.service)) notFound();
  return (
    <AppLayout>
      <SectionPing metric="content" />
      <ServiceReader id={params.service} />
    </AppLayout>
  );
}
