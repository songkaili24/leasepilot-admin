import { afterEach, describe, expect, it, vi } from 'vitest';

const ENV_KEY = 'NEXT_PUBLIC_SITE_URL';
const originalValue = process.env[ENV_KEY];

afterEach(() => {
  if (originalValue === undefined) {
    delete process.env[ENV_KEY];
  } else {
    process.env[ENV_KEY] = originalValue;
  }
  vi.resetModules();
});

describe('seo BASE_URL fallback', () => {
  it('does not throw when NEXT_PUBLIC_SITE_URL is an empty string', async () => {
    process.env[ENV_KEY] = '';
    vi.resetModules();
    const { rootMetadata } = await import('@/lib/seo');
    expect(rootMetadata.metadataBase?.toString()).toBe('https://app.leasevault.com/');
  });

  it('does not throw when NEXT_PUBLIC_SITE_URL is whitespace only', async () => {
    process.env[ENV_KEY] = '   ';
    vi.resetModules();
    const { rootMetadata } = await import('@/lib/seo');
    expect(rootMetadata.metadataBase?.toString()).toBe('https://app.leasevault.com/');
  });

  it('uses NEXT_PUBLIC_SITE_URL when it is set to a real URL', async () => {
    process.env[ENV_KEY] = 'https://staging.leasevault.com';
    vi.resetModules();
    const { rootMetadata } = await import('@/lib/seo');
    expect(rootMetadata.metadataBase?.toString()).toBe('https://staging.leasevault.com/');
  });
});
