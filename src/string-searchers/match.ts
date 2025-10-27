/**
 * A string searcher match.
 */
export class Match {
  /**
   * Creates a new instance of the Match class.
   * @param index The index of the matched string.
   * @param quality The quality of the match.
   */
  public constructor(
    public readonly index: number,
    public quality: number
  ) {}
}
