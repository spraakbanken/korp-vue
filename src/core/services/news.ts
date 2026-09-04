import { load } from "js-yaml"
import settings from "@/core/config"
import type { LangString } from "../model/locale"
import { once } from "lodash-es"

export function isEnabled(): boolean {
  return !!settings.news_url
}

export const fetchNews = once(async (): Promise<NewsItem[]> => {
  if (!settings.news_url) return []
  const response = await fetch(settings.news_url)
  const feedYaml: string = await response.text()

  const itemsRaw = load(feedYaml) as NewsItemRaw[]

  const currentDate = new Date().toISOString().slice(0, 10)
  const oneYearAgo = modifyYear(new Date(), -1).toISOString().slice(0, 10)
  const items: NewsItem[] = itemsRaw
    // Hide expired items.
    .filter((item) => !item.expires || item.expires >= currentDate)
    // Hide old items.
    .filter((item) => item.created >= oneYearAgo)

  // Sort newest first
  return items.sort((a, b) => b.created.localeCompare(a.created))
})

function modifyYear(date: Date, years: number) {
  date.setFullYear(date.getFullYear() + years)
  return date
}

type NewsItemRaw = {
  created: string
  expires?: string
  title: LangString
  body: LangString
  tags?: string[]
}

export type NewsItem = {
  created: string
  title: LangString
  body: LangString
  tags?: string[]
}
