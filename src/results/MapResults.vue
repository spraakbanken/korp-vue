<script setup lang="ts">
import { GoldenAnglePaletteHsl } from "@/core/color"
import settings from "@/core/config"
import { formatDecimals } from "@/core/i18n"
import type { MarkerData, MarkerGroup } from "@/core/statistics/map"
import { MapModel } from "@/core/statistics/MapModel"
import { ExampleTask } from "@/core/task/ExampleTask"
import type { MapTask } from "@/core/task/MapTask"
import { regescape } from "@/core/util"
import { useDynamicTabs } from "@/results/useDynamicTabs"
import { useElementVisibility, whenever } from "@vueuse/core"
import { groupBy } from "lodash-es"
import { computed, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps<{
  task: MapTask
}>()

const { createTab } = useDynamicTabs()
const { t } = useI18n()

const id = useId()
const mapEl = useTemplateRef("map")
const isMapVisible = useElementVisibility(mapEl)
const seriesAll = ref<Record<string, MarkerGroup>>({})
const enableClustering = ref(false)
const enabledSeries = ref<string[]>([])
const markersList = ref<MarkerData[]>([])
let model: MapModel

/** Selected markers grouped by location. Makes a difference when clustering is enabled. */
const markersGrouped = computed<Record<string, MarkerData[]>>(() =>
  groupBy(markersList.value, (marker) => marker.point.name),
)

onMounted(() => {
  doSearch()

  model = new MapModel(
    mapEl.value!,
    (markers) => (markersList.value = markers.sort((a, b) => b.point.rel - a.point.rel)),
    () => (markersList.value = []),
  )

  model.setCenter(settings["map_center"])
})

async function doSearch() {
  await props.task.send()

  const palette = new GoldenAnglePaletteHsl()
  palette.shift() // Skip the first color, same as the primary UI color
  seriesAll.value = props.task.getMarkerGroups(() => palette.shift())
  enabledSeries.value = Object.keys(seriesAll.value)
}

watch([enableClustering, enabledSeries], () => {
  model.useClustering = enableClustering.value
  const series = enabledSeries.value.map((label) => seriesAll.value[label]!)
  model.updateMarkers(series, "gray")
})

whenever(isMapVisible, () => model.map.invalidateSize())

function onMarkerClick(marker: MarkerData) {
  const { point, queryData } = marker
  const location = [point.name, point.countryCode, point.lat, point.lng].join(";")
  const cqpGeo = `<match> [_.${queryData.label} contains "${regescape(location)}"] []{0,} </match>`

  const cqps = [queryData.searchCqp, queryData.subCqp, cqpGeo]
  const readingMode = queryData.label === "paragraph__geocontext"
  const task = new ExampleTask(queryData.corpora, cqps, queryData.within, readingMode)
  createTab(t("result.kwic"), task)
}

onBeforeUnmount(() => {
  props.task.abort()
})
</script>

<template>
  <div class="vstack gap-2">
    <!-- Search options bar -->
    <div class="bg-secondary-subtle p-2 d-flex gap-4 align-items-baseline">
      <div class="form-check">
        <input
          type="checkbox"
          :id="id + '-cluster'"
          v-model="enableClustering"
          class="form-check-input"
        />
        <label :for="id + '-cluster'" class="form-check-label">
          {{ $t("result.map.cluster") }}
        </label>
      </div>

      <!-- Toggleable legend -->
      <div
        class="d-flex flex-grow-1 justify-content-end flex-wrap column-gap-3 align-items-baseline"
      >
        <div v-for="(series, label) in seriesAll" :key="label" class="form-check">
          <input
            type="checkbox"
            :id="id + '-' + label"
            :value="label"
            v-model="enabledSeries"
            class="form-check-input"
            :style="{ backgroundColor: series.color, borderColor: series.color }"
          />
          <label :for="id + '-' + label" class="form-check-label">
            {{ label }}
          </label>
        </div>
      </div>
    </div>

    <!-- Stacking container -->
    <div class="w-100 position-relative" style="height: 90svh">
      <!-- Map target -->
      <div ref="map" class="position-absolute w-100 h-100 z-0" />

      <!-- Place info on hover/click -->
      <div
        v-if="markersList.length"
        class="hover-info-container position-absolute end-0 p-1 z-1"
        style="width: 15rem"
      >
        <div v-for="(markers, location) in markersGrouped" :key="location" class="card mb-1">
          <div class="card-body p-2">
            <div class="fw-bold">
              {{ location }}
            </div>
            <div
              v-for="marker in markers"
              :key="marker.label"
              class="hstack align-items-baseline position-relative"
            >
              <div class="swatch" :style="{ backgroundColor: marker.color }" />
              <div class="flex-grow-1">
                <div>
                  <a
                    href="#"
                    class="stretched-link text-decoration-none fw-bold"
                    @click.prevent="onMarkerClick(marker)"
                  >
                    {{ marker.label }}
                  </a>
                </div>
                <div>{{ $t("stat.freq") }}: {{ marker.point.abs }}</div>
                <div>{{ $t("stat.freq_relative") }}: {{ formatDecimals(marker.point.rel, 2) }}</div>
              </div>
            </div>
          </div>
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
