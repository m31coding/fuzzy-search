import { NormalizationResult } from '../normalization/normalization-result';

/**
 * Normalizes query strings and data strings.
 */
export interface Normalizer {
  /**
   * Normalizes the input string.
   * @param input The input string to normalize.
   * @returns The normalized string.
   */
  normalize(input: string): string;

  /**
   * Normalizes the input strings.
   * @param input The input strings to normalize.
   * @returns The normalization result including the normalized strings and meta data.
   */
  normalizeBulk(input: string[]): NormalizationResult;
}
