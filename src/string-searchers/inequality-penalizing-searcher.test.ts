import { InequalityPenalizingSearcher } from './inequality-penalizing-searcher.js';
import { Match } from './match.js';
import { Memento } from '../interfaces/memento.js';
import { Meta } from '../interfaces/meta.js';
import { Query } from '../interfaces/query.js';
import { Result } from './result.js';

const stringSearcher = {
  index: (_terms: string[]): Meta => new Meta(),
  getMatches: (query: Query): Result => new Result([new Match(0, 1.0), new Match(1, 0.6)], query, new Meta()),
  save: (_memento: Memento): void => {},
  load: (_memento: Memento): void => {}
};

const inequalityPenalizingSearcher = new InequalityPenalizingSearcher(stringSearcher, 0.05);
inequalityPenalizingSearcher.index(['hello', 'yellow']);

test('can penalize unequal match', () => {
  expect(inequalityPenalizingSearcher.getMatches(new Query('hello')).matches).toEqual([
    new Match(0, 1),
    new Match(1, 0.6 * (1 - 0.05))
  ]);
});
