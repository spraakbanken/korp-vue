/** Format an attribute value as HTML */
export type Stringifier = (str: string) => string

/** Format values for a given attribute, for a series of tokens, as HTML */
export type ListStringifier = (strs: string[]) => string

/** Build a CQP condition for a set of values of a given attribute */
export type CqpStringifier = (values: string[], ignoreCase?: boolean) => string
