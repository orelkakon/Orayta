import AppLayout from '@/components/Layout/AppLayout';
import RabbisView from '@/components/RabbisView/RabbisView';

interface Props {
  searchParams: { q?: string };
}

export default function RabbisPage({ searchParams }: Props) {
  return (
    <AppLayout>
      <RabbisView initialSearch={searchParams.q ?? ''} />
    </AppLayout>
  );
}
