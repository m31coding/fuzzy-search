import { Match } from '../string-searchers/match.js';
import { Query } from '../interfaces/query.js';
import { SuffixArraySearcher } from './suffix-array-searcher.js';

const suffixArraySearcher: SuffixArraySearcher = new SuffixArraySearcher();
suffixArraySearcher.index(['Alice', 'Bob', 'Carlos', 'Carol', 'Charlie']);

function getMatches(queryString: string): Match[] {
    const query = new Query(queryString, 10, 0);
    const matches = suffixArraySearcher.getMatches(query).matches;
    matches.sort((m1, m2) => m1.index - m2.index);
    return matches;
}

test('can find exact match test 1', () => {
    expect(getMatches('Alice')).toEqual([new Match(0, 1)]);
});

test('can find exact match test 2', () => {
    expect(getMatches('Bob')).toEqual([new Match(1, 1)]);
});

test('can find prefix matches test 1', () => {
    expect(getMatches('Bo')).toEqual([new Match(1, 2 / 3)]);
});

test('can find prefix matches test 2', () => {
    expect(getMatches('Cha')).toEqual([new Match(4, 3 / 7)]);
});

test('can find prefix matches test 3', () => {
    expect(getMatches('Car')).toEqual([new Match(2, 3 / 6), new Match(3, 3 / 5)]);
});

test('can find suffix matches test 1', () => {
    expect(getMatches('lice')).toEqual([new Match(0, 4 / 5)]);
});

test('can find suffix matches test 2', () => {
    expect(getMatches('ol')).toEqual([new Match(3, 2 / 5)]);
});

test('can find infix matches test 1', () => {
    expect(getMatches('arl')).toEqual([new Match(2, 3 / 6), new Match(4, 3 / 7)]);
});

test('can find infix matches test 2', () => {
    expect(getMatches('li')).toEqual(
        [new Match(0, 2 / 5), new Match(4, 2 / 7)]);
});

test('can find infix matches test 3', () => {
    expect(getMatches('l')).toEqual(
        [new Match(0, 1 / 5), new Match(2, 1 / 6), new Match(3, 1 / 5), new Match(4, 1 / 7)]);
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


