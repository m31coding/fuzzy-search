import { Match } from './match';
import { Memento } from '../interfaces/memento';
import { Meta } from '../interfaces/meta';
import { Query } from '../interfaces/query';
import { Result } from './result';
import { StringSearcher } from '../interfaces/string-searcher';

/**
 * A string searcher that sorts matches by their quality.
 * If two matches have the same quality, the match with the lower index comes first.
 */
export class SortingSearcher implements StringSearcher {
  /**
   * Creates a new instance of the SortingSearcher class.
   * @param stringSearcher The string searcher to use.
   */
  public constructor(private readonly stringSearcher: StringSearcher) {}

  /**
   * {@inheritDoc StringSearcher.index}
   */
  public index(terms: string[]): Meta {
    return this.stringSearcher.index(terms);
  }

  /**
   * {@inheritDoc StringSearcher.getMatches}
   */
  public getMatches(query: Query): Result {
    const result: Result = this.stringSearcher.getMatches(query);
    result.matches.sort(this.compareMatchesByQualityAndIndex);
    return result;
  }

  /**
   * Compares two matches by their quality and index. The match with the higher quality comes first. If the qualities
   * are equal, the match with the lower index comes first.
   * @param m1 The first match.
   * @param m2 The second match.
   * @returns A negative number if the first match comes first, a positive number if the second match comes first, or
   * zero if the matches are of equal order.
   */
  private compareMatchesByQualityAndIndex(m1: Match, m2: Match): number {
    return (
      m1.quality > m2.quality ? -1
      : m1.quality < m2.quality ? 1
      : m1.index < m2.index ? -1
      : m1.index > m2.index ? 1
      : 0
    );
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
