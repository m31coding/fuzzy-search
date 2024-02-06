/**
 * A query and its duration.
 */
export class TimedQuery {
  /**
   * Creates a new instance of the TimedQuery class.
   * @param query The query string.
   * @param duration The duration of the query in milliseconds.
   */
  public constructor(
    public readonly query: string,
    public readonly duration: number
  ) {}
}
