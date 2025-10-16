/*
    Regression tests. Run this file and check the git diff of the output files to see what changed.
*/

import { readFileSync, writeFileSync } from 'fs';
import { EntityMatch } from '../interfaces/entity-match.js';
import { EntityResult } from '../interfaces/entity-result.js';
import { Meta } from '../interfaces/meta.js';
import { Query } from '../interfaces/query.js';
import { SearcherFactory } from '../searcher-factory.js';

interface GeoEntity {
    id: number;
    name: string;
}

const outputPath = './src/regression-test/output';
const outputColumnWidth = 40;
const text = readFileSync('./data/world-ctvs.txt', 'utf-8');
const lines = text.split('\n').slice(1);
const entities = lines.map((l, index) => ({ id: index, name: l }));

const searcher = SearcherFactory.createDefaultSearcher<GeoEntity, number>();

console.log(`Indexing ${entities.length} entities...`);
const indexingMeta: Meta = searcher.indexEntities(
    entities,
    (e) => e.id,
    (e) => e.name.split(';')
);

writeFileSync(`${outputPath}/_indexing-meta.txt`, metaToJson(indexingMeta));

console.log("Running queries...");

runQuery('carcassonne-prefix', 'carcasso');
runQuery('carcassonne-infix', 'cassonn');
runQuery('carcassonne-suffix', 'sonne');
runQuery('munich-insertion', 'muniich');
runQuery('boston-deletion', 'bostn')
runQuery('boulder-creek-substitution', 'boulder creak');
runQuery('tübingen-transposition', 'tübignen');
runQuery('tokyo', '東京都');
runQuery('tokyo-prefix', '東京');
runQuery('tbilisi', 'თბილისი');
runQuery('tbilisi-deletion', 'თბიისი');
runQuery('kuwait-city', 'مدينة الكويت');
runQuery('kuwait-city-prefix', 'مدينة الك');

console.log("Finished.")

function runQuery(queryName: string, queryString: string) {
    const query: Query = new Query(queryString);
    const result: EntityResult<GeoEntity> = searcher.getMatches(query);
    const queryJson = JSON.stringify(query, null, 2);
    const metaJson = metaToJson(result.meta);
    const matchesString = matchesToString(result.matches);
    const output = `${queryJson}\n\n${metaJson}\n\n${matchesString}`;
    writeFileSync(`${outputPath}/${queryName}.txt`, output);
}

function metaToJson(meta: Meta): string {
    return JSON.stringify(Object.fromEntries(meta.allEntries), null, 2);
}

function matchesToString(matches: EntityMatch<GeoEntity>[]): string {
    const header =
        padRight("Rank", 8) +
        padRight("Entity", outputColumnWidth) +
        padRight("Matched String", outputColumnWidth) +
        padRight("Quality", 8) +
        "\n\n";
    const matchesString = matches.map((m, i) => matchToString(m, i + 1)).join('\n');
    return header + matchesString;
}

function matchToString(match: EntityMatch<GeoEntity>, rank: number): string {
    return (
        padRight(rank.toString(), 8) +
        padRight(match.entity.name, outputColumnWidth) +
        padRight(match.matchedString, outputColumnWidth) +
        padRight(match.quality.toFixed(2), 8)
    );
}

function padRight(s: string, targetWidth: number): string {
    return s + ' '.repeat(Math.max(0, targetWidth - s.length));
}
