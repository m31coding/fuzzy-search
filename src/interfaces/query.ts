import { FuzzySearcher, PrefixSearcher, SearcherSpec, SubstringSearcher } from './searcher-spec.js';

/**
 * Holds the query string and query parameters.
 */
export class Query {
  /**
   * The query string.
   */
  public readonly string: string;

  /**
   * The maximum number of matches to return. Provide Infinity to return all matches.
   */
  public readonly topN: number;

  /**
   * The searchers to use.
   */
  public readonly searchers: SearcherSpec[];

  /**
   * Creates a new instance of the Query class.
   * @param string The query string.
   * @param topN The maximum number of matches to return. Provide Infinity to return all matches.
   * @param searchers The searchers to use.
   */
  public constructor(
    string: string,
    topN: number = 10,
    searchers = [new FuzzySearcher(0.3), new SubstringSearcher(0), new PrefixSearcher(0)]
  ) {
    this.string = string;
    this.topN = Math.max(0, topN);
    this.searchers = searchers;
  }
}
