import { Meta } from '../interfaces/meta.js';
import { NormalizationResult } from './normalization-result.js';
import { Normalizer } from '../interfaces/normalizer.js';

/**
 * Replaces null and undefined with empty strings.
 */
export class SanitizingNormalizer implements Normalizer {
  /**
   * {@inheritDoc Normalizer.normalize}
   */
  public normalize(input: string): string {
    if (input) {
      return input;
    } else {
      return '';
    }
  }

  /**
   * {@inheritDoc Normalizer.normalizeBulk}
   */
  public normalizeBulk(input: string[]): NormalizationResult {
    const normalized = input.map((s) => this.normalize(s));
    return new NormalizationResult(normalized, new Meta());
  }
}
