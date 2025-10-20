import { Meta } from '../interfaces/meta.js';
import { NormalizationResult } from './normalization-result.js';
import { Normalizer } from '../interfaces/normalizer.js';
// todo: move to fuzzy-searchers
/**
 * Normalization for creating proper n-grams.
 */
export class NgramNormalizer implements Normalizer {

  /**
   * Creates a new instance of the NgramNormalizer class.
   * @param paddingLeft The string that is appended to the left of the input string.
   * @param paddingRight The string that is appended to the right of the input string.
   * @param paddingMiddle The string that is inserted for spaces in the input string.
   */
  public constructor(
    public readonly paddingLeft: string,
    public readonly paddingRight: string,
    public readonly paddingMiddle: string) {
  }

  /**
   * {@inheritDoc Normalizer.normalize}
   */
  public normalize(input: string): string {
    if (!input) {
      return input;
    }
    return `${this.paddingLeft}${input.split(' ').join(this.paddingMiddle)}${this.paddingRight}`;
  }

  /**
   * {@inheritDoc Normalizer.normalizeBulk}
   */
  public normalizeBulk(input: string[]): NormalizationResult {
    const normalized = input.map((s) => this.normalize(s));
    const meta = new Meta();
    return new NormalizationResult(normalized, meta);
  }
}
