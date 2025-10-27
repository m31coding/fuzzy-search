import { Match } from '../string-searchers/match.js';
import { PrefixSearcher } from './prefix-searcher.js';
import { StringSearchQuery } from '../interfaces/string-search-query.js';
import { SuffixArraySearcher } from './suffix-array-searcher.js';

const suffixArraySearcher: SuffixArraySearcher = new SuffixArraySearcher('$');
suffixArraySearcher.index(['Alice', 'Bob', 'Carlos', 'Carol', 'Charlie']);
const prefixSearcher: PrefixSearcher = new PrefixSearcher(suffixArraySearcher);

function getMatches(queryString: string): Match[] {
  const query = new StringSearchQuery(queryString, 0);
  const matches = prefixSearcher.getMatches(query).matches;
  matches.sort((m1, m2) => m1.index - m2.index);
  return matches;
}

test('can find exact match test 1', () => {
  expect(getMatches('Alice')).toEqual([new Match(0, 1)]);
});

test('can find prefix match test 1', () => {
  expect(getMatches('B')).toEqual([new Match(1, 1 / 3)]);
});

test('can find prefix match test 2', () => {
  expect(getMatches('Bo')).toEqual([new Match(1, 2 / 3)]);
});

test('can find prefix match test 2', () => {
  expect(getMatches('Car')).toEqual([new Match(2, 3 / 6), new Match(3, 3 / 5)]);
});

test('can not find substring matches', () => {
  expect(getMatches('lice')).toEqual([]);
});

test('empty query returns no matches', () => {
  expect(getMatches('')).toEqual([]);
});

test('null query returns no matches', () => {
  expect(getMatches(null!)).toEqual([]);
});

test('undefined query returns no matches', () => {
  expect(getMatches(undefined!)).toEqual([]);
});
