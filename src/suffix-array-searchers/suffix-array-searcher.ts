import { Match } from '../string-searchers/match.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Result } from '../string-searchers/result.js';
import { StringComparison } from './string-comparison.js';
import { StringSearchQuery } from '../interfaces/string-search-query.js';
import { StringSearcher } from '../interfaces/string-searcher.js';
import { SuffixArray } from './suffix-array.js';

/**
 * A suffix array-based string searcher.
 */
export class SuffixArraySearcher implements StringSearcher {
  public readonly separator: string;
  private str: string;
  private suffixArray: Int32Array;
  private indexToTermIndex: Int32Array;
  private termLengths: Int32Array;

  /**
   * Creates a new instance of the SuffixArraySearcher class.
   * @param separator The separator used between terms.
   */
  public constructor(separator: string) {
    this.separator = separator;
    this.str = '';
    this.suffixArray = new Int32Array(0);
    this.indexToTermIndex = new Int32Array(0);
    this.termLengths = new Int32Array(0);
  }

  /**
   * {@inheritDoc StringSearcher.index}
   */
  index(terms: string[]): Meta {
    const start = performance.now();
    this.str = this.separator + terms.join(this.separator) + this.separator;
    this.suffixArray = SuffixArray.create(this.str);
    this.indexToTermIndex = new Int32Array(this.suffixArray.length);
    this.termLengths = new Int32Array(terms.length);

    let i = 0;
    for (let j = 0; j < terms.length; j++) {
      this.termLengths[j] = terms[j].length;
      for (let k = 0; k <= terms[j].length; k++) {
        this.indexToTermIndex[i++] = j;
      }
    }

    this.indexToTermIndex[i++] = -1;
    const duration = Math.round(performance.now() - start);

    const meta = new Meta();
    meta.add('indexingDurationSuffixArraySearcher', duration);
    return meta;
  }

  /**
   * {@inheritDoc StringSearcher.getMatches}
   */
  getMatches(query: StringSearchQuery, queryLength?: number): Result {
    if (!query.string) {
      return new Result([], query, new Meta());
    }

    const [start, end] = this.GetPositionsInSuffixArray(query.string);
    const matchedTermIds = new Int32Array(end - start);
    const seen: Set<number> = new Set<number>();
    let uniqueCount = 0;

    for (let j = start; j < end; j++) {
      const termIndex = this.indexToTermIndex[this.suffixArray[j]];
      if (!seen.has(termIndex)) {
        seen.add(termIndex);
        matchedTermIds[uniqueCount++] = termIndex;
      }
    }

    const matches: Match[] = [];

    queryLength = queryLength ?? query.string.length;
    let quality = 0;
    for (let k = 0; k < uniqueCount; k++) {
      quality = this.computeQuality(queryLength, this.termLengths[matchedTermIds[k]]);
      if (quality > query.minQuality) {
        matches.push(new Match(matchedTermIds[k], quality));
      }
    }

    return new Result(matches, query, new Meta());
  }

  /**
   * Computes the quality of a match based on the lengths of the query and the term.
   * @param queryLength The length of the query.
   * @param termLength The length of the term.
   * @returns The quality of the match.
   */
  private computeQuality(queryLength: number, termLength: number): number {
    return queryLength / termLength;
  }

  /**
   * Gets the positions in the suffix array where the given substring matches.
   * @param substring The substring to search for.
   * @returns The start and end positions of the substring in the suffix array. The start is inclusive, the end is 
   * exclusive.
   */
  private GetPositionsInSuffixArray(substring: string): number[] {
    let l = 0;
    let r = this.suffixArray.length;
    let mid = 0;

    while (l < r) {
      mid = Math.floor((l + r) / 2);

      if (StringComparison.compareOrdinal(substring, 0, this.str, this.suffixArray[mid], substring.length) > 0) {
        l = mid + 1;
      } else {
        r = mid;
      }
    }

    const start = l;
    r = this.suffixArray.length;

    while (l < r) {
      mid = Math.floor((l + r) / 2);
      if (StringComparison.compareOrdinal(substring, 0, this.str, this.suffixArray[mid], substring.length) == 0) {
        l = mid + 1;
      } else {
        r = mid;
      }
    }

    return [start, r];
  }

  /**
   * {@inheritDoc StringSearcher.save}
   */
  save(memento: Memento): void {
    memento.add(this.str);
    memento.add(this.suffixArray);
    memento.add(this.indexToTermIndex);
    memento.add(this.termLengths);
  }

  /**
   * {@inheritDoc StringSearcher.load}
   */
  load(memento: Memento): void {
    this.str = memento.get();
    this.suffixArray = memento.get();
    this.indexToTermIndex = memento.get();
    this.termLengths = memento.get();
  }
}
