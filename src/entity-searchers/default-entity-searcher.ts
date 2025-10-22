import { ArrayUtilities } from '../commons/array-utilities.js';
import { EntityMatch } from '../interfaces/entity-match.js';
import { EntityResult } from '../interfaces/entity-result.js';
import { EntitySearcher } from '../interfaces/entity-searcher.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Query } from '../interfaces/query.js';
import { Result } from '../string-searchers/result.js';
import { StringSearcher } from '../interfaces/string-searcher.js';

/**
 * A searcher that indexes and retrieves entities.
 * @typeParam TEntity The type of the entities.
 * @typeParam TId The type of the entity ids.
 */
export class DefaultEntitySearcher<TEntity, TId> implements EntitySearcher<TEntity, TId> {
  /**
   * The string searcher.
   */
  private readonly stringSearcher: StringSearcher;

  /**
   * The indexed entities.
   */
  private entities: (TEntity | null)[];

  /**
   * Mapping between entity ids and their indexes in the entities array.
   */
  private idToIndex: Map<TId, number>;

  /**
   * The indexed terms.
   */
  private terms: string[];

  /**
   * Mapping between term indexes and entity indexes.
   */
  private termIndexToEntityIndex: Int32Array;

  /**
   * Mapping between entity indexes and the index of their first term.
   */
  private entityIndexToFirstTermIndex: Int32Array;

  /**
   * Creates a new instance of the DefaultEntitySearcher class.
   * @typeParam TEntity The type of the entities.
   * @typeParam TId The type of the entity ids.
   * @param stringSearcher The string searcher to use.
   */
  public constructor(stringSearcher: StringSearcher) {
    this.stringSearcher = stringSearcher;
    this.entities = [];
    this.idToIndex = new Map<TId, number>();
    this.terms = [];
    this.termIndexToEntityIndex = new Int32Array(0);
    this.entityIndexToFirstTermIndex = new Int32Array(0);
  }

  /**
   * {@inheritDoc EntitySearcher.indexEntities}
   */
  public indexEntities(
    entities: TEntity[],
    getId: (entity: TEntity) => TId,
    getTerms: (entity: TEntity) => string[]
  ): Meta {
    this.entities = [...entities];
    this.idToIndex = new Map<TId, number>();
    this.terms = [];
    const termIndexToEntityIndexNumbers: number[] = [];
    const entityIndexToFirstTermIndexNumbers: number[] = [];

    for (let i = 0, l = entities.length; i < l; i++) {
      this.idToIndex.set(getId(entities[i]), i);
      const entityTerms = getTerms(entities[i]);
      entityIndexToFirstTermIndexNumbers.push(this.terms.length);
      this.terms.push(...entityTerms);
      termIndexToEntityIndexNumbers.push(...entityTerms.map(() => i));
    }
    this.termIndexToEntityIndex = ArrayUtilities.ToInt32Array(termIndexToEntityIndexNumbers);
    this.entityIndexToFirstTermIndex = ArrayUtilities.ToInt32Array(entityIndexToFirstTermIndexNumbers);
    const meta: Meta = this.stringSearcher.index(this.terms);
    meta.add('numberOfEntities', this.entities.length);
    meta.add('numberOfTerms', this.terms.length);
    return meta;
  }

  /**
   * {@inheritDoc EntitySearcher.getMatches}
   */
  public getMatches(query: Query): EntityResult<TEntity> {
    const stringSearcherQuery: Query = new Query(query.string, Infinity, query.minQuality);
    const result = this.stringSearcher.getMatches(stringSearcherQuery);
    const matches: EntityMatch<TEntity>[] = this.getMatchesFromResult(result, query.topN);
    return new EntityResult(matches, query, result.meta);
  }

  /**
   * Creates entity matches from the string searcher result.
   * @param result The string searcher result.
   * @param topN The maximum number of matches to return.
   * @returns The entity matches.
   */
  private getMatchesFromResult(result: Result, topN: number): EntityMatch<TEntity>[] {
    if (topN === 0) {
      return [];
    }
    const matchedIndexes: Set<number> = new Set<number>();
    const matches: EntityMatch<TEntity>[] = [];

    for (let i = 0, l = result.matches.length; i < l; i++) {
      const match = result.matches[i];
      const entityIndex: number = this.termIndexToEntityIndex[match.index];
      if (!matchedIndexes.has(entityIndex) && this.entities[entityIndex] !== null) {
        matchedIndexes.add(entityIndex);
        matches.push(new EntityMatch(this.entities[entityIndex] as TEntity, match.quality, this.terms[match.index]));
        if (matches.length === topN) {
          break;
        }
      }
    }

    return matches;
  }

  /**
   * {@inheritDoc EntitySearcher.tryGetEntity}
   */
  public tryGetEntity(id: TId): TEntity | null {
    const index = this.idToIndex.get(id);
    return index === undefined ? null : this.entities[index];
  }

  /**
   * {@inheritDoc EntitySearcher.getEntities}
   */
  public getEntities(): TEntity[] {
    return this.entities.filter((e) => e !== null) as TEntity[];
  }

  /**
   * {@inheritDoc EntitySearcher.tryGetTerms}
   */
  public tryGetTerms(id: TId): string[] | null {
    const index = this.idToIndex.get(id);
    if (index === undefined) {
      return null;
    }
    const firstTermIndex = this.entityIndexToFirstTermIndex[index];
    const exclusiveLastTermIndex =
      index === this.entities.length - 1 ? this.terms.length : this.entityIndexToFirstTermIndex[index + 1];
    return this.terms.slice(firstTermIndex, exclusiveLastTermIndex);
  }

  /**
   * {@inheritDoc EntitySearcher.getTerms}
   */
  public getTerms(): string[] {
    const result: string[] = [];
    for (let i = 0, l = this.termIndexToEntityIndex.length; i < l; i++) {
      if (this.entities[this.termIndexToEntityIndex[i]] !== null) {
        result.push(this.terms[i]);
      }
    }
    return result;
  }

  /**
   * {@inheritDoc EntitySearcher.removeEntity}
   */
  public removeEntity(id: TId): boolean {
    const index = this.idToIndex.get(id);
    if (index === undefined) {
      return false;
    }
    this.entities[index] = null;
    this.idToIndex.delete(id);
    return true;
  }

  /**
   * {@inheritDoc EntitySearcher.replaceEntity}
   */
  public replaceEntity(id: TId, newEntity: TEntity, newEntityId: TId): boolean {
    const index = this.idToIndex.get(id);
    if (index === undefined) {
      return false;
    }
    this.entities[index] = newEntity;
    this.idToIndex.delete(id);
    this.idToIndex.set(newEntityId, index);
    return true;
  }

  /**
   * {@inheritDoc EntitySearcher.save}
   */
  public save(memento: Memento): void {
    memento.add(this.entities);
    memento.add(this.idToIndex);
    memento.add(this.terms);
    memento.add(this.termIndexToEntityIndex);
    memento.add(this.entityIndexToFirstTermIndex);
    this.stringSearcher.save(memento);
  }

  /**
   * {@inheritDoc EntitySearcher.load}
   */
  public load(memento: Memento): void {
    this.entities = memento.get();
    this.idToIndex = memento.get();
    this.terms = memento.get();
    this.termIndexToEntityIndex = memento.get();
    this.entityIndexToFirstTermIndex = memento.get();
    this.stringSearcher.load(memento);
  }
}
