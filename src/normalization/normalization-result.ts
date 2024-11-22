import { Meta } from '../interfaces/meta.js';

/**
 * Represents a result from a bulk normalization.
 */
export class NormalizationResult {
  /**
   * Creates a new instance of the NormalizationResult class.
   * @param strings The normalized strings.
   * @param meta The meta data.
   */
  public constructor(
    public readonly strings: string[],
    public readonly meta: Meta
  ) {}
}
