import { DynamicSearcher } from '../interfaces/dynamic-searcher.js';
import { EntityResult } from '../interfaces/entity-result.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Query } from '../interfaces/query.js';
import { RemovalResult } from './removal-result.js';

/**
 * A dynamic searcher that measures the duration of its operations.
 * @typeParam TEntity The type of the entities.
 * @typeParam TId The type of the entity ids.
 */
export class TimingDynamicSearcher<TEntity, TId> implements DynamicSearcher<TEntity, TId> {
  /**
   * Creates a new instance of the TimingDynamicSearcher class.
   * @typeParam TEntity The type of the entities.
   * @typeParam TId The type of the entity ids.
   * @param dynamicSearcher The dynamic searcher.
   */
  public constructor(private readonly dynamicSearcher: DynamicSearcher<TEntity, TId>) { }

  /**
   * {@inheritDoc DynamicSearcher.removeEntities}
   */
  public removeEntities(ids: TId[]): RemovalResult<TId> {
    const start = performance.now();
    const result = this.dynamicSearcher.removeEntities(ids);
    const duration = Math.round(performance.now() - start);
    result.meta.add('removalDuration', duration);
    return result;
  }

  /**
   * {@inheritDoc DynamicSearcher.upsertEntities}
   */
  public upsertEntities(
    entities: TEntity[],
    getId: (entity: TEntity) => TId,
    getTerms: (entity: TEntity) => string[]
  ): Meta {
    const start = performance.now();
    const meta = this.dynamicSearcher.upsertEntities(entities, getId, getTerms);
    const duration = Math.round(performance.now() - start);
    meta.add('upsertDuration', duration);
    return meta;
  }

  /**
   * {@inheritDoc DynamicSearcher.indexEntities}
   */
  public indexEntities(
    entities: TEntity[],
    getId: (entity: TEntity) => TId,
    getTerms: (entity: TEntity) => string[]
  ): Meta {
    const start = performance.now();
    const meta = this.dynamicSearcher.indexEntities(entities, getId, getTerms);
    const duration = Math.round(performance.now() - start);
    meta.add('indexingDuration', duration);
    return meta;
  }

  /**
   * {@inheritDoc DynamicSearcher.getMatches}
   */
  public getMatches(query: Query): EntityResult<TEntity> {
    const start = performance.now();
    const result = this.dynamicSearcher.getMatches(query);
    const duration = Math.round(performance.now() - start);
    result.meta.add('queryDuration', duration);
    return result;
  }

  /**
   * {@inheritDoc DynamicSearcher.tryGetEntity}
   */
  public tryGetEntity(id: TId): TEntity | null {
    return this.dynamicSearcher.tryGetEntity(id);
  }

  /**
   * {@inheritDoc DynamicSearcher.getEntities}
   */
  public getEntities(): TEntity[] {
    return this.dynamicSearcher.getEntities();
  }

  /**
   * {@inheritDoc DynamicSearcher.tryGetTerms}
   */
  public tryGetTerms(id: TId): string[] | null {
    return this.dynamicSearcher.tryGetTerms(id);
  }

  /**
   * {@inheritDoc DynamicSearcher.getTerms}
   */
  public getTerms(): string[] {
    return this.dynamicSearcher.getTerms();
  }

  /**
   * {@inheritDoc DynamicSearcher.removeEntity}
   */
  public removeEntity(id: TId): boolean {
    return this.dynamicSearcher.removeEntity(id);
  }

  /**
   * {@inheritDoc DynamicSearcher.replaceEntity}
   */
  public replaceEntity(id: TId, newEntity: TEntity, newEntityId: TId): boolean {
    return this.dynamicSearcher.replaceEntity(id, newEntity, newEntityId);
  }

  /**
   * {@inheritDoc DynamicSearcher.save}
   */
  public save(memento: Memento): void {
    this.dynamicSearcher.save(memento);
  }

  /**
   * {@inheritDoc DynamicSearcher.load}
   */
  public load(memento: Memento): void {
    this.dynamicSearcher.load(memento);
  }
}
