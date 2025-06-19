/** Values in the URL parameters. */
export type HashParams = SearchParams & ResultParams & UiParams

export type SearchParams = {
  cqp?: string
  in_order?: 'false'
  prefix?: ''
  search_tab?: '' | '1' | '2'
}

export type ResultParams = {
  hpp?: `${number}`
}

export type UiParams = {
  lang?: string
}
