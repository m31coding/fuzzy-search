import { Meta } from '../interfaces/meta.js';

/**
 * Represents the result of a removal operation.
 * @typeParam TId The type of the entity ids.
 */
export class RemovalResult<TId> {
  /**
   * Creates a new instance of RemovalResult.
   * @typeParam TId The type of the entity ids.
   * @param removedEntities The ids of the entities that were present and thus removed.
   * @param meta The meta data of the operation.
   */
  public constructor(
    public readonly removedEntities: TId[],
    public readonly meta: Meta
  ) {}
}
