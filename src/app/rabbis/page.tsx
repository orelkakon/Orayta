import AppLayout from '@/components/Layout/AppLayout';
import RabbisAndBooksView from '@/components/RabbisAndBooksView/RabbisAndBooksView';

interface Props {
  searchParams: { q?: string; tab?: string };
}

export default function RabbisPage({ searchParams }: Props) {
  const initialTab = searchParams.tab === 'books' ? 'books' : 'rabbis';
  return (
    <AppLayout>
      <RabbisAndBooksView initialTab={initialTab} initialSearch={searchParams.q ?? ''} />
    </AppLayout>
  );
}
