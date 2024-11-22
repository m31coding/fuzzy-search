import { Memento } from './memento.js';

/**
 * Interface for objects that can be saved and loaded from a memento.
 * This interface was created to pass the state of an indexed searcher
 * from a web worker to the main thread.
 */
export interface MementoSerializable {
  /**
   * Saves the state of the object to the given memento.
   * @param memento
   */
  save(memento: Memento): void;

  /**
   * Loads the state of the object from the given memento.
   * @param memento
   */
  load(memento: Memento): void;
}
