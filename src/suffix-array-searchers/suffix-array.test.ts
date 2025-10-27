import { SuffixArray } from './suffix-array.js';

test('can create suffix array test 1', () => {
  const result = SuffixArray.create('banana$');
  expect(result).toEqual(new Int32Array([6, 5, 3, 1, 0, 4, 2]));
});

test('can create suffix array test 2', () => {
  const result = SuffixArray.create('mississippi');
  expect(result).toEqual(new Int32Array([10, 7, 4, 1, 0, 9, 8, 6, 3, 5, 2]));
});

test('can create suffix array of empty string', () => {
  const result = SuffixArray.create('');
  expect(result).toEqual(new Int32Array([]));
});

test('can not create suffix array of null', () => {
  expect(() => {
    SuffixArray.create(null!);
  }).toThrow();
});

test('can not create suffix array of undefined', () => {
  expect(() => {
    SuffixArray.create(undefined!);
  }).toThrow();
});
