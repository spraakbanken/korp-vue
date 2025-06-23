import settings from '@instance/settings'
import type { API } from './types'

export async function get<K extends keyof API>(
  endpoint: K,
  params: API[K]['params'],
): Promise<API[K]['response']> {
  // Switch to POST if the URL would be to long
  const { url, request } = selectHttpMethod(settings.korp_backend_url + '/' + endpoint, params)

  // Send request
  const response = await fetch(url, request)

  // If progress handler given, parse response data as it comes in
  const json = await response.json()
  const data: API[K]['response'] = json

  return data
}

/**
 * Select GET or POST depending on url length.
 */
export function selectHttpMethod(
  url: string,
  params: Record<string, unknown>,
): { url: string; request: RequestInit } {
  const urlFull = buildUrl(url, params)
  return urlFull.length > settings.backendURLMaxLength
    ? { url, request: { method: 'POST', body: toFormData(params) } }
    : { url: urlFull, request: {} }
}

/** Convert object to FormData */
function toFormData(obj: Record<string, unknown>): FormData {
  const formData = new FormData()
  Object.entries(obj).forEach(([key, value]) => formData.append(key, String(value)))
  return formData
}

/** Append search params to url */
export function buildUrl(base: string, params: Record<string, unknown>): string {
  const url = new URL(base)
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)))
  return url.toString()
}
