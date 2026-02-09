<script setup lang="ts">
import settings from "@/core/config"
import type { MarkerGroup } from "@/core/statistics/map"
import { MapModel } from "@/core/statistics/MapModel"
import type { MapTask } from "@/core/task/MapTask"
import { whenever } from "@vueuse/core"
import { onMounted, ref, useTemplateRef, watch } from "vue"

const props = defineProps<{
  active: boolean
  task: MapTask
}>()

const mapEl = useTemplateRef("map")
const markerGroups = ref<Record<string, MarkerGroup>>({})
let model: MapModel

onMounted(() => {
  doSearch()

  // TODO Mouse handlers
  model = new MapModel(
    mapEl.value!,
    () => {},
    () => {},
  )

  model.setCenter(settings["map_center"])
})

async function doSearch() {
  await props.task.send()
  // TODO Colors
  // TODO Show/hide series
  markerGroups.value = props.task.getMarkerGroups(() => "orange")

  model.updateMarkers(Object.values(markerGroups.value), "teal")
}

whenever(
  () => props.active,
  () => model.map.invalidateSize(),
  { flush: "post" },
)
</script>

<template>
  <div ref="map" class="w-100" style="height: 90svh"></div>
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

.leaflet-marker-icon.leaflet-div-icon.leaflet-clickable {
  border: none;
  background-color: transparent;
}

.leaflet-popup-content-wrapper {
  border-radius: 4px;
  background-color: #f6f6f6;
  background-image: linear-gradient(to bottom, #fff, #e6e6e6);
  background-repeat: repeat-x;
}

.leaflet-popup-tip {
  background-color: #e6e6e6;
}

.leaflet-bar a:link,
.leaflet-bar a:visited {
  color: black;
}

.swatch {
  width: 10px;
  height: 10px;
  display: inline-block;
  margin-right: 5px;
}

.marker-cluster-small {
  background-color: rgba(136, 220, 168, 0.6);
}

.marker-cluster-small div {
  background-color: rgba(136, 220, 168, 0.6);
}

.map {
  border: 1px solid black;
  position: relative;
  height: 522px;
}

.map-container {
  height: 520px;
}

.map-outer-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.hover-info-container {
  margin: 5px;
  border-radius: 5px;
  width: 200px;
  height: 500px;
  overflow: auto;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 800;
  opacity: 1;
  transition: opacity 500ms;
}

.hover-info {
  z-index: 10;
  background-color: #f6f6f6;
  background-image: linear-gradient(to bottom, #fff, #e6e6e6);
  background-repeat: repeat-x;
  padding: 10px;
  margin: 10px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
