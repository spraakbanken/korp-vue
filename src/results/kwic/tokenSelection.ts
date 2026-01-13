import type { Token } from "@/core/backend/types/common"
import type { Row } from "@/core/kwic/kwic"

export type TokenSelectionData = {
  id: string
  token: Token
  row: Row
}

/** Tracks a selected token in the KWIC grid. */
export class TokenSelection {
  private _selectedId: string | null = null
  private selectedToken: Token | null = null
  private selectedRow: Row | null = null

  get selectedId() {
    return this._selectedId
  }

  /** Selects a token. */
  select(id: string, token: Token, row: Row) {
    this._selectedId = id
    this.selectedToken = token
    this.selectedRow = row
  }

  /** Deselects any selected token. */
  clear() {
    this._selectedId = null
    this.selectedToken = null
    this.selectedRow = null
  }

  /** Returns the ID of the currently selected token, or null if none is selected. */
  get(): TokenSelectionData | null {
    if (!this.selectedId || !this.selectedToken || !this.selectedRow) return null

    return {
      id: this.selectedId,
      token: this.selectedToken,
      row: this.selectedRow,
    }
  }
}
