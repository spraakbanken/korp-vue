import type { Client, ClientPathsWithMethod } from "openapi-fetch"
import type {
  paths,
  StreamCompleteEvent,
  StreamErrorEvent,
  StreamKeepaliveEvent,
  StreamProgressEvent,
  StreamResultEvent,
} from "./korp-api"

/** The paths this client can handle */
export type ClientPaths = ClientPathsWithMethod<Client<paths, "application/json">, "get">

export type ClientParams<TPath extends ClientPaths> = paths[TPath]["get"]["parameters"]["query"]

export type ClientResponse<TPath extends ClientPaths> =
  paths[TPath]["get"]["responses"][200]["content"]["application/json"]

export type StreamEvent =
  | StreamProgressEvent
  | StreamResultEvent
  | StreamErrorEvent
  | StreamCompleteEvent
  | StreamKeepaliveEvent

/** Additional request options */
export type RequestOptions = {
  /** Abort signal to cancel the request */
  abortSignal?: AbortSignal
}

/** Callback for handling progress info from a progress stream event */
export type ProgressHandler = (percent: number, hits?: number) => void

/** Callback for handling partial data from a progress result event */
export type DataHandler<TPath extends ClientPaths> = (data: Partial<ClientResponse<TPath>>) => void
