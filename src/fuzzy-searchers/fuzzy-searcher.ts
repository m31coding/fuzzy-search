import { InvertedIndex } from './inverted-index.js';
import { Match } from '../string-searchers/match.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { NgramComputer } from './ngram-computer.js';
import { QualityComputer } from './quality-computer.js';
import { Query } from '../interfaces/query.js';
import { Result } from '../string-searchers/result.js';
import { StringSearcher } from '../interfaces/string-searcher.js';
import { TermIds } from './term-ids.js';

/**
 * Uses n-grams to find approximate matches.
 */
export class FuzzySearcher implements StringSearcher {
  /**
   * The inverted index.
   */
  private invertedIndex: InvertedIndex;

  /**
   * The number of ngrams for each indexed term.
   */
  private numberOfNgrams: Int32Array;

  /**
   * The number of common ngrams between the query and each indexed term.
   */
  private commonNgramCounts: Int32Array;

  /**
   * Creates a new instance of the FuzzySearcher class.
   * @param ngramComputer The ngram computer to use.
   */
  public constructor(private readonly ngramComputer: NgramComputer) {
    this.invertedIndex = new InvertedIndex();
    this.numberOfNgrams = new Int32Array(0);
    this.commonNgramCounts = new Int32Array(0);
  }

  /**
   * {@inheritDoc StringSearcher.index}
   */
  public index(terms: string[]): Meta {
    const start = performance.now();
    this.invertedIndex = new InvertedIndex();
    this.commonNgramCounts = new Int32Array(terms.length);
    this.numberOfNgrams = new Int32Array(terms.length);
    let nofInvalidTerms = 0;

    for (let i = 0, l = terms.length; i < l; i++) {
      const term = terms[i];

      if (!this.isValidTerm(term)) {
        this.numberOfNgrams[i] = 0;
        nofInvalidTerms++;
        continue;
      }

      const ngrams: string[] = this.ngramComputer.computeNgrams(term);
      this.numberOfNgrams[i] = ngrams.length;
      const ngramsToFrequency: Map<string, number> = this.getNgramsToFrequency(ngrams);
      for (const [ngram, frequency] of ngramsToFrequency) {
        this.invertedIndex.add(ngram, i, frequency);
      }
    }

    this.invertedIndex.seal();

    const duration = Math.round(performance.now() - start);

    const meta = new Meta();
    meta.add('numberOfInvalidTerms', nofInvalidTerms);
    meta.add('indexingDurationFuzzySearcher', duration);
    return meta;
  }

  /**
   * Checks if the term is not undefined, null or empty.
   * @param term The term to check.
   * @returns True if the term is valid, false otherwise.
   */
  private isValidTerm(term: string): boolean {
    return term !== undefined && term !== null && term.trim() !== '';
  }

  /**
   * {@inheritDoc StringSearcher.getMatches}
   */
  public getMatches(query: Query): Result {
    if (this.invertedIndex.size === 0) {
      return new Result([], query, new Meta());
    }

    const ngrams: string[] = this.ngramComputer.computeNgrams(query.string);
    const ngramsToFrequency: Map<string, number> = this.getNgramsToFrequency(ngrams);
    const ngramsQuery: number = ngrams.length;

    this.computeCommonNgramCounts(ngramsToFrequency);
    const matches: Match[] = this.getMatchesFromCommonNgrams(ngramsQuery, query.minQuality);
    return new Result(matches, query, new Meta());
  }

  /**
   * Fills the common ngram counts array with the number of common ngrams between the query and each indexed term.
   * @param queryNgramsToFrequency The ngrams of the query and their frequencies.
   */
  private computeCommonNgramCounts(queryNgramsToFrequency: Map<string, number>): void {
    this.commonNgramCounts.fill(0);
    for (const [ngram, frequency] of queryNgramsToFrequency) {
      const termIds: TermIds | undefined = this.invertedIndex.getIds(ngram);
      if (termIds != undefined) {
        for (let i = 0, l = termIds.length; i < l; i++) {
          this.commonNgramCounts[termIds.ids[i]] += Math.min(frequency, termIds.frequencies[i]);
        }
      }
    }
  }

  /**
   * Returns a map from ngrams to their frequency.
   * @param ngrams The ngrams to count.
   * @returns A map from ngrams to their frequency.
   */
  private getNgramsToFrequency(ngrams: string[]): Map<string, number> {
    const ngramsToFrequency: Map<string, number> = new Map<string, number>();
    for (let i = 0, l = ngrams.length; i < l; i++) {
      const ngram = ngrams[i];
      const frequency: number | undefined = ngramsToFrequency.get(ngram);
      if (frequency !== undefined) {
        ngramsToFrequency.set(ngram, frequency + 1);
      } else {
        ngramsToFrequency.set(ngram, 1);
      }
    }
    return ngramsToFrequency;
  }

  /**
   * Returns the matches computed from the common ngrams.
   * @param ngramsQuery The number of ngrams in the query.
   * @param minQuality The minimum quality of the matches.
   * @returns The matches.
   */
  private getMatchesFromCommonNgrams(ngramsQuery: number, minQuality: number): Match[] {
    const matches: Match[] = [];
    for (let i = 0, l = this.numberOfNgrams.length; i < l; i++) {
      const quality: number = QualityComputer.ComputeOverlapMaxCoefficient(
        ngramsQuery,
        this.numberOfNgrams[i],
        this.commonNgramCounts[i]
      );
      if (quality > minQuality) {
        matches.push(new Match(i, quality));
      }
    }
    return matches;
  }

  /**
   * {@inheritDoc StringSearcher.save}
   */
  public save(memento: Memento): void {
    this.invertedIndex.save(memento);
    memento.add(this.numberOfNgrams);
  }

  /**
   * {@inheritDoc StringSearcher.load}
   */
  public load(memento: Memento): void {
    this.invertedIndex = new InvertedIndex();
    this.invertedIndex.load(memento);
    this.numberOfNgrams = memento.get();
    this.commonNgramCounts = new Int32Array(this.numberOfNgrams.length);
  }
}
