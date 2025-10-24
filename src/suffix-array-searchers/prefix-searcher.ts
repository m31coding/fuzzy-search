import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Result } from '../string-searchers/result.js';
import { StringSearchQuery } from '../interfaces/string-search-query.js';
import { StringSearcher } from '../interfaces/string-searcher.js';
import { SuffixArraySearcher } from './suffix-array-searcher.js';

/**
 * A prefix searcher that is a simple wrapper around the suffix array searcher.
 */
export class PrefixSearcher implements StringSearcher {

    /**
     * Creates a new instance of the PrefixSearcher class.
     * @param suffixArraySearcher The suffix array searcher.
     */
    public constructor(
        private readonly suffixArraySearcher: SuffixArraySearcher,
    ) {
    }

    /**
     * {@inheritDoc StringSearcher.index}
     */
    index(terms: string[]): Meta {
        return this.suffixArraySearcher.index(terms);
    }

    /**
     * {@inheritDoc StringSearcher.getMatches}
     */
    getMatches(query: StringSearchQuery): Result {
        if (!query.string) {
            return new Result([], query, new Meta());
        }
        const modifiedQueryString = this.modifyQueryString(query.string);
        const modifiedQuery = new StringSearchQuery(modifiedQueryString, query.minQuality, query.searcherType);
        return this.suffixArraySearcher.getMatches(modifiedQuery, query.string.length);
    }

    /**
     * Modifies the original query string by prepending the suffix array searcher's separator.
     * @param original The original query string.
     * @returns The modified query string.
     */
    private modifyQueryString(original: string): string {
        return `${this.suffixArraySearcher.separator}${original}`;
    }

    /**
     * {@inheritDoc StringSearcher.save}
     */
    save(memento: Memento): void {
        this.suffixArraySearcher.save(memento);
    }

    /**
     * {@inheritDoc StringSearcher.load}
     */
    load(memento: Memento): void {
        this.suffixArraySearcher.load(memento);
    }
}