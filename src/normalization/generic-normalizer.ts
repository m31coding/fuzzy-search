import { Meta } from '../interfaces/meta';
import { NormalizationResult } from './normalization-result';
import { Normalizer } from '../interfaces/normalizer';

/**
 * A generic normalizer that uses the provided normalization function.
 */
export class GenericNormalizer implements Normalizer {
  /**
   * Creates a new instance of the GenericNormalizer cla ss.
   * @param normalizationFunction The normalization function to use.
   */
  public constructor(private readonly normalizationFunction: (input: string) => string) {}

  /**
   * {@inheritDoc Normalizer.normalize}
   */
  public normalize(input: string): string {
    return this.normalizationFunction(input);
  }

  /**
   * {@inheritDoc Normalizer.normalizeBulk}
   */
  public normalizeBulk(input: string[]): NormalizationResult {
    const normalized = input.map((s) => this.normalize(s));
    return new NormalizationResult(normalized, new Meta());
  }
}
