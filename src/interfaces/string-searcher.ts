import { MementoSerializable } from './memento-serializable.js';
import { Meta } from './meta.js';
import { Query } from './query.js';
import { Result } from '../string-searchers/result.js';

/**
 * A string searcher for indexing strings and retrieving matches.
 */
export interface StringSearcher extends MementoSerializable {
  /**
   * Indexes the given terms.
   * @param terms The terms.
   * @returns The indexing meta data.
   */
  index(terms: string[]): Meta;

  /**
   * Retrieves matches for the given query.
   * @param query The query.
   * @returns The matches.
   */
  getMatches(query: Query): Result;
}
