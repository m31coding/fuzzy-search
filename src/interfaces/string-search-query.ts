import { SearcherType } from '../interfaces/searcher-type.js';

/**
 * Query for the string searchers.
 */
export class StringSearchQuery {
  /**
   * The query string.
   */
  public readonly string: string;

  /**
   * The minimum quality of matches to return. Increasing this value will increase the performance but reduce the
   * number of matches. Decreasing this value might retrieve irrelevant matches.
   */
  public readonly minQuality: number;

  /**
   * The type of searcher to use.
   */
  public readonly searcherType?: SearcherType;

  /**
   * Creates a new instance of the Query class.
   * @param string The query string.
   * @param minQuality The minimum quality of matches to return. Increasing this value will increase the performance
   * but reduce the number of matches. Decreasing this value might retrieve irrelevant matches. The value must be
   * between 0 and 1; lower or larger values will be clamped.
   * @param searcherType The type of searcher to use.
   */
  public constructor(string: string, minQuality: number = 0, searcherType?: SearcherType) {
    this.string = string;
    this.minQuality = Math.max(0, Math.min(1, minQuality));
    this.searcherType = searcherType;
  }
}
