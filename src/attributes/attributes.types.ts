/** A stringifier takes any value and outputs a string, possibly containing HTML */
export type Stringifier = <T = unknown>(input: T) => string
