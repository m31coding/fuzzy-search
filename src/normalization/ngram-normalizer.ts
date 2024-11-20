import { Meta } from '../interfaces/meta.js';
import { NormalizationResult } from './normalization-result.js';
import { Normalizer } from '../interfaces/normalizer.js';
import { NormalizerConfig } from './normalizer-config.js';
import { StringUtilities } from '../commons/string-utilities.js';

/**
 * Normalization for creating proper n-grams.
 */
export class NgramNormalizer implements Normalizer {
  /**
   * The string that is appended to the left of the input string.
   */
  private readonly paddingLeft: string;

  /**
   * The string that is appended to the right of the input string.
   */
  private readonly paddingRight: string;

  /**
   * The string that is inserted for spaces in the input string.
   */
  private readonly paddingMiddle: string;

  /**
   * A set of all padding characters.
   */
  private readonly paddingCharacters: Set<string>;

  /**
   * A function that determines whether a character is treated as a space.
   */
  private readonly treatCharacterAsSpace: (c: string) => boolean;

  /**
   * A function that determines whether a character is allowed. Padding characters.
   * and surrogate characters are disallowed by default.
   */
  private readonly allowCharacter: (c: string) => boolean;

  /**
   * The number of encountered surrogate characters in a bulk normalization.
   */
  private numberOfSurrogateCharacters: number = 0;

  /**
   * Creates a new instance of the NgramNormalizer class.
   * @param normalizerConfig The configuration for the normalizer.
   */
  public constructor(normalizerConfig: NormalizerConfig) {
    this.paddingLeft = normalizerConfig.paddingLeft;
    this.paddingRight = normalizerConfig.paddingRight;
    this.paddingMiddle = normalizerConfig.paddingMiddle;
    this.paddingCharacters = new Set(
      [
        normalizerConfig.paddingLeft.split(''),
        normalizerConfig.paddingRight.split(''),
        normalizerConfig.paddingMiddle.split('')
      ].flat()
    );
    this.treatCharacterAsSpace = normalizerConfig.treatCharacterAsSpace;
    this.allowCharacter = normalizerConfig.allowCharacter;
  }

  /**
   * {@inheritDoc Normalizer.normalize}
   */
  public normalize(input: string): string {
    const normalized: string[] = new Array(input.length + 2);
    let j = 0;

    normalized[j++] = this.paddingLeft;
    let previousIsPadding = true;
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
        if (previousIsSkippedEmptyChar && !previousIsPadding) {
          normalized[j++] = this.paddingMiddle;
        }

        normalized[j++] = normalizedChar;
        properCharacterAdded = true;
        previousIsPadding = false;
        previousIsSkippedEmptyChar = false;
      }
    }

    normalized[j++] = this.paddingRight;

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

    if (this.isSurrogate(character) || this.paddingCharacters.has(character) || !this.allowCharacter(character)) {
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
