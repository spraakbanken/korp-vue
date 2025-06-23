/** Values in the URL parameters. */
export type HashParams = AppParams & SearchParams & ResultParams & UiParams

export type AppParams = {
  corpus?: string
}

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
