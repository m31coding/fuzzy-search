import { LiteralSearcher } from './literal-searcher';
import { Match } from './match';
import { NgramNormalizer } from '../normalization/ngram-normalizer';
import { NormalizerConfig } from '../normalization/normalizer-config';
import { NormalizingSearcher } from './normalizing-searcher';
import { Query } from '../interfaces/query';
import { StringSearcher } from '../interfaces/string-searcher';

const config = NormalizerConfig.createDefaultConfig();
config.paddingLeft = '$$';
config.paddingRight = '!!';
config.paddingMiddle = '%%';
const normalizer = new NgramNormalizer(config);
const literalSearcher: StringSearcher = new LiteralSearcher();
const normalizingSearcher: StringSearcher = new NormalizingSearcher(literalSearcher, normalizer);
normalizingSearcher.index(['Hello world!']);

test('can find matches normalized test 1', () => {
  expect(normalizingSearcher.getMatches(new Query('HELLO-WORLD')).matches).toEqual([new Match(0, 1)]);
});

test('can find matches normalized test 2', () => {
  expect(normalizingSearcher.getMatches(new Query('!hello! world!!!')).matches).toEqual([new Match(0, 1)]);
});
