import AppLayout from '@/components/Layout/AppLayout';
import SikumimView from '@/components/SikumimView/SikumimView';

interface Props { searchParams: { q?: string } }

export default function SikumimPage({ searchParams }: Props) {
  return (
    <AppLayout>
      <SikumimView initialSearch={searchParams.q ?? ''} />
    </AppLayout>
  );
}
