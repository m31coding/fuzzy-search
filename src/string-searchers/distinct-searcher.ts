import { ArrayUtilities } from '../commons/array-utilities.js';
import { Match } from './match.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Result } from './result.js';
import { StringSearchQuery } from '../interfaces/string-search-query.js';
import { StringSearcher } from '../interfaces/string-searcher.js';

/**
 * Ensures that the indexed strings are distinct and unique. Decreases
 * the memory consumption and increases the performance.
 */
export class DistinctSearcher implements StringSearcher {
  /**
   * Used to map unique term indexes to their original indexes. For example,
   * the terms [foo, foo, foo, bar, bar, baz, baz] result in the distinct
   * mapping array [0, 3, 5, 7].
   */
  private distinctMapping: Int32Array;

  /**
   * Used to map sorted indexes to unsorted indexes.
   */
  private sortMapping: Int32Array;

  /**
   * Creates a new instance of the DistinctSearcher class.
   * @param stringSearcher The string searcher to use.
   */
  public constructor(private readonly stringSearcher: StringSearcher) {
    this.distinctMapping = new Int32Array(0);
    this.sortMapping = new Int32Array(0);
  }

  /**
   * {@inheritDoc StringSearcher.index}
   */
  public index(terms: string[]): Meta {
    const termsSorted = terms.map((term, index) => ({ term, index }));
    termsSorted.sort((t1, t2) =>
      t1.term < t2.term ? -1
      : t1.term > t2.term ? 1
      : 0
    );
    this.sortMapping = new Int32Array(termsSorted.length);
    for (let i = 0, l = termsSorted.length; i < l; i++) {
      this.sortMapping[i] = termsSorted[i].index;
    }

    const distinctTerms: string[] = [];
    const distinctMappingNumbers = [];
    let j = 0;

    let previousTerm: string | null = null;

    for (let i = 0, l = termsSorted.length; i < l; i++) {
      const term: string = termsSorted[i].term;

      if (term != previousTerm) {
        distinctTerms[j] = term;
        distinctMappingNumbers[j] = i;
        j++;
      }

      previousTerm = term;
    }

    distinctMappingNumbers[j++] = termsSorted.length;
    this.distinctMapping = ArrayUtilities.ToInt32Array(distinctMappingNumbers);
    const meta = this.stringSearcher.index(distinctTerms);
    meta.add('numberOfDistinctTerms', distinctTerms.length);
    return meta;
  }

  /**
   * {@inheritDoc StringSearcher.getMatches}
   */
  public getMatches(query: StringSearchQuery): Result {
    const result: Result = this.stringSearcher.getMatches(query);
    const newMatches: Match[] = new Array(result.matches.length);
    let j = 0;

    result.matches.forEach((m) => {
      const start: number = this.distinctMapping[m.index];
      const end: number = this.distinctMapping[m.index + 1];

      for (let i = start; i < end; i++) {
        newMatches[j++] = new Match(this.sortMapping[i], m.quality);
      }
    });

    return new Result(newMatches, query, result.meta);
  }

  /**
   * {@inheritDoc StringSearcher.save}
   */
  public save(memento: Memento): void {
    memento.add(this.distinctMapping);
    memento.add(this.sortMapping);
    this.stringSearcher.save(memento);
  }

  /**
   * {@inheritDoc StringSearcher.load}
   */
  public load(memento: Memento): void {
    this.distinctMapping = memento.get();
    this.sortMapping = memento.get();
    this.stringSearcher.load(memento);
  }
}
