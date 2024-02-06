import { ArrayUtilities } from '../commons/array-utilities';
import { Memento } from '../interfaces/memento';
import { MementoSerializable } from '../interfaces/memento-serializable';

/**
 * Stores term ids and their frequencies. Used in the inverted index.
 */
export class TermIds implements MementoSerializable {
  /**
   * The term ids.
   */
  public ids: number[] | Int32Array;

  /**
   * The frequencies of the ids.
   */
  public frequencies: number[] | Int32Array;

  /**
   * Creates a new instance of the TermIds class.
   */
  public constructor() {
    this.ids = [];
    this.frequencies = [];
  }

  /**
   * Adds a term id and its frequency to the list.
   * @param id The term id.
   * @param frequency The frequency of the term id.
   */
  public addId(id: number, frequency: number): void {
    (this.ids as number[]).push(id);
    (this.frequencies as number[]).push(frequency);
  }

  /**
   * Seals the term ids and frequencies arrays by converting them to Int32Arrays.
   */
  public seal(): void {
    this.ids = ArrayUtilities.ToInt32Array(this.ids as number[]);
    this.frequencies = ArrayUtilities.ToInt32Array(this.frequencies as number[]);
  }

  /**
   * Returns the length of the ids and frequencies arrays.
   * @returns The length of the ids and frequencies arrays.
   */
  public get length(): number {
    return this.ids.length;
  }

  /**
   * {@inheritDoc MementoSerializable.save}
   */
  public save(memento: Memento): void {
    memento.add(this.ids);
    memento.add(this.frequencies);
  }

  /**
   * {@inheritDoc MementoSerializable.load}
   */
  public load(memento: Memento): void {
    this.ids = memento.get();
    this.frequencies = memento.get();
  }
}
