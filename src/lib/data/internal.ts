/**
 * Shared randomness helpers for the deterministic mock dataset.
 * Not part of the public data API — import via `./leases` / `./records`.
 */
import { toISODate } from '../dates';
import { hashSeed, mulberry32 } from '../seed';

export function rngFor(key: string): () => number {
  return mulberry32(hashSeed(key));
}

export function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)] as T;
}

export function isoDate(date: Date): string {
  return toISODate(date);
}
