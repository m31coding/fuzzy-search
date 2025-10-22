import { EntityResult } from './entity-result.js';
import { MementoSerializable } from './memento-serializable.js';
import { Meta } from './meta.js';
import { Query } from './query.js';

/**
 * An entity searcher for indexing entities and retrieving matches. Can also remove and replace single entities.
 * @typeParam TEntity The type of the entities.
 * @typeParam TId The type of the entity ids.
 */
export interface EntitySearcher<TEntity, TId> extends MementoSerializable {
  /**
   * Indexes a new set of entities. Previously indexed entities are overwritten.
   * @param entities The entities to index.
   * @param getId A function that returns the id of an entity.
   * @param getTerms A function that returns the terms of an entity.
   * @returns The indexing meta data.
   */
  indexEntities(entities: TEntity[], getId: (entity: TEntity) => TId, getTerms: (entity: TEntity) => string[]): Meta;

  /**
   * Retrieves entity matches for the given query.
   * @param query The query.
   * @returns The entity matches.
   */
  getMatches(query: Query): EntityResult<TEntity>;

  /**
   * Tries to get the entity with the given id.
   * @param id The id of the entity.
   * @returns The entity with the given id, or null if the entity is not present.
   */
  tryGetEntity(id: TId): TEntity | null;

  /**
   * Returns the indexed entities.
   * @returns The indexed entities.
   */
  getEntities(): TEntity[];

  /**
   * Tries to get the terms of the entity with the given id.
   * @param id The id of the entity.
   * @returns The terms of the entity with the given id, or null if the entity is not present.
   */
  tryGetTerms(id: TId): string[] | null;

  /**
   * Gets the terms of the entities.
   * @returns The terms of the entities.
   */
  getTerms(): string[];

  /**
   * Removes the entity with the given id.
   * @param id The id of the entity to remove.
   * @returns True if the entity was present, false otherwise.
   */
  removeEntity(id: TId): boolean;

  /**
   * Replaces the entity with the given id. The terms of the entity are not updated.
   * @param id The id of the entity to replace.
   * @param newEntity The new entity.
   * @param newEntityId The id of the new entity.
   * @returns True if the id to replace was present, false otherwise.
   */
  replaceEntity(id: TId, newEntity: TEntity, newEntityId: TId): boolean;
}
