import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { MetaMerger } from '../commons/meta-merger.js';
import { Query } from '../interfaces/query.js';
import { Result } from '../string-searchers/result.js';
import { SearcherType } from '../interfaces/searcher-type.js';
import { StringSearcher } from '../interfaces/string-searcher.js';

/**
 * A searcher switch that routes to the prefix searcher, the substring searcher, or the fuzzy searcher. The prefix
 * searcher is a simple wrapper around the suffix array searcher. It will be always up to date with the substring 
 * searcher if present.
 */
export class SearcherSwitch implements StringSearcher {

    /**
     * Creates a new instance of the SearcherSwitch class.
     * @param prefixSearcher The prefix searcher.
     * @param substringSearcher The substring searcher.
     * @param fuzzySearcher The fuzzy searcher.
     */
    public constructor(
        private readonly prefixSearcher: StringSearcher | null,
        private readonly substringSearcher: StringSearcher | null,
        private readonly fuzzySearcher: StringSearcher | null,
    ) {
    }

    /**
     * {@inheritDoc StringSearcher.index}
     */
    index(terms: string[]): Meta {
        const meta = [];
        if (this.prefixSearcher && !this.substringSearcher) {
            const prefixSearcherMeta = this.prefixSearcher.index(terms);
            meta.push(prefixSearcherMeta);
        }
        if (this.substringSearcher) {
            const substringSearcherMeta = this.substringSearcher.index(terms);
            meta.push(substringSearcherMeta);
        }
        if (this.fuzzySearcher) {
            const fuzzySearcherMeta = this.fuzzySearcher.index(terms);
            meta.push(fuzzySearcherMeta);
        }
        return MetaMerger.mergeMeta(meta);
    }

    /**
     * {@inheritDoc StringSearcher.getMatches}
     */
    getMatches(query: Query): Result {

        if (query.searcherTypes.length != 1) {
            throw new Error('SearcherSwitch.getMatches only supports queries with a single searcher type.');
        }

        switch (query.searcherTypes[0]) {
            case SearcherType.Prefix:
                if (!this.prefixSearcher) {
                    throw new Error('No prefix searcher has been indexed.');
                }
                return this.prefixSearcher.getMatches(query);
            case SearcherType.Substring:
                if (!this.substringSearcher) {
                    throw new Error('No substring searcher has been indexed.');
                }
                return this.substringSearcher.getMatches(query);
            case SearcherType.Fuzzy:
                if (!this.fuzzySearcher) {
                    throw new Error('No fuzzy searcher has been indexed.');
                }
                return this.fuzzySearcher.getMatches(query);
            default:
                throw new Error(`Unknown searcher type: ${query.searcherTypes[0]}`);
        }
    }

    /**
     * {@inheritDoc StringSearcher.save}
     */
    save(memento: Memento): void {
        if (this.prefixSearcher && !this.substringSearcher) {
            this.prefixSearcher.save(memento);
        }
        if (this.substringSearcher) {
            this.substringSearcher.save(memento);
        }
        if (this.fuzzySearcher) {
            this.fuzzySearcher.save(memento);
        }
    }

    /**
     * {@inheritDoc StringSearcher.load}
     */
    load(memento: Memento): void {
        if (this.prefixSearcher && !this.substringSearcher) {
            this.prefixSearcher.load(memento);
        }
        if (this.substringSearcher) {
            this.substringSearcher.load(memento);
        }
        if (this.fuzzySearcher) {
            this.fuzzySearcher.load(memento);
        }
    }
}