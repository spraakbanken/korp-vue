<script setup lang="ts">
import settings from "@/core/config"
import { formatDecimals } from "@/core/i18n"
import type { MarkerData, MarkerGroup } from "@/core/statistics/map"
import { MapModel } from "@/core/statistics/MapModel"
import type { MapTask } from "@/core/task/MapTask"
import { useCycleList, whenever } from "@vueuse/core"
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue"

const props = defineProps<{
  active: boolean
  task: MapTask
}>()

const colors = useCycleList(["", "orange", "teal", "purple", "blue", "red"])
const mapEl = useTemplateRef("map")
const markerGroups = ref<Record<string, MarkerGroup>>({})
const markersList = ref<MarkerData[]>([])
let model: MapModel

onMounted(() => {
  doSearch()

  // TODO Click to subsearch
  model = new MapModel(
    mapEl.value!,
    (markers) => (markersList.value = markers.sort((a, b) => b.point.rel - a.point.rel)),
    () => (markersList.value = []),
  )

  model.setCenter(settings["map_center"])
})

async function doSearch() {
  await props.task.send()
  // TODO Colors
  // TODO Show/hide series
  markerGroups.value = props.task.getMarkerGroups(() => colors.next())

  model.updateMarkers(Object.values(markerGroups.value), "teal")
}

whenever(
  () => props.active,
  () => model.map.invalidateSize(),
  { flush: "post" },
)
</script>

<template>
  <div class="w-100 position-relative" style="height: 90svh">
    <!-- Map container -->
    <div ref="map" class="position-absolute w-100 h-100 z-0" />

    <!-- Place info on hover/click -->
    <div
      v-if="markersList.length"
      class="hover-info-container position-absolute end-0 p-1 z-1"
      style="width: 15rem"
    >
      <!-- TODO Merge cards with same location -->
      <div v-for="marker in markersList" :key="marker.label + marker.point.name" class="card mb-1">
        <div class="card-body p-2">
          <div class="fw-bold">
            <div class="swatch" :style="{ backgroundColor: marker.color }" />
            {{ marker.label }}
          </div>
          <div class="fw-bold">{{ marker.point.name }}</div>
          <div>{{ $t("stat.freq") }}: {{ marker.point.abs }}</div>
          <div>{{ $t("stat.freq_relative") }}: {{ formatDecimals(marker.point.rel, 2) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.leaflet-div-icon {
  background: none;
  border: none;
}

.cluster-geokorp-marker-group {
  position: absolute;
  bottom: 0;
  width: 40px;
}

.cluster-geokorp-marker {
  width: 10px;
  border-radius: 1px;
  display: inline-block;
}

.marker-top .geokorp-multi-marker {
  vertical-align: top;
}

.marker-middle .geokorp-multi-marker {
  vertical-align: middle;
}

.marker-bottom .geokorp-multi-marker {
  vertical-align: bottom;
}

.geokorp-multi-marker {
  opacity: 0.85;
  display: inline-block;
}

.geokorp-marker {
  opacity: 0.93;
}

.cluster-text {
  font-weight: bold;
}

.cluster-icon {
  border-radius: 15px;
  width: 30px !important;
  height: 30px !important;
  z-index: 400;
  position: absolute;
  padding-top: 5px;
  padding-left: 1px;
}

.swatch {
  width: 10px;
  height: 10px;
  display: inline-block;
  margin-right: 5px;
}
</style>
