import { CharacterNormalizer } from './character-normalizer.js';
import { StringUtilities } from '../commons/string-utilities.js';

const spaceEquivalentCharacters = new Set(['_', '-', '–', '/', ',', '\t']);
const normalizer = new CharacterNormalizer(
  c => spaceEquivalentCharacters.has(c), c => StringUtilities.isAlphanumeric(c));

test('can normalize empty string', () => {
  expect(normalizer.normalize('')).toBe('');
});

test('can normalize single lower case letter', () => {
  expect(normalizer.normalize('h')).toBe('h');
});

test('can normalize single upper case letter', () => {
  expect(normalizer.normalize('H')).toBe('h');
});

test('can normalize two letters', () => {
  expect(normalizer.normalize('He')).toBe('he');
});

test('can normalize three letters', () => {
  expect(normalizer.normalize('Hel')).toBe('hel');
});

test('can normalize single word', () => {
  expect(normalizer.normalize('HELLO')).toBe('hello');
});

test('can normalize two words', () => {
  expect(normalizer.normalize('Hello World')).toBe('hello world');
});

test('can normalize two words with forbidden character', () => {
  expect(normalizer.normalize('Hello$World')).toBe('helloworld');
});

test('can normalize single word with spaces', () => {
  expect(normalizer.normalize('  hello   ')).toBe('hello');
});

test('can normalize two words with spaces', () => {
  expect(normalizer.normalize('  hello    world ')).toBe('hello world');
});

test('can normalize emoji', () => {
  expect(normalizer.normalize('👩‍💻')).toBe('');
});

test('can normalize string with emoji', () => {
  expect(normalizer.normalize('hello 👩‍💻 world')).toBe('hello world');
});

test('can normalize string with emoji in the beginning', () => {
  expect(normalizer.normalize('👩‍💻helloworld')).toBe('helloworld');
});

test('can normalize string with emoji in the middle', () => {
  expect(normalizer.normalize('hello👩‍💻world')).toBe('helloworld');
});

test('can normalize string with emoji in the end', () => {
  expect(normalizer.normalize('helloworld👩‍💻')).toBe('helloworld');
});

test('can normalize string with several emojis', () => {
  expect(normalizer.normalize('👋hello👋👋world👩‍💻')).toBe('helloworld');
});

test('can normalize string with padding characters', () => {
  expect(normalizer.normalize('%hello!world$')).toBe('helloworld');
});

test('can normalize string with space equivalent characters', () => {
  expect(normalizer.normalize('Lorem-ipsum_dolor,sit amet')).toBe('lorem ipsum dolor sit amet');
});

test('can normalize string with space equivalent characters and additional spaces', () => {
  expect(normalizer.normalize('Lorem- ipsum _dolor , sit  amet')).toBe('lorem ipsum dolor sit amet');
});
