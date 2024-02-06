/**
 * Illustrates how the default config is built. If you are feeling lucky, adjust the values according to your needs.
 */

import * as fuzzySearch from '../../dist/fuzzy-search.module.js';

const paddingLeft = '$$';
const paddingRight = '!';
const paddingMiddle = '!$$';
const replacements = [fuzzySearch.LatinReplacements.Value];
const spaceEquivalentCharacters = new Set(['_', '-', '–', '/', ',', '\t']);
const treatCharacterAsSpace = (c) => spaceEquivalentCharacters.has(c);
const allowCharacter = (c) => {
  return fuzzySearch.StringUtilities.isAlphanumeric(c);
};
const normalizerConfig = new fuzzySearch.NormalizerConfig(
  paddingLeft,
  paddingRight,
  paddingMiddle,
  replacements,
  treatCharacterAsSpace,
  allowCharacter
);

const ngramN = 3;
const transformNgram = (ngram) =>
  ngram.endsWith('$') ? null
  : ngram.indexOf('$') === -1 ? ngram.split('').sort().join('')
  : ngram;
const ngramComputerConfig = new fuzzySearch.NgramComputerConfig(ngramN, transformNgram);

const maxQueryLength = 150;
const inequalityPenalty = 0.05;
const config = new fuzzySearch.Config(normalizerConfig, ngramComputerConfig, maxQueryLength, inequalityPenalty);
const searcher = fuzzySearch.SearcherFactory.createSearcher(config);

const persons = [
  { id: 23501, firstName: 'Alice', lastName: 'King' },
  { id: 99234, firstName: 'Bob', lastName: 'Bishop' },
  { id: 5823, firstName: 'Carol', lastName: 'Queen' },
  { id: 11923, firstName: 'Charlie', lastName: 'Rook' }
];

const indexingMeta = searcher.indexEntities(
  persons,
  (e) => e.id,
  (e) => [e.firstName, e.lastName, `${e.firstName} ${e.lastName}`]
);
console.log('indexing meta:');
console.dir(indexingMeta);

const result = searcher.getMatches(new fuzzySearch.Query('alice kign'));
console.log('query result:');
console.dir(result);
