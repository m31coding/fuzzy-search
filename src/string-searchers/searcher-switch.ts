import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { MetaMerger } from '../commons/meta-merger.js';
import { Query } from '../interfaces/query.js';
import { Result } from '../string-searchers/result.js';
import { SearcherType } from '../interfaces/searcher-type.js';
import { StringSearcher } from '../interfaces/string-searcher.js';

/**
 * A searcher switch that routes to the prefix searcher, the substring searcher, or the fuzzy searcher. The prefix
 * searcher is a simple wrapper around the suffix array searcher and only relevant for getMatches. It will be always up
 * to date with the substring searcher.
 */
export class SearcherSwitch implements StringSearcher {

    /**
     * Creates a new instance of the SearcherSwitch class.
     * @param prefixSearcher The prefix searcher.
     * @param substringSearcher The substring searcher.
     * @param fuzzySearcher The fuzzy searcher.
     */
    public constructor(
        private readonly prefixSearcher: StringSearcher,
        private readonly substringSearcher: StringSearcher,
        private readonly fuzzySearcher: StringSearcher,
    ) {
    }

    /**
     * {@inheritDoc StringSearcher.index}
     */
    index(terms: string[]): Meta {
        const substringSearcherMeta = this.substringSearcher.index(terms);
        const fuzzySearcherMeta = this.fuzzySearcher.index(terms);
        return MetaMerger.mergeMeta([fuzzySearcherMeta, substringSearcherMeta]);
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
                return this.prefixSearcher.getMatches(query);
            case SearcherType.Substring:
                return this.substringSearcher.getMatches(query);
            case SearcherType.Fuzzy:
                return this.fuzzySearcher.getMatches(query);
            default:
                throw new Error(`Unknown searcher type: ${query.searcherTypes[0]}`);
        }
    }

    /**
     * {@inheritDoc StringSearcher.save}
     */
    save(memento: Memento): void {
        this.substringSearcher.save(memento);
        this.fuzzySearcher.save(memento);
    }

    /**
     * {@inheritDoc StringSearcher.load}
     */
    load(memento: Memento): void {
        this.substringSearcher.load(memento);
        this.fuzzySearcher.load(memento);
    }
}