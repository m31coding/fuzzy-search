/* eslint-disable @typescript-eslint/no-explicit-any */

import { Meta } from '../interfaces/meta.js';
import { MetaMerger } from './meta-merger.js';

test('can merge two metas', () => {
    const meta1 = new Meta();
    meta1.add("key1", "meta1Value");
    meta1.add("key2", 10);
    meta1.add("key3", "someOtherValue");

    const meta2 = new Meta();
    meta2.add("key1", "meta2Value");
    meta2.add("key2", 10);

    const mergedMeta = MetaMerger.mergeMeta([meta1, meta2]);
    const entries: ReadonlyMap<string, any> = mergedMeta.allEntries;
    const expectedEntries = new Map<string, any>([
        ["key1_0", "meta1Value"],
        ["key1_1", "meta2Value"],
        ["key2", 20],
        ["key3", "someOtherValue"]
    ]);

    checkMaps(expectedEntries, entries);
});

test('can merge three metas', () => {
    const meta1 = new Meta();
    meta1.add("key1", "meta1Value");
    meta1.add("key2", 10);
    meta1.add("key3", "someOtherValue");

    const meta2 = new Meta();
    meta2.add("key1", "meta2Value");
    meta2.add("key2", 10);

    const meta3 = new Meta();
    meta3.add("key1", "meta3Value");
    meta3.add("key2", 5);
    meta3.add("key4", "additionalValue");

    const mergedMeta = MetaMerger.mergeMeta([meta1, meta2, meta3]);
    const entries: ReadonlyMap<string, any> = mergedMeta.allEntries;
    const expectedEntries = new Map<string, any>([
        ["key1_0", "meta1Value"],
        ["key1_1", "meta2Value"],
        ["key1_2", "meta3Value"],
        ["key2", 25],
        ["key3", "someOtherValue"],
        ["key4", "additionalValue"]
    ]);

    checkMaps(expectedEntries, entries);
});

function checkMaps(expectedMap: ReadonlyMap<string, any>, actualMap: ReadonlyMap<string, any>): void {
    expect(expectedMap.size).toBe(actualMap.size);
    for (const [key, value] of actualMap) {
        expect(expectedMap.has(key)).toBe(true);
        expect(expectedMap.get(key)).toBe(value);
    }
}