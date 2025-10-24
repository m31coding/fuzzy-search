import { Config } from '../config.js';
import { DefaultEntitySearcher } from './default-entity-searcher.js';
import { DefaultNormalizer } from '../normalization/default-normalizer.js';
import { DistinctSearcher } from '../string-searchers/distinct-searcher.js';
import { EntitySearcher } from '../interfaces/entity-searcher.js';
// import { FastEntitySearcher } from '../entity-searchers/fast-entity-searcher.js'; // todo
import { FuzzySearchConfig } from '../fuzzy-search.js';
import { FuzzySearcher } from '../fuzzy-searchers/fuzzy-searcher.js';
import { InequalityPenalizingSearcher } from '../string-searchers/inequality-penalizing-searcher.js';
import { NgramComputer } from '../fuzzy-searchers/ngram-computer.js';
import { NgramNormalizer } from '../normalization/ngram-normalizer.js';
import { Normalizer } from '../interfaces/normalizer.js';
import { NormalizerConfig } from '../normalization/normalizer-config.js';
import { NormalizingSearcher } from '../string-searchers/normalizing-searcher.js';
import { PrefixSearcher } from '../suffix-array-searchers/prefix-searcher.js';
import { SearcherSwitch } from '../string-searchers/searcher-switch.js';
import { SearcherType } from '../interfaces/searcher-type.js';
import { SortingEntitySearcher } from './sorting-entity-searcher.js';
import { SortingSearcher } from '../string-searchers/sorting-searcher.js';
import { StringSearcher } from '../interfaces/string-searcher.js';
import { SubstringSearchConfig } from '../suffix-array-searchers/substring-search-config.js';
import { SuffixArraySearcher } from '../suffix-array-searchers/suffix-array-searcher.js';

/**
 * Factory for creating entity searchers.
 */
export class EntitySearcherFactory {
  /**
   * Creates a new entity searcher.
   * @typeParam TEntity The type of the entities.
   * @typeParam TId The type of the entity ids.
   * @param config The config to use.
   * @returns The entity searcher.
   */
  public static createSearcher<TEntity, TId>(config: Config): EntitySearcher<TEntity, TId> {
    const defaultNormalizer: Normalizer = this.createDefaultNormalizer(config);

    const fuzzySearcher: StringSearcher | null = this.tryCreateFuzzySearcher(config);
    const suffixArraySearcher: SuffixArraySearcher | null = this.tryCreateSubstringSearcher(config);
    const prefixSearcher: StringSearcher | null = this.tryCreatePrefixSearcher(config, suffixArraySearcher);

    let stringSearcher: StringSearcher = new SearcherSwitch(
      prefixSearcher,
      suffixArraySearcher,
      fuzzySearcher
    );

    stringSearcher = new DistinctSearcher(stringSearcher);
    stringSearcher = new SortingSearcher(stringSearcher);
    stringSearcher = new NormalizingSearcher(stringSearcher, defaultNormalizer, 'normalizationDurationDefault');
    let entitySearcher: EntitySearcher<TEntity, TId> =
      new DefaultEntitySearcher<TEntity, TId>(stringSearcher, config.searcherTypes);
    // entitySearcher = new FastEntitySearcher<TEntity, TId>(entitySearcher); // todo
    entitySearcher = new SortingEntitySearcher<TEntity, TId>(config.sortOrder, entitySearcher);
    return entitySearcher;
  }

  /**
   * Creates the default normalizer.
   * @param config The searcher configuration.
   * @returns The default normalizer.
   */
  private static createDefaultNormalizer(config: Config): Normalizer {
    const forbiddenCharacters = new Set();

    if (config.fuzzySearchConfig) {
      config.fuzzySearchConfig.paddingLeft.split('').forEach(c => forbiddenCharacters.add(c));
      config.fuzzySearchConfig.paddingRight.split('').forEach(c => forbiddenCharacters.add(c));
      config.fuzzySearchConfig.paddingMiddle.split('').forEach(c => forbiddenCharacters.add(c));
    }

    if (config.substringSearchConfig) {
      config.substringSearchConfig.suffixArraySeparator.split('').forEach(c => forbiddenCharacters.add(c));
    }

    const allowCharacter: (c: string) => boolean = (c) =>
      config.normalizerConfig.allowCharacter(c) && !forbiddenCharacters.has(c);
    const modifiedNormalizerConfig = new NormalizerConfig(
      config.normalizerConfig.replacements,
      config.normalizerConfig.treatCharacterAsSpace,
      allowCharacter
    );

    return DefaultNormalizer.create(modifiedNormalizerConfig);
  }

