import { EntityMatch } from '../interfaces/entity-match.js';
import { EntityResult } from '../interfaces/entity-result.js';
import { EntitySearcher } from '../interfaces/entity-searcher.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Query } from '../interfaces/query.js';
import { SortOrder } from '../sort-order.js';

/**
 * Sorts entity matches according to the specified order after retrieval.
 * @typeParam TEntity The type of the entities.
 * @typeParam TId The type of the entity ids.
 */
export class SortingEntitySearcher<TEntity, TId> implements EntitySearcher<TEntity, TId> {

    /**
     * The collator for string comparisons.
     */
    private readonly collator = new Intl.Collator(undefined, { numeric: true });

    /**
     * Creates a new instance of the SortingEntitySearcher class.
     * @typeParam TEntity The type of the entities.
     * @typeParam TId The type of the entity ids.
     * @param sortOrder The sort order to use for the entity matches.
     * @param entitySearcher The entity searcher to wrap and sort results from.
     */
    public constructor(
        private readonly sortOrder: SortOrder,
        private readonly entitySearcher: EntitySearcher<TEntity, TId>) { }

    /**
     * {@inheritDoc EntitySearcher.indexEntities}
     */
    public indexEntities(
        entities: TEntity[],
        getId: (entity: TEntity) => TId,
        getTerms: (entity: TEntity) => string[]
    ): Meta {
        return this.entitySearcher.indexEntities(entities, getId, getTerms);
    }

    /**
     * {@inheritDoc EntitySearcher.getMatches}
     */
    public getMatches(query: Query): EntityResult<TEntity> {
        const result = this.entitySearcher.getMatches(query);

        switch (this.sortOrder) {
            case SortOrder.QualityAndIndex:
                // The entity matches are already sorted by quality and index.
                return result;
            case SortOrder.QualityAndMatchedString:
                this.sortMatchesByQualityAndMatchedString(result.matches);
                return result;
            default:
                throw new Error(`Unsupported sort order: ${this.sortOrder}`);
        }
    }

    /**
     * Sorts the entity matches in place by quality and matched string.
     * @param matches The entity matches to sort.
     */
    private sortMatchesByQualityAndMatchedString(matches: EntityMatch<TEntity>[]): void {

        matches.sort((m1, m2) => {
            return (
                m1.quality > m2.quality ? -1
                    : m1.quality < m2.quality ? 1
                        : this.collator.compare(m1.matchedString, m2.matchedString)
            );
        });
    }

    /**
     * {@inheritDoc EntitySearcher.tryGetEntity}
     */
    public tryGetEntity(id: TId): TEntity | null {
        return this.entitySearcher.tryGetEntity(id);
    }

    /**
     * {@inheritDoc EntitySearcher.getEntities}
     */
    public getEntities(): TEntity[] {
        return this.entitySearcher.getEntities();
    }

    /**
     * {@inheritDoc EntitySearcher.tryGetTerms}
     */
    public tryGetTerms(id: TId): string[] | null {
        return this.entitySearcher.tryGetTerms(id);
    }

    /**
     * {@inheritDoc EntitySearcher.getTerms}
     */
    public getTerms(): string[] {
        return this.entitySearcher.getTerms();
    }

    /**
     * {@inheritDoc EntitySearcher.save}
     */
    public save(memento: Memento): void {
        this.entitySearcher.save(memento);
    }

    /**
     * {@inheritDoc EntitySearcher.load}
     */
    public load(memento: Memento): void {
        this.entitySearcher.load(memento);
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
}
