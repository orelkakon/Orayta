import { redirect } from 'next/navigation';

export default function BooksPage() {
  redirect('/rabbis?tab=books');
}
