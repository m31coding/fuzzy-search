import { CharacterNormalizer } from './character-normalizer.js';
import { GenericNormalizer } from './generic-normalizer.js';
import { MultiNormalizer } from './multi-normalizer.js';
import { Normalizer } from '../interfaces/normalizer.js';
import { NormalizerConfig } from './normalizer-config.js';
import { SanitizingNormalizer } from './sanitizing-normalizer.js';
import { VariationNormalizer } from './variation-normalizer.js';

/**
 * Factory for creating the default normalizer.
 */
export class DefaultNormalizer {
  /**
   * Creates the opinionated default normalizer.
   * @param normalizerConfig The configuration for the default normalizer.
   * @returns The default normalizer.
   */
  public static create(normalizerConfig: NormalizerConfig): Normalizer {
    const normalizer1 = new SanitizingNormalizer();
    const normalizer2 = new VariationNormalizer(normalizerConfig.replacements, (variation) =>
      variation.toLowerCase().normalize('NFKC')
    );
    const normalizer3 = new GenericNormalizer((input: string): string => input.normalize('NFKD'));
    const normalizer4 = new CharacterNormalizer(
      normalizerConfig.treatCharacterAsSpace,
      normalizerConfig.allowCharacter
    );
    const multiNormalizer = new MultiNormalizer([normalizer1, normalizer2, normalizer3, normalizer4]);
    return multiNormalizer;
  }
}
