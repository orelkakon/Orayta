import AppLayout from '@/components/Layout/AppLayout';
import TalmudView from '@/components/TalmudView/TalmudView';

interface Props { searchParams: { masechet?: string } }

export default function StudyPage({ searchParams }: Props) {
  return (
    <AppLayout>
      <TalmudView initialMasechet={searchParams.masechet ?? ''} />
    </AppLayout>
  );
}
