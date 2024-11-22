#!/usr/bin/env -vS node --import=tsx/esm

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

fs.copyFile(path.resolve('dist', 'fuzzy-search.d.ts'), path.resolve('dist', 'fuzzy-search.d.cts'));
