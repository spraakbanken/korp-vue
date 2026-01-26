import { numberToSuperscript } from "./util"

/**
 * A parsed lemgram string.
 *
 * Read about lemgrams at https://spraakbanken.gu.se/faq/vad-ar-ett-lemgram
 */
export class Lemgram {
  static regexp = /((\w+)--)?(.*?)\.\.(\w+)\.(\d+)(:\d+)?$/

  constructor(
    readonly id: string,
    readonly form: string,
    readonly pos: string,
    readonly index: number,
    readonly morphology?: string,
    readonly start?: number,
  ) {}

  /** Parse a lemgram id string to a Lemgram object, or `undefined` if invalid. */
  static parse(id: string): Lemgram | undefined {
    const match = id?.trim().match(Lemgram.regexp)
    if (!match) return
    const [, , morphology, form, pos, index, start] = match
    return new Lemgram(
      id,
      form!.replace(/_/g, " "),
      pos!.substring(0, 2),
      parseInt(index!),
      morphology,
      start ? parseInt(start) : undefined,
    )
  }

  /** Render a lemgram string as pretty HTML. */
  toHtml(loc?: (msg: string) => string, skipPos = false): string {
    const pos = loc ? loc(`pos.${this.pos}`) : this.pos
    const indexHtml = this.index > 1 ? `<sup>${this.index}</sup>` : ""
    const posHtml = skipPos ? "" : ` (${pos})`
    return `${this.form}${indexHtml}${posHtml}`
  }

  /** Render a lemgram string in pretty plain text. */
  toString(loc?: (msg: string) => string): string {
    const pos = loc ? loc(`pos.${this.pos}`) : this.pos
    const indexSup = this.index > 1 ? numberToSuperscript(this.index) : ""
    return `${this.form}${indexSup} (${pos})`
  }
}
