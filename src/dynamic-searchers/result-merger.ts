/* eslint-disable @typescript-eslint/no-explicit-any */

import { EntityMatch } from '../interfaces/entity-match';
import { EntityResult } from '../interfaces/entity-result';
import { Meta } from '../interfaces/meta';
import { Query } from '../interfaces/query';

/**
 * Merges {@link EntityResult}s.
 */
export class ResultMerger {
  /**
   * Merges two {@link EntityResult}s into a new {@link EntityResult}.
   * @typeParam TEntity The type of the entities.
   * @param result1 The first result.
   * @param result2 The second result.
   * @returns The merged result.
   */
  public static mergeResults<TEntity>(
    result1: EntityResult<TEntity>,
    result2: EntityResult<TEntity>
  ): EntityResult<TEntity> {
    const query: Query = result1.query;
    const newMatches = this.mergeMatches(result1.matches, result2.matches, query.topN);
    const newMeta: Meta = this.mergeMeta(result1.meta, result2.meta);
    return new EntityResult(newMatches, query, newMeta);
  }

  /**
   * Merges two arrays of type {@link EntityMatch} into a new array. Does not remove duplicate matches.
   * @typeParam TEntity The type of the entities.
   * @param matches1 The first array of matches.
   * @param matches2 The second array of matches.
   * @param topN The maximum number of matches to return.
   * @returns The merged array of matches.
   */
  private static mergeMatches<TEntity>(
    matches1: EntityMatch<TEntity>[],
    matches2: EntityMatch<TEntity>[],
    topN: number
  ): EntityMatch<TEntity>[] {
    if (matches2.length === 0) {
      return matches1;
    }
    if (matches1.length === 0) {
      return matches2;
    }
    const newMatches = [...matches1, ...matches2];
    newMatches.sort((m1, m2) =>
      m1.quality > m2.quality ? -1
      : m1.quality < m2.quality ? 1
      : 0
    );
    return newMatches.length <= topN ? newMatches : newMatches.slice(0, topN);
  }

  /**
   * Merges two {@link Meta} objects into a new {@link Meta} object.
   * @param meta1 The first meta object.
   * @param meta2 The second meta object.
   * @returns The merged meta object.
   */
  private static mergeMeta(meta1: Meta, meta2: Meta): Meta {
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
