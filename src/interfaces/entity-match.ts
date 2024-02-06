/**
 * Represents a matched entity.
 * @typeParam TEntity The type of the entities.
 */
export class EntityMatch<TEntity> {
  /**
   * Creates a new instance of the EntityMatch class.
   * @typeParam TEntity The type of the entities.
   * @param entity The matched entity.
   * @param quality The quality of the match.
   * @param matchedString The string that was matched.
   */
  public constructor(
    public readonly entity: TEntity,
    public readonly quality: number,
    public readonly matchedString: string
  ) {}
}
