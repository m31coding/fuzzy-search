import { Meta } from '../interfaces/meta';
import { NormalizationResult } from './normalization-result';
import { Normalizer } from '../interfaces/normalizer';

/**
 * A normalizer that applies multiple normalizers in sequence.
 */
export class MultiNormalizer implements Normalizer {
  /**
   * Creates a new instance of the MultiNormalizer class.
   */
  public constructor(private readonly normalizers: Normalizer[]) {}

  /**
   * {@inheritDoc Normalizer.normalize}
   */
  public normalize(input: string): string {
    for (let i = 0, l = this.normalizers.length; i < l; i++) {
      input = this.normalizers[i].normalize(input);
    }
    return input;
  }

  /**
   * {@inheritDoc Normalizer.normalizeBulk}
   */
  public normalizeBulk(input: string[]): NormalizationResult {
    const meta = new Meta();
    for (let i = 0, l = this.normalizers.length; i < l; i++) {
      const result = this.normalizers[i].normalizeBulk(input);
      input = result.strings;
      for (const entry of result.meta.allEntries) {
        meta.add(entry[0], entry[1]);
      }
    }
    return new NormalizationResult(input, meta);
  }
}
