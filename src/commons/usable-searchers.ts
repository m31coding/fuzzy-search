import { SearcherSpec } from '../interfaces/searcher-spec.js';
import { SearcherType } from '../interfaces/searcher-type.js';

/**
 * Holds the searchers that are usable based on the available and requested searchers.
 */
export class UsableSearchers {
  /**
   * The usable searchers mapped by their type.
   */
  private readonly usableSearchers: Map<SearcherType, SearcherSpec>;

  /**
   * Creates a new instance of the UsableSearchers class.
   * @param availableSearchers The types of searchers that are available.
   * @param requestedSearchers The searchers requested for the query.
   */
  public constructor(availableSearchers: SearcherType[], requestedSearchers: SearcherSpec[]) {
    this.usableSearchers = new Map<SearcherType, SearcherSpec>();

    for (const requestedSearcher of requestedSearchers) {
      if (availableSearchers.includes(requestedSearcher.type)) {
        this.usableSearchers.set(requestedSearcher.type, requestedSearcher);
      }
    }
  }

  /**
   * Checks whether a searcher of the given type is usable.
   * @param type The type of the searcher.
   * @returns Whether the searcher is usable.
   */
  public has(type: SearcherType): boolean {
    return this.usableSearchers.has(type);
  }

  /**
   * Gets the minimum quality for the given searcher type.
   * @param type The type of the searcher.
   * @returns The minimum quality for the searcher type.
   */
  public minQuality(type: SearcherType): number {
    return this.usableSearchers.get(type)!.minQuality;
  }

  /**
   * Gets the searcher specification for the given type.
   * @param type The type of the searcher.
   * @returns The searcher specification for the searcher type.
   */
  public spec(type: SearcherType): SearcherSpec {
    return this.usableSearchers.get(type)!;
  }
}
