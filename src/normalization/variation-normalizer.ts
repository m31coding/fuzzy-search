import { Meta } from '../interfaces/meta';
import { NormalizationResult } from './normalization-result';
import { Normalizer } from '../interfaces/normalizer';

/**
 * Replaces variations with their basic characters.
 */
export class VariationNormalizer implements Normalizer {
  /**
   * Replacements. Each replacement map maps from the variation character to the base character(s).
   */
  private readonly replacements: Map<string, string>[];

  /**
   * Creates a new instance of the VariationNormalizer class.
   * @param variations The variations. Each variation map maps from the base character(s) to the variations.
   * @param normalizeVariationsAndInput A function that normalizes the variations and the input.
   */
  public constructor(
    variations: Map<string, string[]>[],
    private readonly normalizeVariationsAndInput: (variation: string) => string
  ) {
    this.replacements = [];
    for (const currentVariations of variations) {
      const currentReplacements = new Map<string, string>();
      for (const [baseCharacters, variationCharacters] of currentVariations) {
        for (const variationCharacter of variationCharacters) {
          const normalized = normalizeVariationsAndInput(variationCharacter);
          currentReplacements.set(normalized, baseCharacters);
        }
      }
      this.replacements.push(currentReplacements);
    }
  }

  /**
   * {@inheritDoc Normalizer.normalize}
   */
  public normalize(input: string): string {
    input = this.normalizeVariationsAndInput(input);
    const normalized: string[] = new Array(input.length);
    let j = 0;

    for (let i = 0, l = input.length; i < l; i++) {
      for (const currentReplacements of this.replacements) {
        const replacement = currentReplacements.get(input[i]);
        if (replacement !== undefined) {
          normalized[j++] = replacement;
          break;
        }
        normalized[j++] = input[i];
      }
    }

    return normalized.join('');
  }

  /**
   * {@inheritDoc Normalizer.normalizeBulk}
   */
  public normalizeBulk(input: string[]): NormalizationResult {
    const normalized = input.map((s) => this.normalize(s));
    return new NormalizationResult(normalized, new Meta());
  }
}
