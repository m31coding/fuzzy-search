import { Match } from './match.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Result } from './result.js';
import { StringSearchQuery } from '../interfaces/string-search-query.js';
import { StringSearcher } from '../interfaces/string-searcher.js';

/**
 * Matches only strings that are equal to the query string. Used for unit tests.
 */
export class LiteralSearcher implements StringSearcher {
  /**
   * The terms to match.
   */
  private terms: string[];

  /**
   * Creates a new instance of the LiteralSearcher class.
   */
  public constructor() {
    this.terms = [];
  }

  /**
   * {@inheritDoc StringSearcher.index}
   */
  public index(terms: string[]): Meta {
    this.terms = terms;
    return new Meta();
  }

  /**
   * {@inheritDoc StringSearcher.getMatches}
   */
  public getMatches(query: StringSearchQuery): Result {
    const matches: Match[] = [];
    for (let i = 0, l = this.terms.length; i < l; i++) {
      const term = this.terms[i];
      if (term === query.string) {
        matches.push(new Match(i, 1));
      }
    }
    return new Result(matches, query, new Meta());
  }

  /**
   * {@inheritDoc StringSearcher.save}
   */
  public save(memento: Memento): void {
    memento.add(this.terms);
  }

  /**
   * {@inheritDoc StringSearcher.load}
   */
  public load(memento: Memento): void {
    this.terms = memento.get();
  }
}
