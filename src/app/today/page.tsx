import AppLayout from '@/components/Layout/AppLayout';
import TodayView from '@/components/TodayView/TodayView';
import SectionPing from '@/components/common/SectionPing';

export default function TodayPage() {
  return (
    <AppLayout>
      <SectionPing metric="today" />
      <TodayView />
    </AppLayout>
  );
}
