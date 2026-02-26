<script lang="ts" setup>
import { computed, ref, useId, watchEffect } from "vue"
import type { WidgetProps } from "./widget"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"

/** Start and end dates on the format `YYYY-MM-DDTHH:mm` */
type DateRange = [string, string]

const model = defineModel({
  required: true,

  // Convert the CQP model string to local strings
  // TODO Better use standard formats in CQP model?
  get: (str: string) => {
    const parts = str.split(",")
    // If invalid range, default to full available range
    if (parts.length != 4) {
      const bounds = corpusSelection.getMomentInterval()!
      return [
        bounds[0].format("YYYY-MM-DDT00:00"),
        bounds[1].format("YYYY-MM-DDT23:59"),
      ] as DateRange
    }

    // Convert valid range
    const [d1, d2, t1, t2] = parts as [string, string, string, string]
    const formatDate = (d: string, t: string) =>
      d.replace(/(....)(..)(..)/, "$1-$2-$3") + "T" + t.replace(/(..)(..).*/, "$1:$2")
    return [formatDate(d1, t1), formatDate(d2, t2)] as DateRange
  },

  // Convert local strings to CQP model string
  set([d1, d2]: DateRange) {
    const formatDate = (d: string) => d.slice(0, 10).replace(/-/g, "")
    const formatTime = (d: string) => d.slice(11).replace(/:/g, "")
    return [formatDate(d1), formatDate(d2), formatTime(d1) + "00", formatTime(d2) + "59"].join()
  },
})

const corpusSelection = useReactiveCorpusSelection()

defineProps<WidgetProps>()

const id = useId()
const bounds = computed(() => corpusSelection.getMomentInterval()!)
const date1 = ref(model.value[0])
const date2 = ref(model.value[1])

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
      :min="bounds[0].format('YYYY-MM-DDT00:00')"
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
      :max="bounds[1].format('YYYY-MM-DDT23:59')"
      required
      v-model="date2"
      class="form-control"
    />
  </div>
</template>
