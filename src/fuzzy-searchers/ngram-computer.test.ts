import { NgramComputer } from './ngram-computer.js';

// Common n-grams.
const commonNgramComputer = new NgramComputer(3);

// Sorted n-grams.
const sortedNgramComputer = new NgramComputer(3, (ngram) => ngram.split('').sort().join(''));

// Default n-grams: remove n-grams that end with $, sort n-grams that don't contain $.
const defaultNgramComputer = new NgramComputer(3, (ngram) =>
  ngram.endsWith('$') ? null
    : ngram.indexOf('$') === -1 ? ngram.split('').sort().join('')
      : ngram
);

test('can compute n-grams of empty string', () => {
  expect(commonNgramComputer.computeNgrams('')).toEqual([]);
});

test('can compute n-grams of single character', () => {
  expect(commonNgramComputer.computeNgrams('a')).toEqual(['a']);
});

test('can compute n-grams of two characters', () => {
  expect(commonNgramComputer.computeNgrams('ab')).toEqual(['ab']);
});

test('can compute sorted n-grams of two characters', () => {
  expect(sortedNgramComputer.computeNgrams('ab')).toEqual(['ab']);
});

test('can compute sorted n-grams of two unsorted characters', () => {
  expect(sortedNgramComputer.computeNgrams('ba')).toEqual(['ab']);
});

test('can compute n-grams of three characters', () => {
  expect(commonNgramComputer.computeNgrams('abc')).toEqual(['abc']);
});

test('can compute sorted n-grams of three characters', () => {
  expect(sortedNgramComputer.computeNgrams('abc')).toEqual(['abc']);
});

test('can compute sorted n-grams of three unsorted characters', () => {
  expect(sortedNgramComputer.computeNgrams('cba')).toEqual(['abc']);
});

test('can compute n-grams of four characters', () => {
  expect(commonNgramComputer.computeNgrams('abcd')).toEqual(['abc', 'bcd']);
});

test('can compute sorted n-grams of four characters', () => {
  expect(sortedNgramComputer.computeNgrams('abcd')).toEqual(['abc', 'bcd']);
});

test('can compute sorted n-grams of four unsorted characters', () => {
  expect(sortedNgramComputer.computeNgrams('bdca')).toEqual(['bcd', 'acd']);
});

test('can compute n-grams of word', () => {
  expect(commonNgramComputer.computeNgrams('alice')).toEqual(['ali', 'lic', 'ice']);
});

test('can compute sorted n-grams of word', () => {
  expect(sortedNgramComputer.computeNgrams('alice')).toEqual(['ail', 'cil', 'cei']);
});

test('can compute n-grams of padded word', () => {
  expect(commonNgramComputer.computeNgrams('$$alice!!')).toEqual(['$$a', '$al', 'ali', 'lic', 'ice', 'ce!', 'e!!']);
});

test('can compute sorted n-grams of padded word', () => {
  expect(sortedNgramComputer.computeNgrams('$$alice!!')).toEqual(['$$a', '$al', 'ail', 'cil', 'cei', '!ce', '!!e']);
});

test('can compute n-grams of two padded words', () => {
  expect(commonNgramComputer.computeNgrams('$$alice%%king!!')).toEqual([
    '$$a',
    '$al',
    'ali',
    'lic',
    'ice',
    'ce%',
    'e%%',
    '%%k',
    '%ki',
    'kin',
    'ing',
    'ng!',
    'g!!'
  ]);
});

test('can compute sorted n-grams of two padded word', () => {
  expect(sortedNgramComputer.computeNgrams('$$alice%%king!!')).toEqual([
    '$$a',
    '$al',
    'ail',
    'cil',
    'cei',
    '%ce',
    '%%e',
    '%%k',
    '%ik',
    'ikn',
    'gin',
    '!gn',
    '!!g'
  ]);
});

test('can compute default n-grams of default padded word test 1', () => {
  expect(defaultNgramComputer.computeNgrams('$$hello')).toEqual(['$$h', '$he', 'ehl', 'ell', 'llo']);
});

test('can compute default n-grams of default padded word test 2', () => {
  expect(defaultNgramComputer.computeNgrams('$$alice')).toEqual(['$$a', '$al', 'ail', 'cil', 'cei']);
});

test('can compute default n-grams of default padded words', () => {
  expect(defaultNgramComputer.computeNgrams('$$alice$$king')).toEqual([
    '$$a',
    '$al',
    'ail',
    'cil',
    'cei',
    '$$k',
    '$ki',
    'ikn',
    'gin'
  ]);
});
