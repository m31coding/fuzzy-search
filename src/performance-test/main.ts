/**
 * Performance test. Run this file and check the git diff of the output files to see how the performance changed.
*/

import { readFileSync, writeFileSync } from 'fs';
import { Config } from '../config.js';
import { Meta } from '../interfaces/meta.js';
import { PerformanceTest } from '../performance/performance-test.js';
import { Query } from '../interfaces/query.js';
import { Report } from '../performance/report.js';
import { SearcherFactory } from '../searcher-factory.js';
import { TestRunParameters } from '../performance/test-run-parameters.js';

const outputPath = './src/performance-test/output';
const seed = 0;
const numberOfQueries = 2_000;
const topN = 10;

const text = readFileSync('./data/world-ctvs.txt', 'utf8');
const lines = text.split('\n').slice(1);
const entities = lines.map((l, index) => ({ id: index, name: l }));

interface GeoEntity {
  id: number;
  name: string;
}

const config = Config.createDefaultConfig();
config.normalizerConfig.allowCharacter = (_) => true;
const searcher = SearcherFactory.createSearcher<GeoEntity, number>(config);

console.log(`Indexing ${entities.length} entities...`);
const indexingMeta: Meta = searcher.indexEntities(
  entities,
  (e) => e.id,
  (e) => e.name.split(';')
);
const metaJson = metaToJson(indexingMeta);
writeFileSync(`${outputPath}/_indexing-meta.txt`, metaJson, { encoding: 'utf8' });
console.log(metaJson);

const performanceTest: PerformanceTest<GeoEntity, number> = new PerformanceTest<GeoEntity, number>(searcher);
const testRunParameters: TestRunParameters =
  new TestRunParameters(seed, numberOfQueries, topN, new Query('').searchers);

console.log('Running performance test...');
const report: Report = performanceTest.run(testRunParameters);
const reportJson = reportToJson(report);
writeFileSync(`${outputPath}/performance.txt`, reportJson);
console.log(reportJson);

function metaToJson(meta: Meta): string {
  return JSON.stringify(Object.fromEntries(meta.allEntries), null, 2);
}

function reportToJson(report: Report): string {
  return JSON.stringify(report, null, 2);
}
