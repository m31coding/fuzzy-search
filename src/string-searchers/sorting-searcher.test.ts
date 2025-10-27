import { Match } from './match.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Result } from './result.js';
import { SortingSearcher } from './sorting-searcher.js';
import { StringSearchQuery } from '../interfaces/string-search-query.js';

const stringSearcher = {
  index: (_terms: string[]): Meta => new Meta(),
  getMatches: (query: StringSearchQuery): Result =>
    new Result(
      [new Match(7, 0.2), new Match(16, 1.0), new Match(10, 0.5), new Match(4, 0.5), new Match(8, 0.6)],
      query,
      new Meta()
    ),
  save: (_memento: Memento): void => {},
  load: (_memento: Memento): void => {}
};

const sortingSearcher = new SortingSearcher(stringSearcher);

test('can sort matches by quality and index', () => {
  expect(sortingSearcher.getMatches(new StringSearchQuery('some query')).matches).toEqual([
    new Match(16, 1.0),
    new Match(8, 0.6),
    new Match(4, 0.5),
    new Match(10, 0.5),
    new Match(7, 0.2)
  ]);
});
