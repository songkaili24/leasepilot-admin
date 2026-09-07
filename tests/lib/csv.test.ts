import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadCsv, toCsv } from '@/lib/csv';

describe('toCsv', () => {
  it('joins headers and rows with CRLF', () => {
    const csv = toCsv(
      ['a', 'b'],
      [
        ['1', '2'],
        ['3', '4'],
      ],
    );
    expect(csv).toBe('a,b\r\n1,2\r\n3,4');
  });

  it('quotes fields containing commas, quotes, and newlines (RFC 4180)', () => {
    const csv = toCsv(
      ['name', 'note'],
      [
        ['Halloran, Mercer', 'said "renew"'],
        ['multi\nline', 'plain'],
      ],
    );
    expect(csv).toContain('"Halloran, Mercer"');
    expect(csv).toContain('"said ""renew"""');
    expect(csv).toContain('"multi\nline"');
  });

  it('renders null and undefined as empty cells', () => {
    const csv = toCsv(['a', 'b', 'c'], [[null, undefined, 'x']]);
    expect(csv).toBe('a,b,c\r\n,,x');
  });

  it('converts numeric cells', () => {
    expect(toCsv(['rent'], [[42000.5]])).toBe('rent\r\n42000.5');
  });
});

describe('downloadCsv', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('triggers a client download with a UTF-8 BOM', () => {
    const createObjectURL = vi.fn<(obj: Blob) => string>(() => 'blob:mock');
    const revokeObjectURL = vi.fn<(url: string) => void>();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    const clicks: HTMLAnchorElement[] = [];
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreate(tag);
      if (tag === 'a') {
        clicks.push(el as HTMLAnchorElement);
        Object.defineProperty(el, 'click', { value: vi.fn() });
      }
      return el;
    });

    downloadCsv('leases.csv', 'a,b\r\n1,2');

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/csv;charset=utf-8');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    expect(clicks[0].download).toBe('leases.csv');
    clicks[0].click();
    expect(clicks[0].href).toBe('blob:mock');
  });
});
