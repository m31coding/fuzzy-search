/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Stores an array of objects that can be serialized and passed
 * between a web worker and the main thread.
 */
export class Memento {
  /**
   * The objects stored in the memento.
   */
  public readonly objects: any[] = [];

  /**
   * The index of the next object to return.
   */
  private getIndex: number = 0;

  /**
   * Creates a new instance of the Memento class.
   * @param objects The objects to store in the memento.
   */
  public constructor(objects?: any[]) {
    if (objects) {
      this.objects = objects;
    }
  }

  /**
   * Adds an object to the memento.
   * @param object The object to add.
   */
  public add(object: any): void {
    this.objects.push(object);
  }

  /**
   * Returns the next object from the memento.
   * @returns The next object from the memento.
   */
  public get(): any {
    return this.objects[this.getIndex++];
  }
}
