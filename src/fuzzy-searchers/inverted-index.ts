import { Memento } from '../interfaces/memento';
import { MementoSerializable } from '../interfaces/memento-serializable';
import { TermIds } from './term-ids';

/**
 * Stores for every n-gram the ids of the terms that contain the n-gram.
 */
export class InvertedIndex implements MementoSerializable {
  /**
   * Stores n-grams to term ids.
   */
  private readonly ngramToTermIds: Map<string, TermIds>;

  /**
   * Creates a new instance of the InvertedIndex class.
   */
  public constructor() {
    this.ngramToTermIds = new Map<string, TermIds>();
  }

  /**
   * Adds a term index and frequency for the given n-gram.
   * @param ngram The n-gram.
   * @param termIndex The term index.
   * @param frequency The term index frequency.
   */
  public add(ngram: string, termIndex: number, frequency: number): void {
    let termIds: TermIds | undefined = this.ngramToTermIds.get(ngram);

    if (!termIds) {
      termIds = new TermIds();
      this.ngramToTermIds.set(ngram, termIds);
    }

    termIds.addId(termIndex, frequency);
  }

  /**
   * Converts the inverted index to a more compact read-only representation.
   */
  public seal(): void {
    for (const termIds of this.ngramToTermIds.values()) {
      termIds.seal();
    }
  }

  /**
   * Gets the term ids for the given n-gram.
   * @param ngram The n-gram.
   * @returns The term ids or undefined.
   */
  public getIds(ngram: string): TermIds | undefined {
    return this.ngramToTermIds.get(ngram);
  }

  /**
   * Returns the size of the inverted index.
   * @returns The size of the inverted index.
   */
  public get size(): number {
    return this.ngramToTermIds.size;
  }

  /**
   * {@inheritDoc MementoSerializable.save}
   */
  public save(memento: Memento): void {
    memento.add(this.ngramToTermIds.size);
    for (const [ngram, termIds] of this.ngramToTermIds) {
      memento.add(ngram);
      termIds.save(memento);
    }
  }

  /**
   * {@inheritDoc MementoSerializable.load}
   */
  public load(memento: Memento): void {
    const ngramToTermIdsSize = memento.get();
    for (let i = 0; i < ngramToTermIdsSize; i++) {
      const ngram = memento.get();
      const termIds = new TermIds();
      termIds.load(memento);
      this.ngramToTermIds.set(ngram, termIds);
    }
  }
}
