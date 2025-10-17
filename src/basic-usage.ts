import { Match } from './string-searchers/match.js';
import { Query } from './interfaces/query.js';
import { SuffixArraySearcher } from './suffix-array-searchers/suffix-array-searcher.js';

const suffixArraySearcher: SuffixArraySearcher = new SuffixArraySearcher();
suffixArraySearcher.index(['Alice', 'Bob', 'Carol', 'Charlie']);
const matches = suffixArraySearcher.getMatches(new Query('li')).matches;
console.log(matches);
console.log('finished');
