import { InequalityPenalizingSearcher } from './inequality-penalizing-searcher';
import { Match } from './match';
import { Memento } from '../interfaces/memento';
import { Meta } from '../interfaces/meta';
import { Query } from '../interfaces/query';
import { Result } from './result';

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
