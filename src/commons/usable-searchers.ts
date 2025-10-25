import { SearcherSpec } from '../interfaces/searcher-spec.js';
import { SearcherType } from '../interfaces/searcher-type.js';

// todo: docs
export class UsableSearchers {

    private readonly usableSearchers: Map<SearcherType, SearcherSpec>;

    public constructor(
        availableSearchers: SearcherType[],
        requestedSearchers: SearcherSpec[]) {
        this.usableSearchers = new Map<SearcherType, SearcherSpec>();

        for (const requestedSearcher of requestedSearchers) {
            if (availableSearchers.includes(requestedSearcher.type)) {
                this.usableSearchers.set(requestedSearcher.type, requestedSearcher);
            }
        }
    }

    public has(type: SearcherType): boolean {
        return this.usableSearchers.has(type);
    }

    public minQuality(type: SearcherType): number {
        return this.usableSearchers.get(type)!.minQuality;
    }
}