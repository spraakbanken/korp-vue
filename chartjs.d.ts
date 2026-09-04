import "chart.js"
import type { InteractionModeFunction } from "chart.js"

declare module "chart.js" {
  export interface InteractionModeMap {
    xnearest: InteractionModeFunction
  }
}
