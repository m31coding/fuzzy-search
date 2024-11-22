import { NgramComputerConfig } from './fuzzy-searchers/ngram-computer-config.js';
import { NormalizerConfig } from './normalization/normalizer-config.js';

/**
 * Holds configuration values for the searcher.
 */
export class Config {
  /**
   * Creates a new instance of the Config class.
   * @param normalizerConfig The configuration for the default normalizer.
   * @param ngramComputerConfig The configuration for the n-gram computer.
   * @param maxQueryLength The maximum query length.
   * @param inequalityPenalty The inequality penalty.
   */
  public constructor(
    public normalizerConfig: NormalizerConfig,
    public ngramComputerConfig: NgramComputerConfig,
    public maxQueryLength: number,
    public inequalityPenalty: number
  ) {}

  /**
   * Creates an opinionated default configuration.
   * @returns The default configuration.
   */
  public static createDefaultConfig(): Config {
    const normalizerConfig = NormalizerConfig.createDefaultConfig();
    const ngramComputerConfig = NgramComputerConfig.createDefaultConfig();
    return new Config(normalizerConfig, ngramComputerConfig, 150, 0.05);
  }
}
