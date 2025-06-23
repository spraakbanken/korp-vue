export class Deferred<T> {
  promise: Promise<T>
  // Initialize resolve and reject to empty functions to avoid TypeScript errors
  resolve: (value: T) => void = () => {}
  reject: (reason?: unknown) => void = () => {}

  constructor() {
    // Create a new Promise and allow it to be resolved from outside
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject
      this.resolve = (v) => resolve(v)
    })
  }
}

export function th(label: string | Record<string, string>): string {
  return typeof label == 'object' ? label.swe : label
}
