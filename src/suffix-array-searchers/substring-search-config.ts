/**
 * Holds substring search configuration values.
 */
export class SubstringSearchConfig {
  /**
   * Creates a new instance of the SubstringSearchConfig class.
   * @param suffixArraySeparator The suffix array separator character.
   */
  public constructor(
    public suffixArraySeparator: string
  ) { }

  /**
   * Creates a default configuration with '$' as the suffix array separator.
   * @returns The default configuration.
   */
  public static createDefaultConfig(): SubstringSearchConfig {
    return new SubstringSearchConfig('$');
  }
}
