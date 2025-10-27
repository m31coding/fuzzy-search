import { EntityMatch } from '../interfaces/entity-match.js';
import { Meta } from '../interfaces/meta.js';
import { Query } from '../interfaces/query.js';

/**
 * The search state during an entity search.
 * @typeParam TEntity The type of the entities.
 */
export class SearchState<TEntity> {
  /**
   * The search query.
   */
  public readonly query: Query;
  /**
   * The indexes of the entities that have already been matched.
   */
  public readonly matchedIndexes: Set<number> = new Set<number>();
  /**
   * The matched entities.
   */
  public readonly matches: EntityMatch<TEntity>[] = [];
  /**
   * The meta data for each searcher type.
   */
  public readonly meta: Meta[] = [];
  /**
   * Creates a new instance of the SearchState class.
   * @param query The search query.
   */
  public constructor(query: Query) {
    this.query = query;
  }
}
