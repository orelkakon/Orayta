import HomeView from '@/components/HomeView/HomeView';
import SectionPing from '@/components/common/SectionPing';

export default function HomePage() {
  return (
    <>
      <SectionPing metric="home" />
      <HomeView />
    </>
  );
}
