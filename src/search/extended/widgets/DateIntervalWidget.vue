<script lang="ts" setup>
import { ref, useId, watchEffect } from "vue"
import type { WidgetProps } from "./widget"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import { parseDateRange } from "@/core/cqp/cqp"

/** Start and end dates on the format `YYYY-MM-DDTHH:mm` */
type DateRange = [string, string]

/** The format used by `<input type="date">` and friends */
const FORMAT = "YYYY-MM-DDTHH:mm"

// The model is exposed to parent as a `fromdate,todate,fromtime,totime` string,
// but internally we work with two `YYYY-MM-DDTHH:mm` strings for the two inputs.
const model = defineModel({
  required: true,

  /** Convert the CQP model string to local strings */
  get: (str: string) => {
    const parts = parseDateRange(str)
    // If invalid, fall back to full available range
    if (!parts) return getBounds()

    const [d1, d2, t1, t2] = parts
    /** `("20260101", "120000")` => `"2026-01-01T12:00"` */
    const numbersToDate = (d: string, t: string) =>
      d.replace(/(....)(..)(..)/, "$1-$2-$3") + "T" + t.replace(/(..)(..)/, "$1:$2")
    return [numbersToDate(d1, t1), numbersToDate(d2, t2)] as DateRange
  },

  /** Convert local strings to CQP model string */
  set([d1, d2]: DateRange) {
    /** `"2026-01-01T12:00"` => `["20260101", "1200<seconds>"]` */
    const dateToNumbers = (d: string, seconds: string) => [
      d.slice(0, 10).replace(/-/g, ""),
      d.slice(11).replace(/:/g, "") + seconds,
    ]
    const [fromdate, fromtime] = dateToNumbers(d1, "00")
    const [todate, totime] = dateToNumbers(d2, "59")
    return [fromdate, todate, fromtime, totime].join()
  },
})

defineProps<WidgetProps>()

const corpusSelection = useReactiveCorpusSelection()

const id = useId()
const date1 = ref(model.value[0])
const date2 = ref(model.value[1])

/** Time span of current corpus selection */
function getBounds(): DateRange {
  // Interval return value is guaranteed, as this widget is only used with dated corpora.
  const interval = corpusSelection.getMomentInterval()!
  return [interval[0].format(FORMAT), interval[1].format(FORMAT)]
}

watchEffect(() => {
  const values = [date1.value, date2.value]
  if (values.every(Boolean)) model.value = values as DateRange
})
</script>

<template>
  <div>
    <!-- From -->
    <label :for="`${id}-from`">{{ $t("time.from") }}</label>

    <input
      type="datetime-local"
      :id="`${id}-from`"
      :min="getBounds()[0]"
      :max="date2"
      required
      v-model="date1"
      class="form-control"
    />

    <!-- To -->
    <label :for="`${id}-to`">{{ $t("time.to") }}</label>

    <input
      type="datetime-local"
      :id="`${id}-to`"
      :min="date1"
      :max="getBounds()[1]"
      required
      v-model="date2"
      class="form-control"
    />
  </div>
</template>
