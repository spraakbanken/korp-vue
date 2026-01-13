import type { ApiKwic, Token } from "@/core/backend/types/common"

/** Tracks a selected token in the KWIC grid. */
export class TokenSelection {
  protected id?: string
  protected token?: Token
  protected row?: ApiKwic

  /** Selects a token. */
  select(id: string, token: Token, row: ApiKwic) {
    this.id = id
    this.token = token
    this.row = row
  }

  /** Deselects any selected token. */
  clear() {
    this.id = undefined
    this.token = undefined
    this.row = undefined
  }

  getId() {
    return this.id
  }

  getTokenRow() {
    return this.token && this.row
      ? {
          token: this.token,
          row: this.row,
        }
      : undefined
  }
}
