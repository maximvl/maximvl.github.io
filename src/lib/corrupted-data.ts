import raw from './data/corrupted.json';
import type { CorruptedDataset } from './types';

/** Vaal corruption implicits, produced by scripts/build-corrupted-data.ts. */
export const corruptedDataset = raw as unknown as CorruptedDataset;
