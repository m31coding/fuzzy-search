import { DefaultNormalizer } from '../normalization/default-normalizer.js';
import { LiteralSearcher } from './literal-searcher.js';
import { Match } from './match.js';
import { MultiNormalizer } from '../normalization/multi-normalizer.js';
import { NgramNormalizer } from '../fuzzy-searchers/ngram-normalizer.js';
import { NormalizerConfig } from '../normalization/normalizer-config.js';
import { NormalizingSearcher } from './normalizing-searcher.js';
import { StringSearchQuery } from '../interfaces/string-search-query.js';
import { StringSearcher } from '../interfaces/string-searcher.js';

const defaultNormalizer = DefaultNormalizer.create(NormalizerConfig.createDefaultConfig());
const ngramNormalizer = new NgramNormalizer('$$', '!!', '%%');
const normalizer = new MultiNormalizer([defaultNormalizer, ngramNormalizer]);
const literalSearcher: StringSearcher = new LiteralSearcher();
const normalizingSearcher: StringSearcher = new NormalizingSearcher(literalSearcher, normalizer);
normalizingSearcher.index(['Hello world!']);

test('can find matches normalized test 1', () => {
  expect(normalizingSearcher.getMatches(new StringSearchQuery('HELLO-WORLD')).matches).toEqual([new Match(0, 1)]);
});

test('can find matches normalized test 2', () => {
  expect(normalizingSearcher.getMatches(new StringSearchQuery('!hello! world!!!')).matches).toEqual([new Match(0, 1)]);
});
