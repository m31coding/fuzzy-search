/**
 * Holds the query string and query parameters.
 */
export class Query {
  /**
   * The query string.
   */
  public readonly string: string;

  /**
   * The maximum number of matches to return. If undefined, all matches will be returned.
   */
  public readonly topN: number;

  /**
   * The minimum quality of matches to return. Increasing this value will increase the performance but make
   * the searcher less fuzzy. The value must be between 0 and 1.
   */
  public readonly minQuality: number;

  /**
   * Creates a new instance of the Query class.
   * @param string The query string.
   * @param topN The maximum number of matches to return. Provide Infinity to return all matches.
   * @param minQuality The minimum quality of matches to return. Increasing this value will increase the
   * performance but make the searcher less fuzzy. The value must be between 0 and 1; lower or larger values will be
   * clamped.
   */
  public constructor(string: string, topN: number = 10, minQuality: number = 0.3) {
    this.string = string;
    this.topN = Math.max(0, topN);
    this.minQuality = Math.max(0, Math.min(1, minQuality));
  }
}
