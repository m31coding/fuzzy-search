import { SearcherSpec } from '../interfaces/searcher-spec.js';

/**
 * Parameters of a performance test run.
 */
export class TestRunParameters {
  /**
   * Creates a new instance of the TestRunParameters class.
   * @param testSeed The random seed used for the test.
   * @param numberOfQueries The number of executed queries.
   * @param topN The maximum number of matches to return.
   * @param searchers The searchers used in the test.
   */
  public constructor(
    public readonly testSeed: number,
    public readonly numberOfQueries: number,
    public readonly topN: number,
    public readonly searchers: readonly SearcherSpec[]
  ) {}
}
