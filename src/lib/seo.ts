import type { Metadata, Viewport } from 'next';
import { SITE_NAME } from './site';

interface PageMetaInput {
  /** Overrides the default title suffix. */
  title: string;
  description: string;
  /** Site-absolute path, e.g. "/leases". */
  path: string;
}

// `??` alone isn't enough: Vercel env vars can be set to an empty string,
// and `new URL('')` throws during page-data collection.
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://app.leasevault.com';

/** Shared metadata template — every route composes its page metadata through this. */
export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  const url = new URL(path, BASE_URL).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${title} · ${SITE_NAME}`,
      description,
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${SITE_NAME} — Lease Administration for Commercial Portfolios`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    'Digitize commercial lease agreements, track critical dates, and manage financial obligations across your entire commercial real estate portfolio.',
  keywords: [
    'lease administration',
    'commercial real estate',
    'lease abstracting',
    'critical dates',
    'CAM reconciliation',
    'portfolio management',
  ],
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    url: BASE_URL,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#1A2B4A',
  width: 'device-width',
  initialScale: 1,
};
