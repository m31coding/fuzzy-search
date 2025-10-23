import { QueryCounts } from './query-counts.js';
import { TestRunParameters } from './test-run-parameters.js';
import { TimedQuery } from './timed-query.js';

/**
 * The outcome of a performance test run.
 */
export class Report {
  /**
   * Creates a new instance of the Report class.
   * @param testParameters The parameters of the test run.
   * @param queryCounts Counts of the generated and run queries.
   * @param totalDuration The total duration of all queries in milliseconds.
   * @param averageDuration The average duration of a query in milliseconds.
   * @param standardDeviation The standard deviation of the query durations in milliseconds.
   * @param fastest The fastest query.
   * @param slowest The slowest query.
   * @param longest The longest query.
   */
  public constructor(
    public readonly testParameters: TestRunParameters,
    public readonly queryCounts: QueryCounts,
    public readonly totalDuration: number,
    public readonly averageDuration: number,
    public readonly standardDeviation: number,
    public readonly fastest: TimedQuery,
    public readonly slowest: TimedQuery,
    public readonly longest: TimedQuery
  ) { }

  /**
   * Creates a report from the timed queries.
   * @param testRunParameters The parameters of the test run.
   * @param queryCounts Counts of the generated and run queries.
   * @param measurements The timed queries.
   * @returns The performance report.
   */
  public static Create(
    testRunParameters: TestRunParameters,
    queryCounts: QueryCounts,
    measurements: TimedQuery[]): Report {
    if (measurements.length === 0) {
      return new Report(
        testRunParameters,
        queryCounts,
        0,
        0,
        0,
        new TimedQuery('', 0),
        new TimedQuery('', 0),
        new TimedQuery('', 0)
      );
    }
    const numberOfQueries: number = measurements.length;
    const totalDuration: number = this.Sum(measurements.map((m) => m.duration));
    const averageDuration: number = totalDuration / numberOfQueries;
    const standardDeviation: number = Math.sqrt(
      this.Sum(measurements.map((m) => Math.pow(m.duration - averageDuration, 2))) / numberOfQueries
    );
    const fastest: TimedQuery = measurements.reduce((prev, cur) => (prev.duration < cur.duration ? prev : cur));
    const slowest: TimedQuery = measurements.reduce((prev, cur) => (prev.duration > cur.duration ? prev : cur));
    const longest: TimedQuery = measurements.reduce((prev, cur) => (prev.query.length > cur.query.length ? prev : cur));
    return new Report(
      testRunParameters, queryCounts, totalDuration, averageDuration, standardDeviation, fastest, slowest, longest);
  }

  /**
   * Calculates the sum of the given numbers.
   * @param numbers The numbers to sum.
   * @returns The sum.
   */
  private static Sum(numbers: number[]): number {
    return numbers.reduce((prev, cur) => prev + cur, 0);
  }
}
