import { LatinReplacements } from './latin-replacements.js';
import { StringUtilities } from '../commons/string-utilities.js';

/**
 * Holds configuration values for the default normalizer.
 */
export class NormalizerConfig {
  /**
   * Creates a new instance of the NormalizerConfig class.
   * @param replacements A list of replacement maps. Each map maps from the variation character to the base
   * character(s).
   * @param treatCharacterAsSpace A function that determines whether a character is treated as a space.
   * @param allowCharacter A function that determines whether a character is allowed. Surrogate characters are 
   * disallowed by default.
   */
  public constructor(
    public replacements: Map<string, string[]>[],
    public treatCharacterAsSpace: (c: string) => boolean,
    public allowCharacter: (c: string) => boolean
  ) { }

  /**
   * Creates an opinionated default normalizer config. Applies latin replacements and filters out non-alphanumeric
   * characters. The full normalization pipeline is built in the class DefaultNormalizer and includes a lowercasing and
   * an NFKD normalization step.
   * @returns The default normalizer config.
   */
  public static createDefaultConfig(): NormalizerConfig {
    const spaceEquivalentCharacters = new Set(['_', '-', '–', '/', ',', '\t']);

    const allowCharacter: (c: string) => boolean = (c) => {
      return StringUtilities.isAlphanumeric(c);
    };

    return new NormalizerConfig(
      [LatinReplacements.Value],
      (c) => spaceEquivalentCharacters.has(c),
      allowCharacter
    );
  }
}


