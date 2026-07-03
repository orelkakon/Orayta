import AppLayout from '@/components/Layout/AppLayout';
import ChidushimView from '@/components/ChidushimView/ChidushimView';

interface Props { searchParams: { q?: string } }

export default function ChidushimPage({ searchParams }: Props) {
  return (
    <AppLayout>
      <ChidushimView initialSearch={searchParams.q ?? ''} />
    </AppLayout>
  );
}