  /**
   * Creates the fuzzy string searcher if configured.
   * @param config The searcher configuration.
   * @returns The fuzzy string searcher or null.
   */
  private static tryCreateFuzzySearcher(config: Config): StringSearcher | null {
    if (!config.searcherTypes.includes(SearcherType.Fuzzy)) {
      return null;
    }
    if (config.fuzzySearchConfig === undefined) {
      throw new Error('Unable to create fuzzy searcher: No fuzzy search config provided.');
    }
    return this.createFuzzySearcher(config.fuzzySearchConfig);
  }

  /**
   * Creates the fuzzy string searcher.
   * @param config The fuzzy searcher configuration.
   * @returns The fuzzy string searcher.
   */
  private static createFuzzySearcher(config: FuzzySearchConfig): StringSearcher {
    const ngramComputer: NgramComputer = new NgramComputer(config.ngramN, config.transformNgram);
    const ngramNormalizer: Normalizer = new NgramNormalizer(
      config.paddingLeft,
      config.paddingRight,
      config.paddingMiddle
    );

    let fuzzySearcher: StringSearcher = new FuzzySearcher(ngramComputer);
    fuzzySearcher = new InequalityPenalizingSearcher(fuzzySearcher, config.inequalityPenalty);
    fuzzySearcher = new NormalizingSearcher(fuzzySearcher, ngramNormalizer, 'normalizationDurationNgrams');
    return fuzzySearcher;
  }

  /**
   * Creates the substring searcher if configured.
   * @param config The searcher configuration.
   * @returns The substring searcher or null.
   */
  private static tryCreateSubstringSearcher(config: Config): SuffixArraySearcher | null {
    if (!config.searcherTypes.includes(SearcherType.Substring)) {
      return null;
    }
    if (config.substringSearchConfig === undefined) {
      throw new Error('Unable to create substring searcher: No substring search config provided.');
    }
    return this.createSubstringSearcher(config.substringSearchConfig);
  }

  /**
   * Creates the substring searcher.
   * @param config The substring search config.
   * @returns The substring searcher.
   */
  private static createSubstringSearcher(config: SubstringSearchConfig): SuffixArraySearcher {
    return new SuffixArraySearcher(config.suffixArraySeparator);
  }

  /**
   * Creates the prefix searcher if configured.
   * @param config The searcher configuration.
   * @param suffixArraySearcher The suffix array searcher to use.
   * @returns The prefix searcher or null.
   */
  private static tryCreatePrefixSearcher(
    config: Config,
    suffixArraySearcher: SuffixArraySearcher | null
  ): StringSearcher | null {
    if (!config.searcherTypes.includes(SearcherType.Prefix)) {
      return null;
    }
    if (config.substringSearchConfig === undefined) {
      throw new Error('Unable to create prefix searcher: No substring search config provided.');
    }

    return this.createPrefixSearcher(config.substringSearchConfig, suffixArraySearcher);
  }

  /**
   * Creates the prefix searcher.
   * @param config The substring search configuration.
   * @param suffixArraySearcher The suffix array searcher to use.
   * @returns The prefix searcher.
   */
  private static createPrefixSearcher(
    config: SubstringSearchConfig,
    suffixArraySearcher: SuffixArraySearcher | null
  ): StringSearcher {
    if (suffixArraySearcher === null) {
      suffixArraySearcher = this.createSubstringSearcher(config);
    }
    return new PrefixSearcher(suffixArraySearcher);
  }
}