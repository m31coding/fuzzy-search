/**
 * Holds configuration values for the n-gram computer.
 */
export class NgramComputerConfig {
  /**
   * Creates a new instance of the NgramComputerConfig class.
   * @param ngramN The number of characters in each n-gram.
   * @param transformNgram A function for transforming each n-gram. N-grams that are transformed to null will be
   * removed.
   */
  public constructor(
    public ngramN: number,
    public transformNgram?: (ngram: string) => string | null
  ) {}

  /**
   * Creates an opinionated default n-gram computer config. Removes n-grams that end with '$', sorts n-grams that don't
   * contain '$'. The config is closely related to the default NormalizerConfig.
   * @returns The default n-gram computer config.
   */
  public static createDefaultConfig(): NgramComputerConfig {
    return new NgramComputerConfig(3, (ngram) =>
      ngram.endsWith('$') ? null
      : ngram.indexOf('$') === -1 ? ngram.split('').sort().join('')
      : ngram
    );
  }
}
