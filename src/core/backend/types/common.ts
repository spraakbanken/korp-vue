/** A Korp response is either successful or has error info */
export type Response<R> = ResponseBase & (R | ErrorResponse)

/** All responses have time info. */
export type ResponseBase = {
  /** Execution time in seconds */
  time?: number
}

/** An error response has an error message. */
export type ErrorResponse = {
  ERROR: ErrorMessage
}

export type ErrorMessage = {
  /** Name of exception */
  type: string
  /** Error message, human-readable but technical */
  value: string
}

/**
 * This is also included in a response if the `incremental` param was given.
 *
 * It is suitable for reading piece by piece in order to display progress feedback to the user.
 */
export type ProgressResponse = {
  /** Corpora being processed, in order. This is returned first. In parallel mode, a corpus is named as "<main>|<secondary>" */
  progress_corpora?: string[]
  /** Repeated for each corpus, returned a few at a time */
  [progress_n: `progress_${number}`]: ProgressItem
}

/** The value type (string or object with `hits`) depends on the API endpoint, e.g. `/query` returns objects. Hits can be 0.  */
export type ProgressItem = string | { corpus: string; hits?: number }

/** Frequency count as absolute and relative (to some total size). */
export type AbsRelTuple = { absolute: number; relative: number }

/** A string consisting of numbers. */
export type NumericString = `${number}`
