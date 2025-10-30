import Abortable from "../abortable"

/** Base class for tasks assigned to dynamic tabs. */
export abstract class TaskBase<R = unknown> extends Abortable {
  /** Send backend request. */
  abstract send(...args: unknown[]): Promise<R>
}
