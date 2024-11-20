import { Config } from '../config.js';
import { DefaultEntitySearcher } from './default-entity-searcher.js';
import { DefaultNormalizer } from '../normalization/default-normalizer.js';
import { DistinctSearcher } from '../string-searchers/distinct-searcher.js';
import { FuzzySearcher } from '../fuzzy-searchers/fuzzy-searcher.js';
import { InequalityPenalizingSearcher } from '../string-searchers/inequality-penalizing-searcher.js';
import { NgramComputer } from '../fuzzy-searchers/ngram-computer.js';
import { Normalizer } from '../interfaces/normalizer.js';
import { NormalizingSearcher } from '../string-searchers/normalizing-searcher.js';
import { SortingSearcher } from '../string-searchers/sorting-searcher.js';
import { StringSearcher } from '../interfaces/string-searcher.js';

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
