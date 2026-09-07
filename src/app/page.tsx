import { redirect } from 'next/navigation';

/** The dashboard lives at /dashboard; "/" redirects for convenience. */
export default function RootPage() {
  redirect('/dashboard');
}
