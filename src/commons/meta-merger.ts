/* eslint-disable @typescript-eslint/no-explicit-any */

import { Meta } from '../interfaces/meta.js';

/**
 * Merges {@link Meta} objects.
 */
export class MetaMerger {
  /**
  * Merges {@link Meta} objects into a new {@link Meta} object. Numbers for the same key are summed up, other values 
  * are stored with an index suffix.
  * @param metas The meta objects to merge.
  * @returns The merged meta object.
  */
  public static mergeMeta(metas: Meta[]): Meta {
    if (metas.length === 0) {
      return new Meta();
    }

    if (metas.length === 1) {
      return metas[0];
    }

    const metaLists: Map<string, any[]> = new Map<string, any[]>();

    for (const meta of metas) {
      for (const [key, value] of meta.allEntries) {
        const present = metaLists.get(key);
        if (present === undefined) {
          metaLists.set(key, [value]);
        }
        else {
          present.push(value);
        }
      }
    }

    const newMetaEntries: Map<string, any> = new Map<string, any>();

    for (const [key, values] of metaLists) {
      if (values.length === 1) {
        newMetaEntries.set(key, values[0]);
        continue;
      }

      if (values.every(v => typeof v === 'number')) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        newMetaEntries.set(key, sum);
        continue;
      }

      for (let i = 0; i < values.length; i++) {
        newMetaEntries.set(`${key}_${i}`, values[i]);
      }
    }

    return new Meta(newMetaEntries);
  }
}
