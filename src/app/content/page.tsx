import AppLayout from '@/components/Layout/AppLayout';
import ContentsView from '@/components/ContentsView/ContentsView';
import SectionPing from '@/components/common/SectionPing';

export default function ContentPage() {
  return (
    <AppLayout>
      <SectionPing metric="content" />
      <ContentsView />
    </AppLayout>
  );
}
