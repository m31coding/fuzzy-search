import { NgramNormalizer } from './ngram-normalizer.js';

const normalizer = new NgramNormalizer('$$', '!!', '%%');

test('can normalize empty string', () => {
  expect(normalizer.normalize('')).toBe('');
});

test('can normalize single letter', () => {
  expect(normalizer.normalize('h')).toBe('$$h!!');
});

test('can normalize single word', () => {
  expect(normalizer.normalize('hello')).toBe('$$hello!!');
});

test('can normalize two words', () => {
  expect(normalizer.normalize('hello world')).toBe('$$hello%%world!!');
});

test('can normalize three words', () => {
  expect(normalizer.normalize('hello new world')).toBe('$$hello%%new%%world!!');
});
