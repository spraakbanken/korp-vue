<script lang="ts" setup>
import { computed, ref, useId, watchEffect } from "vue"
import type { WidgetProps } from "./widget"
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"

/** List of `[fromdate, todate, fromtime, totime]`, using separators `-` and `:` */
type DateRange = [string, string, string, string]

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
        bounds[0].format("YYYY-MM-DD"),
        bounds[1].format("YYYY-MM-DD"),
        "00:00",
        "23:59",
      ] as DateRange
    }

    // Convert valid range
    const [d1, d2, t1, t2] = parts as [string, string, string, string]
    const formatDate = (d: string) => d.replace(/(....)(..)(..)/, "$1-$2-$3")
    const formatTime = (t: string) => t.replace(/(..)(..)/, "$1:$2")
    return [formatDate(d1), formatDate(d2), formatTime(t1), formatTime(t2)] as DateRange
  },

  // Convert local strings to CQP model string
  set(range: DateRange) {
    const formatDate = (d: string) => d.replace(/-/g, "")
    const formatTime = (t: string) => t.replace(/:/g, "")
    return [
      formatDate(range[0]),
      formatDate(range[1]),
      formatTime(range[2]),
      formatTime(range[3]),
    ].join()
  },
})

const corpusSelection = useReactiveCorpusSelection()

defineProps<WidgetProps>()

const id = useId()
const bounds = computed(() => corpusSelection.getMomentInterval()!)
const date1 = ref(model.value[0])
const date2 = ref(model.value[1])
const time1 = ref(model.value[2])
const time2 = ref(model.value[3])

watchEffect(() => {
  const values = [date1.value, date2.value, time1.value, time2.value]
  if (values.every(Boolean)) model.value = values as DateRange
})
</script>

<template>
  <div class="d-flex gap-2">
    <!-- From -->
    <div class="d-flex flex-column gap-1">
      <label :for="`${id}-from`">{{ $t("time.from") }}</label>

      <!-- Date -->
      <input
        type="date"
        :id="`${id}-from`"
        :min="bounds[0].format('YYYY-MM-DD')"
        :max="date2"
        v-model="date1"
        class="form-control"
      />

      <!-- Time -->
      <input type="time" v-model="time1" class="form-control" />
    </div>

    <!-- To -->
    <div class="d-flex flex-column gap-1">
      <label :for="`${id}-to`">{{ $t("time.to") }}</label>

      <!-- Date -->
      <input
        type="date"
        :id="`${id}-to`"
        :min="date1"
        :max="bounds[1].format('YYYY-MM-DD')"
        v-model="date2"
        class="form-control"
      />

      <!-- Time -->
      <input type="time" v-model="time2" class="form-control" />
    </div>
  </div>
</template>
