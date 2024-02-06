import { DistinctSearcher } from './distinct-searcher';
import { LiteralSearcher } from './literal-searcher';
import { Match } from './match';
import { Query } from '../interfaces/query';
import { StringSearcher } from '../interfaces/string-searcher';

const literalSearcher: StringSearcher = new LiteralSearcher();
const distinctSearcher = new DistinctSearcher(literalSearcher);
distinctSearcher.index(['Bob', 'Carol', 'Alice', 'Bob', 'Charlie', 'Alice', 'Alice']);

test('can find matches with distinct searcher test 1', () => {
  expect(distinctSearcher.getMatches(new Query('Carol')).matches).toEqual([new Match(1, 1)]);
});

test('can find matches with distinct searcher test 2', () => {
  expect(distinctSearcher.getMatches(new Query('Bob')).matches).toEqual([new Match(0, 1), new Match(3, 1)]);
});

test('can find matches with distinct searcher test 3', () => {
  expect(distinctSearcher.getMatches(new Query('Alice')).matches).toEqual([
    new Match(2, 1),
    new Match(5, 1),
    new Match(6, 1)
  ]);
});
