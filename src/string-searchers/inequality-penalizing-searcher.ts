import { HashUtilities } from '../commons/hash-utilities.js';
import { Match } from './match.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Query } from '../interfaces/query.js';
import { Result } from './result.js';
import { StringSearcher } from '../interfaces/string-searcher.js';

/**
 * A string searcher that penalizes matches that are unequal to the query string. More precisely, in order to safe
 * memory, only the hashes are compared for equality. The penalty is useful because the mapping from strings to their
 * n-grams is not bijective. E.g. the strings "aabaaa" and "aaabaa" have the same n-grams, but are not equal.
 */
export class InequalityPenalizingSearcher implements StringSearcher {
  /**
   * The penalty factor applied to matches that have a different hash code than the query string.
   */
  private readonly penaltyFactor: number;

  /**
   * The hashes of the indexed strings.
   */
  private hashCodes: Int32Array;

  /**
   * Creates a new instance of the InequalityPenalizingSearcher class.
   * @param stringSearcher The string searcher to use.
   * @param penalty The penalty value in the range [0, 1]. The quality of affected matches is
   * multiplied by 1 - penalty.
   */
  public constructor(
    private readonly stringSearcher: StringSearcher,
    penalty: number
  ) {
    this.penaltyFactor = 1 - penalty;
    this.hashCodes = new Int32Array(0);
  }

  /**
   * {@inheritDoc StringSearcher.index}
   */
  public index(terms: string[]): Meta {
    this.hashCodes = new Int32Array(terms.length);
    for (let i = 0, l = terms.length; i < l; i++) {
      this.hashCodes[i] = HashUtilities.getHashCode(terms[i]);
    }
    return this.stringSearcher.index(terms);
  }

  /**
   * {@inheritDoc StringSearcher.getMatches}
   */
  public getMatches(query: Query): Result {
    const hashCodeQuery = HashUtilities.getHashCode(query.string);
    const result = this.stringSearcher.getMatches(query);
    const newMatches = result.matches
      .map((m) => this.penalizeMatch(m, hashCodeQuery))
      .filter((m) => m.quality >= query.minQuality);
    return new Result(newMatches, result.query, result.meta);
  }

  /**
   * Penalizes a match if it has a different hash code than the query string.
   * @param match The match to penalize.
   * @param hashCodeQuery The hash code of the query string.
   * @returns The penalized match.
   */
  private penalizeMatch(match: Match, hashCodeQuery: number): Match {
    const hashCodeMatch = this.hashCodes[match.index];
    const penalty = hashCodeMatch === hashCodeQuery ? 1 : this.penaltyFactor;
    match.quality *= penalty;
    return match;
  }

  /**
   * {@inheritDoc StringSearcher.save}
   */
  public save(memento: Memento): void {
    memento.add(this.hashCodes);
    this.stringSearcher.save(memento);
  }

  /**
   * {@inheritDoc StringSearcher.load}
   */
  public load(memento: Memento): void {
    this.hashCodes = memento.get();
    this.stringSearcher.load(memento);
  }
}
