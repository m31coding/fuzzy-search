/**
 * Regression tests. Run this file and check the git diff of the output files to see what changed.
 */

import { readFileSync, writeFileSync } from 'fs';
import { Config } from '../config.js';
import { EntityMatch } from '../interfaces/entity-match.js';
import { EntityResult } from '../interfaces/entity-result.js';
import { Meta } from '../interfaces/meta.js';
import { Query } from '../interfaces/query.js';
import { SearcherFactory } from '../searcher-factory.js';

const outputPath = './src/regression-test/output';
const shortColumnWidth = 8;
const wideColumnWidth = 40;
const RLI = '\u2067';
const LRI = '\u2066';
const PDI = '\u2069';

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

console.log('Running queries...');

runQuery('carcassonne-prefix', 'carcasso');
runQuery('carcassonne-substring', 'cassonn');
runQuery('carcassonne-suffix', 'sonne');
runQuery('munich-insertion', 'muniich');
runQuery('boston-deletion', 'bostn');
runQuery('boulder-creek-substitution', 'boulder creak');
runQuery('tübingen-transposition', 'tübignen');
runQuery('tokyo', '東京都');
runQuery('tokyo-prefix', '東京');
runQuery('tbilisi', 'თბილისი');
runQuery('tbilisi-deletion', 'თბიისი');
runQuery('kuwait-city', 'مدينة الكويت', true);
runQuery('kuwait-city-prefix', 'مدينة الك', true);

console.log('Finished.');

function runQuery(queryName: string, queryString: string, rtl: boolean = false) {
  const query: Query = new Query(queryString);
  const result: EntityResult<GeoEntity> = searcher.getMatches(query);
  console.log(`'${queryString}' (${queryName}): ${result.matches.length} matches.`);
  const queryJson = JSON.stringify(query, null, 2);
  const metaJson = metaToJson(result.meta);
  const matchesString = matchesToString(result.matches, rtl);
  const output = `${queryJson}\n\n${metaJson}\n\n${matchesString}`;
  writeFileSync(`${outputPath}/${queryName}.txt`, output);
}

function metaToJson(meta: Meta): string {
  return JSON.stringify(Object.fromEntries(meta.allEntries), null, 2);
}

function matchesToString(matches: EntityMatch<GeoEntity>[], rtl: boolean): string {
  const header =
    padRight('Rank', shortColumnWidth) +
    padRight('Entity', wideColumnWidth) +
    padRight('Matched String', wideColumnWidth) +
    padRight('Quality', shortColumnWidth) +
    '\n\n';
  const matchesString = matches.map((m, i) => matchToString(m, i + 1, rtl)).join('\n');
  return header + matchesString;
}

function matchToString(match: EntityMatch<GeoEntity>, rank: number, rtl: boolean): string {
  if (!rtl) {
    return (
      padRight(rank.toString(), shortColumnWidth) +
      padRight(match.entity.name, wideColumnWidth) +
      padRight(match.matchedString, wideColumnWidth) +
      padRight(match.quality.toFixed(2), shortColumnWidth)
    );
  }
  return (
    padAndMark(rank.toString(), shortColumnWidth, false) +
    padAndMark(match.entity.name, wideColumnWidth, true) +
    padAndMark(match.matchedString, wideColumnWidth, true) +
    padAndMark(match.quality.toFixed(2), shortColumnWidth, false)
  );
}

function padAndMark(s: string, targetWidth: number, rtl: boolean): string {
  const padded = rtl ? padLeft(s, targetWidth) : padRight(s, targetWidth);
  const mark = rtl ? RLI : LRI;
  return mark + padded + PDI;
}

function padRight(s: string, targetWidth: number): string {
  return s + ' '.repeat(Math.max(0, targetWidth - s.length));
}

function padLeft(s: string, targetWidth: number): string {
  return ' '.repeat(Math.max(0, targetWidth - s.length)) + s;
}
