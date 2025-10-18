import { Meta } from '../interfaces/meta.js';
import { NormalizationResult } from './normalization-result.js';
import { Normalizer } from '../interfaces/normalizer.js';
import { StringUtilities } from '../commons/string-utilities.js';

/**
 * Normalizes every character according to the configuration.
 */
export class CharacterNormalizer implements Normalizer {
  /**
   * A function that determines whether a character is treated as a space.
   */
  private readonly treatCharacterAsSpace: (c: string) => boolean;

  /**
   * A function that determines whether a character is allowed. Surrogate characters are disallowed by default.
   */
  private readonly allowCharacter: (c: string) => boolean;

  /**
   * The number of encountered surrogate characters in a bulk normalization.
   */
  private numberOfSurrogateCharacters: number = 0;

  /**
   * Creates a new instance of the CharacterNormalizer class.
   * @param treatCharacterAsSpace A function that determines whether a character is treated as a space.
   * @param allowCharacter A function that determines whether a character is allowed.
   */
  public constructor(
    treatCharacterAsSpace: (c: string) => boolean,
    allowCharacter: (c: string) => boolean) {

    this.treatCharacterAsSpace = treatCharacterAsSpace;
    this.allowCharacter = allowCharacter;
  }

  /**
   * {@inheritDoc Normalizer.normalize}
   */
  public normalize(input: string): string {
    const normalized: string[] = new Array(input.length);
    let j = 0;

    let previousIsSkippedEmptyChar = false;
    let properCharacterAdded = false;

    for (let i = 0, l = input.length; i < l; i++) {
      const normalizedChar = this.getNormalizedCharacter(input[i]);

      if (normalizedChar === '') {
        continue;
      }

      if (normalizedChar === ' ') {
        previousIsSkippedEmptyChar = true;
      } else {
        if (previousIsSkippedEmptyChar && properCharacterAdded) {
          normalized[j++] = ' ';
        }

        normalized[j++] = normalizedChar;
        properCharacterAdded = true;
        previousIsSkippedEmptyChar = false;
      }
    }

    if (!properCharacterAdded) {
      return '';
    }

    return normalized.join('');
  }

  /**
   * Normalizes the given character. Space equivalent characters are replaced by a space. Characters
   * that are not allowed are removed, in addition to surrogate characters and padding characters.
   * @param character The character to normalize.
   * @returns The normalized character.
   */
  private getNormalizedCharacter(character: string): string {
    if (character === ' ' || this.treatCharacterAsSpace(character)) {
      return ' ';
    }

    if (this.isSurrogate(character) || !this.allowCharacter(character)) {
      return '';
    }

    return character.toLowerCase();
  }

  /**
   * Checks if the given character is part of a surrogate pair.
   * @param character The character to check.
   * @returns True if the character is part of a surrogate pair, false otherwise.
   */
  private isSurrogate(character: string): boolean {
    if (StringUtilities.isSurrogate(character)) {
      this.numberOfSurrogateCharacters++;
      return true;
    }
    return false;
  }

  /**
   * {@inheritDoc Normalizer.normalizeBulk}
   */
  public normalizeBulk(input: string[]): NormalizationResult {
    this.numberOfSurrogateCharacters = 0;
    const normalized = input.map((s) => this.normalize(s));
    const meta = new Meta();
    meta.add('numberOfSurrogateCharacters', this.numberOfSurrogateCharacters);
    return new NormalizationResult(normalized, meta);
  }
}
