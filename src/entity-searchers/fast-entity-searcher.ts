import { PrefixSearcher, SubstringSearcher } from '../interfaces/searcher-spec.js';
import { EntityResult } from '../interfaces/entity-result.js';
import { EntitySearcher } from '../interfaces/entity-searcher.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Query } from '../interfaces/query.js';
import { SearcherType } from '../interfaces/searcher-type.js';
import { UsableSearchers } from '../commons/usable-searchers.js';

/**
 * A entity searcher that tries to optimize performance by querying with limited searchers and an increased quality
 * threshold at first.
 * @typeParam TEntity The type of the entities.
 * @typeParam TId The type of the entity ids.
 */
export class FastEntitySearcher<TEntity, TId> implements EntitySearcher<TEntity, TId> {
  /**
   * Creates a new instance of the FastEntitySearcher class.
   * @typeParam TEntity The type of the entities.
   * @typeParam TId The type of the entity ids.
   * @param entitySearcher The entity searcher.
   * @param searcherTypes The available searcher types.
   */
  public constructor(
    private readonly entitySearcher: EntitySearcher<TEntity, TId>,
    private readonly searcherTypes: SearcherType[]
  ) {}

  /**
   * {@inheritDoc EntitySearcher.indexEntities}
   */
  indexEntities(entities: TEntity[], getId: (entity: TEntity) => TId, getTerms: (entity: TEntity) => string[]): Meta {
    return this.entitySearcher.indexEntities(entities, getId, getTerms);
  }

  /**
   * {@inheritDoc EntitySearcher.getMatches}
   */
  getMatches(query: Query): EntityResult<TEntity> {
    const usableSearchers = new UsableSearchers(this.searcherTypes, query.searchers);

    if (query.topN > 200) {
      return this.entitySearcher.getMatches(query);
    }

    // Make the prefix searcher faster for short queries.
    if (
      query.string.length <= 3 &&
      usableSearchers.has(SearcherType.Prefix) &&
      usableSearchers.minQuality(SearcherType.Prefix) < 2.2
    ) {
      const newQuery = new Query(query.string, query.topN, [new PrefixSearcher(2.3)]);
      const result = this.entitySearcher.getMatches(newQuery);
      if (result.matches.length == query.topN) {
        return new EntityResult<TEntity>(result.matches, query, result.meta);
      }
    }

    // If there is no prefix searcher, make the substring searcher faster for short queries.
    if (
      query.string.length <= 3 &&
      !usableSearchers.has(SearcherType.Prefix) &&
      usableSearchers.has(SearcherType.Substring) &&
      usableSearchers.minQuality(SearcherType.Substring) < 1.2
    ) {
      const newQuery = new Query(query.string, query.topN, [new SubstringSearcher(1.3)]);
      const result = this.entitySearcher.getMatches(newQuery);
      if (result.matches.length == query.topN) {
        return new EntityResult<TEntity>(result.matches, query, result.meta);
      }
    }

    return this.entitySearcher.getMatches(query);
  }

  /**
   * {@inheritDoc EntitySearcher.tryGetEntity}
   */
  tryGetEntity(id: TId): TEntity | null {
    return this.entitySearcher.tryGetEntity(id);
  }

  /**
   * {@inheritDoc EntitySearcher.getEntities}
   */
  getEntities(): TEntity[] {
    return this.entitySearcher.getEntities();
  }

  /**
   * {@inheritDoc EntitySearcher.tryGetTerms}
   */
  tryGetTerms(id: TId): string[] | null {
    return this.entitySearcher.tryGetTerms(id);
  }

  /**
   * {@inheritDoc EntitySearcher.getTerms}
   */
  getTerms(): string[] {
    return this.entitySearcher.getTerms();
  }

  /**
   * {@inheritDoc EntitySearcher.removeEntity}
   */
  removeEntity(id: TId): boolean {
    return this.entitySearcher.removeEntity(id);
  }

  /**
   * {@inheritDoc EntitySearcher.replaceEntity}
   */
  replaceEntity(id: TId, newEntity: TEntity, newEntityId: TId): boolean {
    return this.entitySearcher.replaceEntity(id, newEntity, newEntityId);
  }

  /**
   * {@inheritDoc EntitySearcher.save}
   */
  save(memento: Memento): void {
    return this.entitySearcher.save(memento);
  }

  /**
   * {@inheritDoc EntitySearcher.load}
   */
  load(memento: Memento): void {
    return this.entitySearcher.load(memento);
  }
}
