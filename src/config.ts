import { FuzzySearchConfig } from './fuzzy-searchers/fuzzy-search-config.js';
import { NormalizerConfig } from './normalization/normalizer-config.js';

/**
 * Holds configuration values for the searcher.
 */
export class Config {
  /**
   * Creates a new instance of the Config class.
   * @param normalizerConfig The configuration for the default normalizer.
   * @param maxQueryLength The maximum query length.
   * @param fuzzySearchConfig The fuzzy search configuration.
   */
  public constructor(
    public normalizerConfig: NormalizerConfig,
    public maxQueryLength: number,
    public fuzzySearchConfig: FuzzySearchConfig,
  ) { }

  /**
   * Creates an opinionated default configuration.
   * @returns The default configuration.
   */
  public static createDefaultConfig(): Config {
    const normalizerConfig = NormalizerConfig.createDefaultConfig();
    const fuzzySearchConfig = FuzzySearchConfig.createDefaultConfig();
    return new Config(normalizerConfig, 150, fuzzySearchConfig);
  }
}
