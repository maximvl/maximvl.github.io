import raw from './data/eldritch.json';
import type { Dataset } from './types';

/** The scraped poedb dataset; the JSON is produced by scripts/build-data.ts. */
export const dataset = raw as unknown as Dataset;
