import FeedView from '@/components/FeedView/FeedView';
import SectionPing from '@/components/common/SectionPing';

export default function FeedPage() {
  return (
    <>
      <SectionPing metric="feed" />
      <FeedView />
    </>
  );
}
