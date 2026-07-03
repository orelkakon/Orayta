import AppLayout from '@/components/Layout/AppLayout';
import GematriaView from '@/components/GematriaView/GematriaView';

interface Props { searchParams: { q?: string } }

export default function GematriaPage({ searchParams }: Props) {
  return (
    <AppLayout>
      <GematriaView initialSearch={searchParams.q ?? ''} />
    </AppLayout>
  );
}
