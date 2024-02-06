import { Config } from './config';
import { DefaultDynamicSearcher } from './dynamic-searchers/default-dynamic-searcher';
import { DynamicSearcher } from './interfaces/dynamic-searcher';
import { EntitySearcherFactory } from './entity-searchers/entity-searcher-factory';
import { TimingDynamicSearcher } from './dynamic-searchers/timing-dynamic-searcher';

/**
 * Factory for creating dynamic searchers.
 */
export class SearcherFactory {
  /**
   * Creates a new dynamic searcher.
   * @typeParam TEntity The type of the entities.
   * @typeParam TId The type of the entity ids.
   * @param config The config to use.
   */
  public static createSearcher<TEntity, TId>(config: Config): DynamicSearcher<TEntity, TId> {
    const mainSearcher = EntitySearcherFactory.createSearcher<TEntity, TId>(config);
    const secondarySearcher = EntitySearcherFactory.createSearcher<TEntity, TId>(config);
    let dynamicSearcher: DynamicSearcher<TEntity, TId> = new DefaultDynamicSearcher<TEntity, TId>(
      config.maxQueryLength,
      mainSearcher,
      secondarySearcher
    );
    dynamicSearcher = new TimingDynamicSearcher<TEntity, TId>(dynamicSearcher);
    return dynamicSearcher;
  }

  /**
   * Creates a new default dynamic searcher.
   * @typeParam TEntity The type of the entities.
   * @typeParam TId The type of the entity ids.
   */
  public static createDefaultSearcher<TEntity, TId>(): DynamicSearcher<TEntity, TId> {
    const defaultConfig: Config = Config.createDefaultConfig();
    return this.createSearcher(defaultConfig);
  }
}
