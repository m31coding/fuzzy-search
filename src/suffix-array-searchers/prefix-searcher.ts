import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Query } from '../interfaces/query.js';
import { Result } from '../string-searchers/result.js';
import { StringSearcher } from '../interfaces/string-searcher.js';
import { SuffixArraySearcher } from './suffix-array-searcher.js';

export class PrefixSearcher implements StringSearcher {

    public constructor(
        private readonly suffixArraySearcher: SuffixArraySearcher,
    ) {
    }

    /**
     * {@inheritDoc StringSearcher.index}
     */
    index(terms: string[]): Meta {
        console.warn('PrefixSearcher.index was called. Call SuffixArraySearcher.index instead.');
        return this.suffixArraySearcher.index(terms);
    }

    /**
     * {@inheritDoc StringSearcher.getMatches}
     */
    getMatches(query: Query): Result {
        if (!query.string) {
            return new Result([], query, new Meta());
        }
        const modifiedQueryString = this.modifyQueryString(query.string);
        const modifiedQuery = new Query(modifiedQueryString, query.topN, query.minQuality);
        return this.suffixArraySearcher.getMatches(modifiedQuery, query.string.length);
    }

    private modifyQueryString(original: string): string {
        return `${this.suffixArraySearcher.separator}${original}`;
    }

    /**
     * {@inheritDoc StringSearcher.save}
     */
    save(memento: Memento): void {
        console.warn('PrefixSearcher.save was called. Call SuffixArraySearcher.save instead.');
        this.suffixArraySearcher.save(memento);
    }

    /**
     * {@inheritDoc StringSearcher.load}
     */
    load(memento: Memento): void {
        console.warn('PrefixSearcher.load was called. Call SuffixArraySearcher.load instead.');
        this.suffixArraySearcher.load(memento);
    }

}