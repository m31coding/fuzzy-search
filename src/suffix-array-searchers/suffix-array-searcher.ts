import { Match } from '../string-searchers/match.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Result } from '../string-searchers/result.js';
import { StringComparison } from './string-comparison.js';
import { StringSearchQuery } from '../interfaces/string-search-query.js';
import { StringSearcher } from '../interfaces/string-searcher.js';
import { SuffixArray } from './suffix-array.js';

// todo: make sure the terms don't have the separating character. Move to a suffix array config.

export class SuffixArraySearcher implements StringSearcher {
  public readonly separator: string;
  private str: string;
  private suffixArray: Int32Array;
  private indexToTermIndex: Int32Array;
  private termLengths: Int32Array;

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

    // todo prefix: pass query.string modified
    const [start, end] = this.GetPositionsInSuffixArray(query.string);
    // todo: refactor such that end is included.
    const matchedTermIds = new Int32Array(end - start);

    let i = 0;
    for (let j = start; j < end; j++) {
      const termIndex = this.indexToTermIndex[this.suffixArray[j]];
      matchedTermIds[i++] = termIndex;
    }

    const matches: Match[] = [];

    queryLength = queryLength ?? query.string.length;
    let quality = 0;
    for (let k = 0; k < matchedTermIds.length; k++) {
      quality = this.computeQuality(queryLength, this.termLengths[matchedTermIds[k]]);
      if (quality > query.minQuality) {
        matches.push(new Match(matchedTermIds[k], quality));
      }
    }

    // todo: remove duplicate matches, measure performance
    return new Result(matches, query, new Meta());
  }

  private computeQuality(queryLength: number, termLength: number): number {
    return queryLength / termLength;
  }

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
