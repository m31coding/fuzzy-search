import { Memento, Meta, Query, Result } from '../fuzzy-search.js';
import { StringSearcher } from '../interfaces/string-searcher.js';

export class SuffixArraySearcher implements StringSearcher {
    index(terms: string[]): Meta {
        throw new Error('Method not implemented.');
    }
    getMatches(query: Query): Result {
        throw new Error('Method not implemented.');
    }
    save(memento: Memento): void {
        throw new Error('Method not implemented.');
    }
    load(memento: Memento): void {
        throw new Error('Method not implemented.');
    }

}