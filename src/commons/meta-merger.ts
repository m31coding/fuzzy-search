/* eslint-disable @typescript-eslint/no-explicit-any */

import { Meta } from '../interfaces/meta.js';

export class MetaMerger {
  /**
   * Merges two {@link Meta} objects into a new {@link Meta} object.
   * @param meta1 The first meta object.
   * @param meta2 The second meta object.
   * @returns The merged meta object.
   */
  public static mergeMeta(meta1: Meta, meta2: Meta): Meta {
    const newMetaEntries: Map<string, any> = new Map<string, any>();

    for (const [key, value] of meta1.allEntries) {
      newMetaEntries.set(key, value);
    }

    for (const [key, value] of meta2.allEntries) {
      const presentValue = newMetaEntries.get(key);
      if (presentValue === undefined) {
        newMetaEntries.set(key, value);
        continue;
      }
      if (typeof presentValue === 'number' && typeof value === 'number') {
        newMetaEntries.set(key, presentValue + value);
        continue;
      }
      newMetaEntries.delete(key);
      newMetaEntries.set(`${key}_0`, presentValue);
      newMetaEntries.set(`${key}_1`, value);
    }

    return new Meta(newMetaEntries);
  }
}
