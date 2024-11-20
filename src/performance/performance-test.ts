import { DynamicSearcher } from '../interfaces/dynamic-searcher.js';
import { Query } from '../interfaces/query.js';
import { Report } from './report.js';
import { TestRunParameters } from './test-run-parameters.js';
import { TimedQuery } from './timed-query.js';

/**
 * A performance test for an entity searcher.
 */
export class PerformanceTest<TEntity, TId> {
  /**
   * The indexed terms.
   */
  private terms: readonly string[];

  /**
   * The random number generator. Creates a random number in [0, 1).
   */
  private random: () => number;

  /**
   * Creates a new instance of the PerformanceTest class.
   * @param dynamicSearcher The searcher to test.
   */
  public constructor(public readonly dynamicSearcher: DynamicSearcher<TEntity, TId>) {
    this.terms = [];
    this.random = this.mulberry32(0);
  }

  /**
   * Runs a performance test with the given parameters.
   * @param parameters The test run parameters.
   * @returns The performance test report.
   */
  public run(parameters: TestRunParameters): Report {
    const measurements: TimedQuery[] = [];
    this.terms = this.dynamicSearcher.getTerms().filter((t) => t);
    this.random = this.mulberry32(parameters.testSeed);
    const numberOfQueries = this.terms.length === 0 ? 0 : parameters.numberOfQueries;

    for (let i = 0, l = numberOfQueries; i < l; i++) {
      const queryString = this.GetRandomQueryString();
      const query = new Query(queryString, parameters.topN, parameters.minQuality);
      const start = performance.now();
      const _result = this.dynamicSearcher.getMatches(query);
      const duration = performance.now() - start;
      measurements.push(new TimedQuery(queryString, duration));
    }

    return Report.Create(
      new TestRunParameters(parameters.testSeed, numberOfQueries, parameters.topN, parameters.minQuality),
      measurements
    );
  }

  /**
   * Gets a random query string for the performance test. After a random
   * term is selected, a random substring of that term is returned.
   * @returns A random query string for the performance test.
   */
  private GetRandomQueryString(): string {
    const term: string = this.GetRandomTerm();
    const length: number = this.getRandomInteger(1, term.length);
    return term.substring(0, length);
  }

  /**
   * Returns a random term.
   * @returns A random term.
   */
  private GetRandomTerm(): string {
    const randomIndex: number = this.getRandomInteger(0, this.terms.length);
    return this.terms[randomIndex];
  }

  /**
   * Creates a mulberry32 random number generator.
   * @param seed The seed.
   * @returns The random number generator function.
   */
  private mulberry32(seed: number): () => number {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Returns a random integer between 0 and max (exclusive).
   * @param min The minimum value (inclusive).
   * @param max The maximum value (exclusive).
   * @returns A random integer between 0 and max (exclusive).
   */
  private getRandomInteger(min: number, max: number): number {
    return Math.floor(this.random() * (max - min) + min);
  }
}
