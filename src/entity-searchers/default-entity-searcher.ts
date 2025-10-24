import { ArrayUtilities } from '../commons/array-utilities.js';
import { EntityMatch } from '../interfaces/entity-match.js';
import { EntityResult } from '../interfaces/entity-result.js';
import { EntitySearcher } from '../interfaces/entity-searcher.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { MetaMerger } from '../commons/meta-merger.js';
import { Query } from '../interfaces/query.js';
import { Result } from '../string-searchers/result.js';
import { SearchState } from './search-state.js';
import { SearcherType } from '../interfaces/searcher-type.js';
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
   * The types of searchers to use.
   */
  private readonly searcherTypes: SearcherType[];

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
   * The ordered searchers and their quality offsets.
   */
  private readonly searchersAndQualityOffsets: { searcherType: SearcherType; qualityOffset: number }[] = [
    { searcherType: SearcherType.Prefix, qualityOffset: 2 },
    { searcherType: SearcherType.Substring, qualityOffset: 1 },
    { searcherType: SearcherType.Fuzzy, qualityOffset: 0 }
  ];

  /**
   * Creates a new instance of the DefaultEntitySearcher class.
   * @typeParam TEntity The type of the entities.
   * @typeParam TId The type of the entity ids.
   * @param stringSearcher The string searcher to use.
   * 
   */
  public constructor(stringSearcher: StringSearcher, searcherTypes: SearcherType[]) {
    this.stringSearcher = stringSearcher;
    this.searcherTypes = searcherTypes;
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
    const searchState: SearchState<TEntity> = new SearchState<TEntity>(query);

    for (const { searcherType, qualityOffset } of this.searchersAndQualityOffsets) {
      if (query.topN == searchState.matches.length) {
        break;
      }

      if (!query.searcherTypes.includes(searcherType)) {
        continue;
      }

      if (!this.searcherTypes.includes(searcherType)) {
        continue;
      }

      this.addMatchesFromSearcher(searchState, searcherType, qualityOffset);
    }

    const mergedMeta = MetaMerger.mergeMeta(searchState.meta);
    return new EntityResult(searchState.matches, query, mergedMeta);
  }

  /**
   * Adds matches from a specific searcher to the search state.
   * @param searchState The current search state.
   * @param searcherType The type of the searcher.
   * @param qualityOffset The quality offset to apply.
   */
  private addMatchesFromSearcher(
    searchState: SearchState<TEntity>,
    searcherType: SearcherType,
    qualityOffset: number
  ): void {
    const stringSearcherQuery: Query = new Query(
      searchState.query.string, Infinity, searchState.query.minQuality, [searcherType]);
    const result: Result = this.stringSearcher.getMatches(stringSearcherQuery);
    this.addMatchesFromResult(searchState, result, qualityOffset);
  }

  /**
   * Add entity matches from the string searcher result to the search state.
   * @param searchState The current search state.
   * @param result The string searcher result.
   * @param qualityOffset The quality offset that is added.
   */
  private addMatchesFromResult(
    searchState: SearchState<TEntity>,
    result: Result,
    qualityOffset: number
  ): void {
    searchState.meta.push(result.meta);
    if (searchState.query.topN === 0) {
      return;
    }
    for (let i = 0, l = result.matches.length; i < l; i++) {
      const match = result.matches[i];
      const entityIndex: number = this.termIndexToEntityIndex[match.index];
      if (!searchState.matchedIndexes.has(entityIndex) && this.entities[entityIndex] !== null) {
        searchState.matchedIndexes.add(entityIndex);
        searchState.matches.push(new EntityMatch(
          this.entities[entityIndex] as TEntity, match.quality + qualityOffset, this.terms[match.index]));
        if (searchState.matches.length === searchState.query.topN) {
          break;
        }
      }
    }
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
