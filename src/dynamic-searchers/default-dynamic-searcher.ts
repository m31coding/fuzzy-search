import { DynamicSearcher } from '../interfaces/dynamic-searcher.js';
import { EntityResult } from '../interfaces/entity-result.js';
import { EntitySearcher } from '../interfaces/entity-searcher.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Query } from '../interfaces/query.js';
import { RemovalResult } from './removal-result.js';
import { ResultMerger } from './result-merger.js';

/**
 * The default implementation of the DynamicSearcher interface.
 * @typeParam TEntity The type of the entities.
 * @typeParam TId The type of the entity ids.
 */
export class DefaultDynamicSearcher<TEntity, TId> implements DynamicSearcher<TEntity, TId> {
  /**
   * Creates a new instance of the DefaultDynamicSearcher class.
   * @typeParam TEntity The type of the entities.
   * @typeParam TId The type of the entity ids.
   * @param maxQueryLength The maximum query length.
   * @param mainSearcher The main searcher.
   * @param secondarySearcher The secondary searcher.
   */
  public constructor(
    private readonly maxQueryLength: number,
    private readonly mainSearcher: EntitySearcher<TEntity, TId>,
    private readonly secondarySearcher: EntitySearcher<TEntity, TId>
  ) { }

  /**
   * {@inheritDoc DynamicSearcher.indexEntities}
   */
  public indexEntities(
    entities: TEntity[],
    getId: (entity: TEntity) => TId,
    getTerms: (entity: TEntity) => string[]
  ): Meta {
    this.secondarySearcher.indexEntities([], getId, getTerms);
    return this.mainSearcher.indexEntities(entities, getId, getTerms);
  }

  /**
   * {@inheritDoc DynamicSearcher.getMatches}
   */
  public getMatches(query: Query): EntityResult<TEntity> {
    if (!query.string) {
      return new EntityResult([], query, new Meta());
    }
    if (query.string.length > this.maxQueryLength) {
      query = new Query(query.string.substring(0, this.maxQueryLength), query.topN, query.minQuality);
    }
    return ResultMerger.mergeResults(this.mainSearcher.getMatches(query), this.secondarySearcher.getMatches(query));
  }

  /**
   * {@inheritDoc DynamicSearcher.tryGetTerms}
   */
  public tryGetTerms(id: TId): string[] | null {
    const terms = this.mainSearcher.tryGetTerms(id);
    return terms !== null ? terms : this.secondarySearcher.tryGetTerms(id);
  }

  /**
   * {@inheritDoc DynamicSearcher.getTerms}
   */
  public getTerms(): string[] {
    return this.mainSearcher.getTerms().concat(this.secondarySearcher.getTerms());
  }

  /**
   * {@inheritDoc DynamicSearcher.tryGetEntity}
   */
  public tryGetEntity(id: TId): TEntity | null {
    return this.mainSearcher.tryGetEntity(id) ?? this.secondarySearcher.tryGetEntity(id) ?? null;
  }

  /**
   * {@inheritDoc DynamicSearcher.getEntities}
   */
  public getEntities(): TEntity[] {
    return this.mainSearcher.getEntities().concat(this.secondarySearcher.getEntities());
  }

  /**
   * {@inheritDoc DynamicSearcher.removeEntities}
   */
  public removeEntities(ids: TId[]): RemovalResult<TId> {
    const removedIds: TId[] = [];
    for (let i = 0, l = ids.length; i < l; i++) {
      if (this.mainSearcher.removeEntity(ids[i]) || this.secondarySearcher.removeEntity(ids[i])) {
        removedIds.push(ids[i]);
      }
    }
    const meta = new Meta();
    return new RemovalResult(removedIds, meta);
  }

  /**
   * {@inheritDoc DynamicSearcher.upsertEntities}
   */
  public upsertEntities(
    entities: TEntity[],
    getId: (entity: TEntity) => TId,
    getTerms: (entity: TEntity) => string[]
  ): Meta {
    const idsToRemove: TId[] = [];
    const entitiesToInsert: TEntity[] = [];
    for (let i = 0, l = entities.length; i < l; i++) {
      const entity: TEntity = entities[i];
      const entityId: TId = getId(entity);
      if (!this.tryUpdate(entity, entityId, getTerms)) {
        idsToRemove.push(entityId);
        entitiesToInsert.push(entity);
      }
    }
    this.removeEntities(idsToRemove);
    // todo: check
    return entities.length > 0 ? this.reindexSecondarySearcher(entitiesToInsert, getId, getTerms) : new Meta();
  }

