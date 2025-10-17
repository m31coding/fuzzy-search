import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Normalizer } from '../interfaces/normalizer.js';
import { Query } from '../interfaces/query.js';
import { Result } from './result.js';
import { StringSearcher } from '../interfaces/string-searcher.js';

/**
 * A string searcher that normalizes the query string and the indexed strings before searching.
 */
export class NormalizingSearcher implements StringSearcher {
  /**
   * Creates a new instance of the NormalizingStringSearcher class.
   * @param stringSearcher The string searcher to use.
   * @param normalizer The normalizer to use.
   */
  public constructor(
    private readonly stringSearcher: StringSearcher,
    private readonly normalizer: Normalizer
  ) {}

  /**
   * {@inheritDoc StringSearcher.index}
   */
  public index(terms: string[]): Meta {
    const start = performance.now();
    const result = this.normalizer.normalizeBulk(terms);
    const duration = Math.round(performance.now() - start);
    const meta = this.stringSearcher.index(result.strings);
    meta.add('normalizationDuration', duration);
    for (const entry of result.meta.allEntries) {
      meta.add(entry[0], entry[1]);
    }
    return meta;
  }

  /**
   * {@inheritDoc StringSearcher.getMatches}
   */
  public getMatches(query: Query): Result {
    const normalizedQuery = new Query(this.normalizer.normalize(query.string), query.topN, query.minQuality);
    const result = this.stringSearcher.getMatches(normalizedQuery);
    return new Result(result.matches, query, result.meta);
  }

  /**
   * {@inheritDoc StringSearcher.save}
   */
  public save(memento: Memento): void {
    this.stringSearcher.save(memento);
  }

  /**
   * {@inheritDoc StringSearcher.load}
   */
  public load(memento: Memento): void {
    this.stringSearcher.load(memento);
  }
}
