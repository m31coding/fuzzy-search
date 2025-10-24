import { FuzzySearchConfig } from './fuzzy-searchers/fuzzy-search-config.js';
import { NormalizerConfig } from './normalization/normalizer-config.js';
import { SearcherType } from './interfaces/searcher-type.js';
import { SortOrder } from './sort-order.js';
import { SubstringSearchConfig } from './suffix-array-searchers/substring-search-config.js';

/**
 * Holds configuration values for the searcher.
 */
export class Config {
  /**
   * Creates a new instance of the Config class.
   * @param searcherTypes The seπarcher types to use.
   * @param normalizerConfig The configuration for the default normalizer.
   * @param maxQueryLength The maximum query length.
   * @param sortOrder The sort order for the entity matches.
   * @param fuzzySearchConfig The fuzzy search configuration.
   * @param substringSearchConfig The substring search configuration.
   */
  public constructor(
    public searcherTypes: SearcherType[],
    public normalizerConfig: NormalizerConfig,
    public maxQueryLength: number,
    public sortOrder: SortOrder,
    public fuzzySearchConfig?: FuzzySearchConfig,
    public substringSearchConfig?: SubstringSearchConfig
  ) { }

  /**
   * Creates an opinionated default configuration.
   * @returns The default configuration.
   */
  public static createDefaultConfig(): Config {
    const searcherTypes = [SearcherType.Fuzzy, SearcherType.Substring, SearcherType.Prefix];
    const normalizerConfig = NormalizerConfig.createDefaultConfig();
    const maxQueryLength = 150;
    const sortOrder = SortOrder.QualityAndMatchedString;
    const fuzzySearchConfig = FuzzySearchConfig.createDefaultConfig();
    const substringSearchConfig = SubstringSearchConfig.createDefaultConfig();
    return new Config(
      searcherTypes, normalizerConfig, maxQueryLength, sortOrder, fuzzySearchConfig, substringSearchConfig);
  }
}
