import { DefaultNormalizer } from './normalization/default-normalizer.js';
import { NormalizerConfig } from './normalization/normalizer-config.js';

const config = NormalizerConfig.createDefaultConfig();
config.allowCharacter = (_c: string) => true;
const normalizer = DefaultNormalizer.create(config);
// const result = normalizer.normalize('Tô');
const result = 'Tô'.normalize("NFKD")
console.log("Result:")
console.log(result);