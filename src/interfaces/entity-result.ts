import { EntityMatch } from './entity-match.js';
import { Meta } from './meta.js';
import { Query } from './query.js';

/**
 * Represents a result from an entity search.
 * @typeParam TEntity The type of the entities.
 */
export class EntityResult<TEntity> {
  /**
   * Creates a new instance of the EntityResult class.
   * @typeParam TEntity The type of the entities.
   * @param matches The entity matches.
   * @param query The query.
   * @param meta The meta data.
   */
  public constructor(
    public readonly matches: EntityMatch<TEntity>[],
    public readonly query: Query,
    public readonly meta: Meta
  ) {}
}
