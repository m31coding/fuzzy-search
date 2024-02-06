/**
 * Computes the quality of fuzzy search matches.
 */
export class QualityComputer {
  /**
   * Computes the Jaccard similarity coefficient.
   * @param nofNgramsTerm1 The number of n-grams of the first term.
   * @param nofNgramsTerm2 The number of n-grams of the second term.
   * @param nofCommonNgrams The number of common n-grams.
   * @returns The Jaccard similarity coefficient.
   */
  public static ComputeJaccardCoefficient(
    nofNgramsTerm1: number,
    nofNgramsTerm2: number,
    nofCommonNgrams: number
  ): number {
    return nofCommonNgrams / (nofNgramsTerm1 + nofNgramsTerm2 - nofCommonNgrams);
  }

  /**
   * Computes the overlap max coefficient. The coefficient is computed by dividing the intersection
   * size by the size of the larger set.
   * @param nofNgramsTerm1 The number of n-grams of the first term.
   * @param nofNgramsTerm2 The number of n-grams of the second term.
   * @param nofCommonNgrams The number of common n-grams.
   * @returns The overlap max coefficient.
   */
  public static ComputeOverlapMaxCoefficient(
    nofNgramsTerm1: number,
    nofNgramsTerm2: number,
    nofCommonNgrams: number
  ): number {
    return nofCommonNgrams / Math.max(nofNgramsTerm1, nofNgramsTerm2);
  }
}
