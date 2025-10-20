/**
 * Computes the n-grams of a string.
 */
export class NgramComputer {
  /**
   * The number of characters in each n-gram.
   */
  private readonly ngramN: number;

  /**
   * A function for transforming each n-gram. N-grams that are transformed to null will be removed.
   */
  private readonly transformNgram: (ngram: string) => string | null;

  /**
   * Creates a new instance of the NgramComputer class.
   * @param ngramN The number of characters in each n-gram.
   * @param transformNgram A function for transforming each n-gram. N-grams that are transformed to null will be
   * removed.
   */
  public constructor(ngramN: number, transformNgram?: (ngram: string) => string | null) {
    this.ngramN = ngramN;
    this.transformNgram = transformNgram ?? ((ngram): string => ngram);
  }

  /**
   * Computes the n-grams of the input string.
   * @param input The input string.
   * @returns The n-grams of the input string.
   */
  public computeNgrams(input: string): string[] {
    if (input.length === 0) {
      return [];
    }

    if (input.length <= this.ngramN) {
      const transformed = this.transformNgram(input);
      return transformed ? [transformed] : [];
    }

    const ngrams: string[] = [];
    for (let i = 0, l = this.maximumNumberOfNgrams(input); i < l; i++) {
      const transformed = this.transformNgram(input.substring(i, i + this.ngramN));
      if (transformed) {
        ngrams.push(transformed);
      }
    }
    return ngrams;
  }

  private maximumNumberOfNgrams(input: string): number {
    return Math.max(input.length - this.ngramN + 1, input.length > 0 ? 1 : 0);
  }
}
