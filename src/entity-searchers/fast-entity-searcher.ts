// todo: first shot: prefix searcher with given quality and substring searcher with higher quality if q<0.2

// import { EntityResult } from "../interfaces/entity-result.js";
// import { EntitySearcher } from "../interfaces/entity-searcher.js";
// import { Memento } from "../interfaces/memento.js";
// import { Meta } from "../interfaces/meta.js";
// import { Query } from "../interfaces/query.js";

// /**
//  * A entity searcher that tries to optimize performance by querying with an increased quality threshold at first.
//  * @typeParam TEntity The type of the entities.
//  * @typeParam TId The type of the entity ids.
//  */
// export class FastEntitySearcher<TEntity, TId> implements EntitySearcher<TEntity, TId> {

//     /**
//      * Creates a new instance of the FastEntitySearcher class.
//      * @typeParam TEntity The type of the entities.
//      * @typeParam TId The type of the entity ids.
//      * @param entitySearcher 
//      */
//     public constructor(private readonly entitySearcher: EntitySearcher<TEntity, TId>) {
//     }

//     /**
//      * {@inheritDoc EntitySearcher.indexEntities}
//      */
//     indexEntities(entities: TEntity[], getId: (entity: TEntity) => TId, getTerms: (entity: TEntity) => string[]): Meta {
//         return this.entitySearcher.indexEntities(entities, getId, getTerms);
//     }

//     /**
//      * {@inheritDoc EntitySearcher.getMatches}
//      */
//     getMatches(query: Query): EntityResult<TEntity> {
//         if (query.topN === Infinity || query.minQuality >= 0.2) {
//             return this.entitySearcher.getMatches(query);
//         }

//         const firstQuery = new Query(query.string, query.topN, 0.3, query.searcherTypes);
//         const result = this.entitySearcher.getMatches(firstQuery);
//         if (result.matches.length == query.topN) {
//             return new EntityResult<TEntity>(result.matches, query, result.meta);
//         }
//         else {
//             return this.entitySearcher.getMatches(query);
//         }
//     }

//     /**
//      * {@inheritDoc EntitySearcher.tryGetEntity}
//      */
//     tryGetEntity(id: TId): TEntity | null {
//         return this.entitySearcher.tryGetEntity(id);
//     }

//     /**
//      * {@inheritDoc EntitySearcher.getEntities}
//      */
//     getEntities(): TEntity[] {
//         return this.entitySearcher.getEntities();
//     }

//     /**
//      * {@inheritDoc EntitySearcher.tryGetTerms}
//      */
//     tryGetTerms(id: TId): string[] | null {
//         return this.entitySearcher.tryGetTerms(id);
//     }

//     /**
//      * {@inheritDoc EntitySearcher.getTerms}
//      */
//     getTerms(): string[] {
//         return this.entitySearcher.getTerms();
//     }

//     /**
//      * {@inheritDoc EntitySearcher.removeEntity}
//      */
//     removeEntity(id: TId): boolean {
//         return this.entitySearcher.removeEntity(id);
//     }

//     /**
//      * {@inheritDoc EntitySearcher.replaceEntity}
//      */
//     replaceEntity(id: TId, newEntity: TEntity, newEntityId: TId): boolean {
//         return this.entitySearcher.replaceEntity(id, newEntity, newEntityId);
//     }

//     /**
//      * {@inheritDoc EntitySearcher.save}
//      */
//     save(memento: Memento): void {
//         return this.entitySearcher.save(memento);
//     }

//     /**
//      * {@inheritDoc EntitySearcher.load}
//      */
//     load(memento: Memento): void {
//         return this.entitySearcher.load(memento);
//     }

// }