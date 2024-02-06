import { Config } from '../config';
import { DefaultEntitySearcher } from './default-entity-searcher';
import { DefaultNormalizer } from '../normalization/default-normalizer';
import { DistinctSearcher } from '../string-searchers/distinct-searcher';
import { FuzzySearcher } from '../fuzzy-searchers/fuzzy-searcher';
import { InequalityPenalizingSearcher } from '../string-searchers/inequality-penalizing-searcher';
import { NgramComputer } from '../fuzzy-searchers/ngram-computer';
import { Normalizer } from '../interfaces/normalizer';
import { NormalizingSearcher } from '../string-searchers/normalizing-searcher';
import { SortingSearcher } from '../string-searchers/sorting-searcher';
import { StringSearcher } from '../interfaces/string-searcher';

/**
 * Factory for creating entity searchers.
 */
export class EntitySearcherFactory {
  /**
   * Creates a new default entity searcher.
   * @typeParam TEntity The type of the entities.
   * @typeParam TId The type of the entity ids.
   * @param config The config to use.
   * @returns The default entity searcher.
   */
  public static createSearcher<TEntity, TId>(config: Config): DefaultEntitySearcher<TEntity, TId> {
    const ngramComputer: NgramComputer = new NgramComputer(config.ngramComputerConfig);
    const normalizer: Normalizer = DefaultNormalizer.create(config.normalizerConfig);
    let stringSearcher: StringSearcher = new FuzzySearcher(ngramComputer);
    stringSearcher = new InequalityPenalizingSearcher(stringSearcher, config.inequalityPenalty);
    stringSearcher = new DistinctSearcher(stringSearcher);
    stringSearcher = new SortingSearcher(stringSearcher);
    stringSearcher = new NormalizingSearcher(stringSearcher, normalizer);
    return new DefaultEntitySearcher<TEntity, TId>(stringSearcher);
  }
}
