import { DynamicSearcher } from '../interfaces/dynamic-searcher.js';
import { Memento } from '../interfaces/memento.js';
import { Query } from '../interfaces/query.js';
import { SearcherFactory } from '../searcher-factory.js';
import { TestData } from '../commons/test-data.js';

function createSearcher(): DynamicSearcher<
  { firstName: string; lastName: string },
  { firstName: string; lastName: string }
> {
  return SearcherFactory.createDefaultSearcher<
    { firstName: string; lastName: string },
    { firstName: string; lastName: string }
  >();
}

test('loaded searcher gives same results', () => {
  const searcher1 = createSearcher();
  searcher1.indexEntities(
    TestData.persons,
    (person) => person,
    (person) => [person.firstName, person.lastName]
  );
  const memento = new Memento();
  searcher1.save(memento);
  const searcher2 = createSearcher();
  searcher2.load(memento);
  expect(searcher1.getMatches(new Query('Linda')).matches).toEqual(searcher2.getMatches(new Query('Linda')).matches);
  expect(searcher1.getMatches(new Query('John')).matches).toEqual(searcher2.getMatches(new Query('John')).matches);
  expect(searcher1.getMatches(new Query('Smith')).matches).toEqual(searcher2.getMatches(new Query('Smith')).matches);
});
