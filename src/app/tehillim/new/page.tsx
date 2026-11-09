import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import CreateForm from '@/components/TehillimView/create/CreateForm';
import { Page } from '@/components/TehillimView/styles';
import { HE } from '@/lib/hebrewTexts';
import { PURPOSES, NAME_MAX } from '@/lib/tehillim/rules';
import type { TehillimPurpose } from '@/types/tehillim';
import { shareMeta } from '@/lib/og/meta';

export const metadata: Metadata = {
  title: HE.TH_NEW_TITLE,
  description: HE.TH_PAGE_DESC,
  robots: { index: false },
  ...shareMeta(HE.TH_NEW_TITLE, HE.TH_PAGE_DESC, '/tehillim/new', { p: 'tehillim' }),
};

interface Props { searchParams: { for?: string; name?: string } }

/** `?for=neshama&name=…` pre-fills the form (e.g. from a tzadik's hilula). */
export default function NewTehillimPage({ searchParams }: Props) {
  const purpose = PURPOSES.includes(searchParams.for as TehillimPurpose) ? searchParams.for as TehillimPurpose : undefined;
  const name = (searchParams.name ?? '').slice(0, NAME_MAX);
  return (
    <Page>
      <PageHeader title={HE.TH_NEW_TITLE} subtitle={HE.TH_NEW_SUB} icon="scroll" />
      <CreateForm initialPurpose={purpose} initialName={name} />
    </Page>
  );
}
