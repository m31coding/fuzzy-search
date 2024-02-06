import { EntitySearcher } from './entity-searcher';
import { Meta } from './meta';
import { RemovalResult } from '../dynamic-searchers/removal-result';

/**
 * A dynamic searcher that, in addition to indexing and searching, can also remove and upsert entities.
 * @typeParam TEntity The type of the entities.
 * @typeParam TId The type of the entity ids.
 */
export interface DynamicSearcher<TEntity, TId> extends EntitySearcher<TEntity, TId> {
  /**
   * Removes all present entities with the given ids.
   * @param ids The ids of the entities to remove.
   * @returns The removal result containing the ids of the entities that were present
   * and thus removed.
   */
  removeEntities(ids: TId[]): RemovalResult<TId>;

  /**
   * Updates or inserts the given entities.
   * @param entities The entities to update or insert.
   * @param getId A function that returns the id of an entity.
   * @param getTerms A function that returns the terms of an entity.
   * @returns The meta data of the operation.
   */
  upsertEntities(entities: TEntity[], getId: (entity: TEntity) => TId, getTerms: (entity: TEntity) => string[]): Meta;
}