  /**
   * Reindexes the secondary searcher with its present entities and the given additional
   * entities.
   * @param additionalEntities The additional entities to index.
   * @param getId A function that returns the id of an entity.
   * @param getTerms A function that returns the terms of an entity.
   * @returns The indexing meta data.
   */
  private reindexSecondarySearcher(
    additionalEntities: TEntity[],
    getId: (entity: TEntity) => TId,
    getTerms: (entity: TEntity) => string[]
  ): Meta {
    const presentEntities = this.secondarySearcher.getEntities();
    const entities = presentEntities.concat(additionalEntities);
    return this.secondarySearcher.indexEntities(entities, getId, getTerms);
  }

  /**
   * Tries to update the entity with the given id. Returns true if the entity could be updated.
   * In particular, the entity has to be present and the terms must not have changed.
   * @param entity The entity to update.
   * @param entityId The id of the entity to update.
   * @param getTerms A function that returns the terms of the entity.
   * @returns True, if the entity could be updated.
   */
  private tryUpdate(entity: TEntity, entityId: TId, getTerms: (entity: TEntity) => string[]): boolean {
    return (
      this.tryUpdateSearcher(entity, entityId, getTerms, this.mainSearcher) ||
      this.tryUpdateSearcher(entity, entityId, getTerms, this.secondarySearcher)
    );
  }

  /**
   * Tries to update the entity with the given id. Returns true if the entity could be updated.
   * In particular, the entity has to be present and the terms must not have changed.
   * @param entity The entity to update.
   * @param entityId The id of the entity to update.
   * @param getTerms A function that returns the terms of the entity.
   * @param searcher The searcher to update.
   * @returns True, if the entity could be updated.
   */
  private tryUpdateSearcher(
    entity: TEntity,
    entityId: TId,
    getTerms: (entity: TEntity) => string[],
    searcher: EntitySearcher<TEntity, TId>
  ): boolean {
    const presentTerms: string[] | null = searcher.tryGetTerms(entityId);
    if (presentTerms === null) {
      return false;
    }
    if (this.termsAreEqual(presentTerms, getTerms(entity))) {
      if (!searcher.replaceEntity(entityId, entity, entityId)) {
        throw new Error(`Entity with id ${entityId} was not present.`);
      }
      return true;
    }
    return false;
  }

  /**
   * Checks if the two term arrays are equal.
   * @param terms1 The first term array.
   * @param terms2 The second term array.
   * @returns True, if the two term arrays are equal.
   */
  private termsAreEqual(terms1: string[], terms2: string[]): boolean {
    if (terms1 === terms2) return true;
    if (terms1 == null || terms2 == null) return false;
    if (terms1.length !== terms2.length) return false;
    return terms1.every((term, index) => term === terms2[index]);
  }

  /**
   * {@inheritDoc DynamicSearcher.removeEntity}
   */
  public removeEntity(id: TId): boolean {
    return this.mainSearcher.removeEntity(id) || this.secondarySearcher.removeEntity(id);
  }

  /**
   * {@inheritDoc DynamicSearcher.replaceEntity}
   */
  public replaceEntity(id: TId, newEntity: TEntity, newEntityId: TId): boolean {
    return this.mainSearcher.replaceEntity(id, newEntity, newEntityId) ||
      this.secondarySearcher.replaceEntity(id, newEntity, newEntityId);
  }

  /**
   * {@inheritDoc DynamicSearcher.save}
   */
  public save(memento: Memento): void {
    this.mainSearcher.save(memento);
    this.secondarySearcher.save(memento);
  }

  /**
   * {@inheritDoc DynamicSearcher.load}
   */
  public load(memento: Memento): void {
    this.mainSearcher.load(memento);
    this.secondarySearcher.load(memento);
  }
}
