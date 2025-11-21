import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to inbox by default
  redirect('/inbox');
}
