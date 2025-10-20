import { FuzzySearcher } from './fuzzy-searcher.js';
import { Match } from '../string-searchers/match.js';
import { NgramComputer } from './ngram-computer.js';
import { Query } from '../interfaces/query.js';
import { StringSearcher } from '../interfaces/string-searcher.js';

const commonNgramComputer = new NgramComputer(3);
const fuzzySearcher: StringSearcher = new FuzzySearcher(commonNgramComputer);
fuzzySearcher.index(['Alice', 'Bob', 'Carol', 'Charlie']);

test('can find exact match test 1', () => {
  expect(fuzzySearcher.getMatches(new Query('Alice')).matches).toEqual([new Match(0, 1)]);
});

test('can find exact match test 2', () => {
  expect(fuzzySearcher.getMatches(new Query('Bob')).matches).toEqual([new Match(1, 1)]);
});

test('can find approximate match test 1', () => {
  const matches: Match[] = fuzzySearcher.getMatches(new Query('Alic')).matches;
  expect(matches).toHaveLength(1);
  expect(matches[0].quality).toBeGreaterThan(0.3);
  expect(matches[0].quality).toBeLessThan(1);
});

test('can find approximate match test 2', () => {
  const matches: Match[] = fuzzySearcher.getMatches(new Query('Bobby', 10, 0.0)).matches;
  expect(matches).toHaveLength(1);
  expect(matches[0].quality).toBeGreaterThan(0.3);
  expect(matches[0].quality).toBeLessThan(1);
});

test('can find approximate match test 3', () => {
  const matches: Match[] = fuzzySearcher.getMatches(new Query('Charlei', 10, 0.0)).matches;
  expect(matches).toHaveLength(1);
  expect(matches[0].quality).toBeGreaterThan(0.3);
  expect(matches[0].quality).toBeLessThan(1);
});

test("can't find match for unindexed term", () => {
  expect(fuzzySearcher.getMatches(new Query('David')).matches).toEqual([]);
});

test("can't find match for empty string", () => {
  expect(fuzzySearcher.getMatches(new Query('')).matches).toEqual([]);
});
