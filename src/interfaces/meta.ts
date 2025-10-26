/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Stores meta data for the indexing process and search results.
 */
export class Meta {
  /**
   * The meta entries.
   */
  private readonly entries: Map<string, any>;

  /**
   * Creates a new instance of the Meta class.
   * @param entries The meta entries.
   */
  public constructor(entries?: Map<string, any>) {
    if (entries !== undefined) {
      this.entries = entries;
    } else {
      this.entries = new Map<string, any>();
    }
  }

  /**
   * Adds a new meta entry.
   * @param key The key of the entry.
   * @param value The value of the entry.
   */
  public add(key: string, value: any): void {
    if (this.entries.has(key)) {
      throw new Error(`A meta entry with key ${key} is already present.`);
    }

    this.entries.set(key, value);
  }

  /**
   * Returns the meta entry with the given key.
   * @param key
   * @returns The meta entry.
   */
  public get(key: string): any {
    return this.entries.get(key);
  }

  /**
   * Returns all meta entries.
   * @returns All meta entries.
   */
  public get allEntries(): ReadonlyMap<string, any> {
    return this.entries;
  }

  /**
   * Serializes the meta object to a JSON object.
   * @returns The JSON representation of the meta object.
   */
  public toJSON(): object {
    return {
      entries: Object.fromEntries(this.entries)
    };
  }
}
