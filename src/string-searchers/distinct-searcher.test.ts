import { DistinctSearcher } from './distinct-searcher.js';
import { LiteralSearcher } from './literal-searcher.js';
import { Match } from './match.js';
import { StringSearchQuery } from '../interfaces/string-search-query.js';
import { StringSearcher } from '../interfaces/string-searcher.js';

const literalSearcher: StringSearcher = new LiteralSearcher();
const distinctSearcher = new DistinctSearcher(literalSearcher);
distinctSearcher.index(['Bob', 'Carol', 'Alice', 'Bob', 'Charlie', 'Alice', 'Alice']);

test('can find matches with distinct searcher test 1', () => {
  expect(distinctSearcher.getMatches(new StringSearchQuery('Carol')).matches).toEqual([new Match(1, 1)]);
});

test('can find matches with distinct searcher test 2', () => {
  expect(distinctSearcher.getMatches(new StringSearchQuery('Bob')).matches).toEqual([new Match(0, 1), new Match(3, 1)]);
});

test('can find matches with distinct searcher test 3', () => {
  expect(distinctSearcher.getMatches(new StringSearchQuery('Alice')).matches).toEqual([
    new Match(2, 1),
    new Match(5, 1),
    new Match(6, 1)
  ]);
});
