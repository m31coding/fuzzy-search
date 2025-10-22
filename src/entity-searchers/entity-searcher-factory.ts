import { Config } from '../config.js';
import { DefaultEntitySearcher } from './default-entity-searcher.js';
import { DefaultNormalizer } from '../normalization/default-normalizer.js';
import { DistinctSearcher } from '../string-searchers/distinct-searcher.js';
import { EntitySearcher } from '../interfaces/entity-searcher.js';
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

    const fuzzySearcher: StringSearcher = this.createFuzzySearcher(config.fuzzySearchConfig);
    const suffixArraySearcher: SuffixArraySearcher = this.createSubstringSearcher(config.substringSearchConfig);
    const prefixSearcher = this.createPrefixSearcher(suffixArraySearcher);

    let stringSearcher: StringSearcher = new SearcherSwitch(
      prefixSearcher,
      suffixArraySearcher,
      fuzzySearcher
    );

    stringSearcher = new DistinctSearcher(stringSearcher);
    stringSearcher = new SortingSearcher(stringSearcher);
    stringSearcher = new NormalizingSearcher(stringSearcher, defaultNormalizer, 'defaultNormalizationDuration');
    let entitySearcher: EntitySearcher<TEntity, TId> = new DefaultEntitySearcher<TEntity, TId>(stringSearcher);
    entitySearcher = new SortingEntitySearcher<TEntity, TId>(config.sortOrder, entitySearcher);
    return entitySearcher;
  }

  private static createDefaultNormalizer(config: Config): Normalizer {
    const forbiddenCharacters = new Set(
      [
        config.fuzzySearchConfig.paddingLeft.split(''),
        config.fuzzySearchConfig.paddingRight.split(''),
        config.fuzzySearchConfig.paddingMiddle.split(''),
        config.substringSearchConfig.suffixArraySeparator.split(''),
      ].flat()
    );

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
   * @param config The fuzzy search configuration.
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
    fuzzySearcher = new NormalizingSearcher(fuzzySearcher, ngramNormalizer, 'ngramNormalizationDuration');
    return fuzzySearcher;
  }

  private static createSubstringSearcher(config: SubstringSearchConfig): SuffixArraySearcher {
    const substringSearcher = new SuffixArraySearcher(config.suffixArraySeparator);
    return substringSearcher;
  }

  private static createPrefixSearcher(suffixArraySearcher: SuffixArraySearcher): StringSearcher {
    return new PrefixSearcher(suffixArraySearcher);
  }
}