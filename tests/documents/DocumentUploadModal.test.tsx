// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';

afterEach(cleanup);

function makeFile(name: string, sizeBytes: number): File {
  return new File([new ArrayBuffer(sizeBytes)], name, { type: 'application/pdf' });
}

const KB = 1024;
const MB = 1024 * 1024;

function renderOpen(versions: string[] = ['1.0']) {
  const onClose = vi.fn();
  render(
    <DocumentUploadModal
      open
      onClose={onClose}
      documentName="LV-2021-0231 — Original Lease Agreement"
      existingVersions={versions}
    />,
  );
  return { onClose, input: screen.getByLabelText('Select PDF document') as HTMLInputElement };
}

describe('DocumentUploadModal (vault intake policy)', () => {
  it('advertises the next version and the policy up front', () => {
    renderOpen(['1.0', '2.0']);
    expect(screen.getByText(/next version v3.0/)).toBeTruthy();
    expect(screen.getByText(/PDF only, max 10 MB/)).toBeTruthy();
  });

  it('computes the version from the existing stack, defaulting to v1.0', () => {
    renderOpen([]);
    expect(screen.getByText(/next version v1.0/)).toBeTruthy();
  });

  it('rejects non-PDF files with a policy message', () => {
    const { input } = renderOpen(['1.0']);
    fireEvent.change(input, { target: { files: [makeFile('notes.txt', 2 * KB)] } });
    expect(screen.getByRole('alert').textContent).toMatch(/Only PDF documents are accepted/i);
    expect(screen.queryByText(/PDF validated/)).toBeNull();
  });

  it('rejects files over the 10 MB ceiling with the actual size', () => {
    const { input } = renderOpen(['1.0']);
    fireEvent.change(input, { target: { files: [makeFile('huge.pdf', 10 * MB + 5)] } });
    expect(screen.getByRole('alert').textContent).toMatch(/exceeds the 10 MB limit/i);
  });

  it('accepts a valid PDF and confirms the version increment', () => {
    const { input } = renderOpen(['1.0', '2.0']);
    fireEvent.change(input, { target: { files: [makeFile('amendment.pdf', 800 * KB)] } });
    expect(screen.getByText(/PDF validated/)).toBeTruthy();
    expect(screen.getByText(/Version increment confirmed/)).toBeTruthy();
    expect(screen.getByText(/will be filed as/).textContent).toContain('v3.0');
  });

  it('round-trips between file selection states without losing policy state', () => {
    const { input, onClose } = renderOpen(['1.0']);
    fireEvent.change(input, { target: { files: [makeFile('lease.pdf', 800 * KB)] } });
    expect(screen.getByText(/PDF validated/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Choose another file/ }));
    expect(screen.getByText(/Drop the executed PDF here, or browse/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('requires explicit confirmation before the upload action appears', () => {
    const { input } = renderOpen(['1.0']);
    expect(screen.queryByRole('button', { name: /Upload as/ })).toBeNull();
    fireEvent.change(input, { target: { files: [makeFile('lease.pdf', 800 * KB)] } });
    expect(screen.getByRole('button', { name: /Upload as v2.0/ })).toBeTruthy();
  });

  it('treats the size limit as exclusive at exactly 10 MB', () => {
    const { input } = renderOpen(['1.0']);
    fireEvent.change(input, { target: { files: [makeFile('exact.pdf', 10 * MB)] } });
    expect(screen.getByText(/PDF validated/)).toBeTruthy();
  });

  it('shows the audit and scanning assurances', () => {
    renderOpen(['1.0']);
    expect(screen.getByText(/virus-scanned, watermarked/)).toBeTruthy();
    expect(screen.getByText(/recorded in the audit log/)).toBeTruthy();
  });
});
