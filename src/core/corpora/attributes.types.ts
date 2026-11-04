/** Format an attribute value as HTML */
export type Stringifier = (str: string) => string

/** Format values for a given attribute, for a series of tokens, as HTML */
export type ListStringifier = (strs: string[]) => string
