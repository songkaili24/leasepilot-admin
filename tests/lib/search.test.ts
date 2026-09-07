import { describe, expect, it } from 'vitest';
import { searchEverything } from '@/lib/search';

describe('searchEverything (global command-bar search)', () => {
  it('requires at least two characters before searching', () => {
    expect(searchEverything('s')).toEqual([]);
    expect(searchEverything('')).toEqual([]);
  });

  it('finds leases by tenant name and tags the hit as a Tenant', () => {
    const hits = searchEverything('sterling');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].kind).toBe('Tenant');
    expect(hits[0].label).toContain('Sterling & Choate LLP');
    expect(hits[0].href).toMatch(/^\/leases\/l-\d+$/);
  });

  it('finds leases by lease number and tags the hit as a Lease', () => {
    const hits = searchEverything('LV-2020-0117');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.kind === 'Lease')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(searchEverything('STERLING').length).toBe(searchEverything('sterling').length);
  });

  it('finds properties by name with a property deep link', () => {
    const hits = searchEverything('Beacon Medical Pavilion');
    const propertyHit = hits.find((h) => h.kind === 'Property');
    expect(propertyHit).toBeDefined();
    expect(propertyHit!.href).toBe('/properties/prop-3');
    expect(propertyHit!.sublabel).toContain('Evanston');
  });

  it('returns nothing for gibberish', () => {
    expect(searchEverything('zzzzqqqq')).toEqual([]);
  });

  it('caps results at the requested limit', () => {
    const hits = searchEverything('a', 3);
    expect(hits.length).toBeLessThanOrEqual(3);
  });
});
