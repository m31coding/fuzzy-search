import { DefaultNormalizer } from './default-normalizer.js';
import { MultiNormalizer } from './multi-normalizer.js';
import { NgramNormalizer } from './ngram-normalizer.js';
import { NormalizerConfig } from './normalizer-config.js';

const defaultNormalizer = DefaultNormalizer.create(NormalizerConfig.createDefaultConfig());
const ngramNormalizer = new NgramNormalizer('$$', '!', '!$$');
const normalizer = new MultiNormalizer([defaultNormalizer, ngramNormalizer]);

test('normalization test 1', () => {
  expect(normalizer.normalize('Mikael Håkansson')).toBe('$$mikael!$$haakansson!');
});

test('normalization test 2', () => {
  expect(normalizer.normalize('Klara Åberg')).toBe('$$klara!$$aaberg!');
});

test('normalization test 3', () => {
  expect(normalizer.normalize('Andel Hadžić')).toBe('$$andel!$$hadzic!');
});

test('normalization test 4', () => {
  expect(normalizer.normalize('Lenni Gilliéron')).toBe('$$lenni!$$gillieron!');
});

test('normalization test 5', () => {
  expect(normalizer.normalize('Julieta Nieto Ríos')).toBe('$$julieta!$$nieto!$$rios!');
});

test('normalization test 6', () => {
  expect(normalizer.normalize('Æstrid Ærenlund')).toBe('$$aestrid!$$aerenlund!');
});

test('normalization test 7', () => {
  expect(normalizer.normalize('Ømer Østergaard')).toBe('$$omer!$$ostergaard!');
});

test('normalization test 8', () => {
  expect(normalizer.normalize('Sơn Lâm Đặng')).toBe('$$son!$$lam!$$dang!');
});

test('normalization test 9', () => {
  expect(normalizer.normalize('Thanh Việt Đoàn')).toBe('$$thanh!$$viet!$$doan!');
});

test('normalization test 10', () => {
  expect(normalizer.normalize('Thiên Duyên Tô')).toBe('$$thien!$$duyen!$$to!');
});

