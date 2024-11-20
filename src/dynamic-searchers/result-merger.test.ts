/* eslint-disable @typescript-eslint/no-explicit-any */

import { EntityMatch } from '../interfaces/entity-match.js';
import { EntityResult } from '../interfaces/entity-result.js';
import { Meta } from '../interfaces/meta.js';
import { Query } from '../interfaces/query.js';
import { ResultMerger } from './result-merger.js';

test('can merge empty results', () => {
  const result1 = new EntityResult([], new Query('Sarah'), new Meta(new Map<string, any>()));
  const result2 = new EntityResult([], new Query('Sarah'), new Meta(new Map<string, any>()));
  const mergedResult = ResultMerger.mergeResults(result1, result2);
  expect(mergedResult).toEqual(new EntityResult([], new Query('Sarah'), new Meta(new Map<string, any>())));
});

test('can merge disjoint results', () => {
  const result1 = new EntityResult(
    [new EntityMatch('Serah', 0.8, 'Serah'), new EntityMatch('Clara', 0.4, 'Clara')],
    new Query('Sarah'),
    new Meta(new Map<string, any>([['queryDuration', 3]]))
  );
  const result2 = new EntityResult(
    [new EntityMatch('Sarah', 1, 'Sarah')],
    new Query('Sarah'),
    new Meta(new Map<string, any>([['someKey', 'someValue']]))
  );
  const mergedResult = ResultMerger.mergeResults(result1, result2);
  expect(mergedResult).toEqual(
    new EntityResult(
      [
        new EntityMatch('Sarah', 1, 'Sarah'),
        new EntityMatch('Serah', 0.8, 'Serah'),
        new EntityMatch('Clara', 0.4, 'Clara')
      ],
      new Query('Sarah'),
      new Meta(
        new Map<string, any>([
          ['queryDuration', 3],
          ['someKey', 'someValue']
        ])
      )
    )
  );
});

test('can merge results with intersecting meta', () => {
  const result1 = new EntityResult(
    [new EntityMatch('Serah', 0.8, 'Serah'), new EntityMatch('Clara', 0.4, 'Clara')],
    new Query('Sarah'),
    new Meta(
      new Map<string, any>([
        ['queryDuration', 3],
        ['someKey', 'someValue']
      ])
    )
  );
  const result2 = new EntityResult(
    [new EntityMatch('Sarah', 1, 'Sarah')],
    new Query('Sarah'),
    new Meta(
      new Map<string, any>([
        ['queryDuration', 2],
        ['someKey', 'someOtherValue']
      ])
    )
  );
  const mergedResult = ResultMerger.mergeResults(result1, result2);
  expect(mergedResult).toEqual(
    new EntityResult(
      [
        new EntityMatch('Sarah', 1, 'Sarah'),
        new EntityMatch('Serah', 0.8, 'Serah'),
        new EntityMatch('Clara', 0.4, 'Clara')
      ],
      new Query('Sarah'),
      new Meta(
        new Map<string, any>([
          ['queryDuration', 5],
          ['someKey_0', 'someValue'],
          ['someKey_1', 'someOtherValue']
        ])
      )
    )
  );
});
