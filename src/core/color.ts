/** Our primary color in hsl */
const SBORANGE_HSL = { h: 17.39, s: 0.88, l: 0.52 }

/** The golden ratio, φ */
const PHI = (1 + Math.sqrt(5)) / 2

/** Stepping around a circle by this angle yields an even spacing */
const GOLDEN_ANGLE = 360 / PHI ** 2

/** Generates evenly distributed colors */
export class GoldenAnglePaletteHsl {
  constructor(
    public h = SBORANGE_HSL.h,
    readonly s = SBORANGE_HSL.s,
    readonly l = SBORANGE_HSL.l,
  ) {}

  /** Get next color */
  shift() {
    // Get current color
    const color = `hsl(${this.h} ${this.s * 100}% ${this.l * 100}%)`
    // Rotate hue by golden angle for next color
    this.h = (this.h + GOLDEN_ANGLE) % 360
    return color
  }
}
