import { SearcherType } from '../interfaces/searcher-type.js';

export class SearcherSpec {
    /**
     * The searcher type.
     */
    public readonly type: SearcherType;
    /**
     * The minimum quality of matches to return. Increasing this value will increase the performance but reduce the
     * number of matches. Decreasing this value might retrieve irrelevant matches. The value must be greater than or
     * equal to 0.
     */
    public readonly minQuality: number;

    /**
     * Creates a new instance of the SearcherSpec class.
     * @param type The searcher type.
     * @param minQuality The minimum quality of matches to return. Increasing this value will increase the performance
     * but reduce the number of matches. Decreasing this value might retrieve irrelevant matches. The value must be
     * greater than or equal to 0. Values below 0 will be clamped to 0.
     */
    public constructor(type: SearcherType, minQuality: number) {
        this.type = type;
        this.minQuality = Math.max(0, minQuality);
    }
}

/**
 * Specification for the fuzzy searcher.
 */
export class FuzzySearcher extends SearcherSpec {
    /**
     * Creates a new instance of the FuzzySearcher class.
     * @param minQuality The minimum quality of matches to return. Increasing this value will increase the performance
     * but reduce the number of matches. Decreasing this value might retrieve irrelevant matches. The value must be
     * greater than or equal to 0.
     */
    public constructor(minQuality: number) {
        super(SearcherType.Fuzzy, minQuality);
    }
}

/**
 * Specification for the substring searcher.
 */
export class SubstringSearcher extends SearcherSpec {
    /**
     * Creates a new instance of the SubstringSearcher class.
     * @param minQuality The minimum quality of matches to return. Increasing this value will increase the performance
     * but reduce the number of matches. Decreasing this value might retrieve irrelevant matches. The value must be
     * greater than or equal to 0.
     */
    public constructor(minQuality: number) {
        super(SearcherType.Substring, minQuality);
    }
}

/**
 * Specification for the prefix searcher.
 */
export class PrefixSearcher extends SearcherSpec {
    /**
     * Creates a new instance of the PrefixSearcher class.
     * @param minQuality The minimum quality of matches to return. Increasing this value will increase the performance
     * but reduce the number of matches. Decreasing this value might retrieve irrelevant matches. The value must be
     * greater than or equal to 0.
     */
    public constructor(minQuality: number) {
        super(SearcherType.Prefix, minQuality);
    }
}
