import L from "leaflet"
import { keyBy } from "lodash-es"
import {
  createCircleMarker,
  createMultiMarkerIcon,
  type CustomMarker,
  type CustomMarkerMany,
  isMarker,
  isMarkerCluster,
  type MarkerData,
  type MarkerGroup,
  type MergedMarker,
} from "@/core/statistics/map"
import type { InstanceConfig } from "../config/instanceConfig.types"
import { html } from "../util"

export class MapModel {
  map: L.Map
  selectedMarkers: MarkerData[] = []
  featureLayer: L.FeatureGroup | undefined
  markerCluster: L.MarkerClusterGroup | undefined
  /** Maximum frequency in current result */
  maxRel = 0
  useClustering = false

  constructor(
    container: HTMLElement,
    private mouseOver: (markerData: MarkerData[]) => void,
    private mouseOut: () => void,
  ) {
    this.map = L.map(container, {
      minZoom: 1,
      maxZoom: 13,
    }).setView([51.505, -0.09], 13)

    // Load map layer with leaflet-providers
    L.tileLayer.provider("OpenStreetMap").addTo(this.map)

    this.map.on("click", () => {
      this.selectedMarkers = []
      mouseOut()
    })
  }

  setCenter(center?: InstanceConfig["map_center"]) {
    if (center) this.map.setView([center.lat, center.lng], center.zoom)
  }

  createMarkerIcon(color: string, cluster: boolean) {
    // TODO use maxRel, but maxRel is not set when markers are created
    // diameter = ((relSize / maxRel) * 45) + 5
    return createCircleMarker(color, 10, cluster ? 1 : 5)
  }

  /**
   * use the previously calculated "maxRel" to decide the sizes of the bars
   * in the cluster icon that is returned (between 5px and 50px)
   */
  createClusterIcon(clusterGroups: Record<string, MarkerGroup>, restColor: string) {
    const groups = Object.keys(clusterGroups)
    groups.sort((group1, group2) => clusterGroups[group1].order - clusterGroups[group2].order)
    if (groups.length > 4) {
      groups.splice(3)
      groups.push(restColor)
    }
    return (cluster: L.MarkerCluster) => {
      const sizes = Object.fromEntries(groups.map((color) => [color, 0]))
      const childMarkers = cluster.getAllChildMarkers() as CustomMarker[]
      childMarkers.forEach((childMarker) => {
        let color = childMarker.markerData.color
        if (!(color in sizes)) color = restColor
        sizes[color] += childMarker.markerData.point.rel
      })

      if (groups.length === 1) {
        const color = groups[0]
        const groupSize = sizes[color]
        const diameter = (groupSize / this.maxRel) * 45 + 5
        return createCircleMarker(color, diameter, diameter)
      }

      const elements = Object.entries(sizes).map(
        ([color, size]) =>
          html`<div
            class="cluster-geokorp-marker"
            style="height:${(size / this.maxRel) * 45 + 5}px; background-color:${color}"
          ></div>`,
      )
      return L.divIcon({
        html: html`<div class="cluster-geokorp-marker-group">${elements.join("")}</div>`,
        iconSize: new L.Point(40, 50),
      })
    }
  }

  /**
   * check if the cluster with split into several clusters / markers on zooom
   * TODO: does not work in some cases
   */
  shouldZooomToBounds(cluster: any) {
    // This code is a modification of MarkerCluster.zoomToBounds()
    // See https://github.com/Leaflet/Leaflet.markercluster/blob/master/src/MarkerCluster.js
    let childClusters = cluster._childClusters.slice()
    const map = cluster._group._map
    const boundsZoom = map.getBoundsZoom(cluster._bounds)
    let zoom = cluster._zoom + 1
    while (childClusters.length > 0 && boundsZoom > zoom) {
      zoom += 1
      const newClusters = childClusters.flatMap((childCluster: any) => childCluster._childClusters)
      childClusters = newClusters
    }
    return childClusters.length > 1
  }

  /**
   * check all current clusters and sum up the sizes of its childen
   * this is the max relative value of any cluster and can be used to
   * calculate marker sizes
   * TODO this needs to use the "rest" group when doing calcuations!!
   */
  updateMarkerSizes() {
    this.maxRel = 0
    if (this.useClustering && this.markerCluster) {
      this.map.eachLayer((layer) => {
        if (isMarkerCluster(layer)) {
          const sumRels: Record<string, number> = {}
          const childMarkers = layer.getAllChildMarkers() as CustomMarker[]
          for (const child of childMarkers) {
            const color = child.markerData.color
            if (!sumRels[color]) sumRels[color] = 0
            sumRels[color] += child.markerData.point.rel
          }
          this.maxRel = Math.max(this.maxRel, ...Object.values(sumRels))
        } else if (isMarker(layer)) {
          this.maxRel = Math.max(this.maxRel, layer.markerData.point.rel)
        }
      })
      this.markerCluster.refreshClusters()
    }
  }
  // TODO when scope.maxRel is set, we should redraw all non-cluster markers using this

  /**
   * create normal layer (and all listeners) to be used when clustering is not enabled
   */
  createFeatureLayer() {
    const featureLayer = L.featureGroup()
    featureLayer.on("click", (e) => {
      const marker = e.propagatedFrom as CustomMarker | CustomMarkerMany
      this.selectedMarkers =
        marker.markerData instanceof Array ? marker.markerData : [marker.markerData]
      this.mouseOver(this.selectedMarkers)
    })
    featureLayer.on("mouseover", (e) => {
      const marker = e.propagatedFrom as CustomMarker | CustomMarkerMany
      const markerData = Array.isArray(marker.markerData) ? marker.markerData : [marker.markerData]
      this.mouseOver(markerData)
    })
    featureLayer.on("mouseout", () =>
      this.selectedMarkers.length > 0 ? this.mouseOver(this.selectedMarkers) : this.mouseOut(),
    )
    return featureLayer
  }

  /**
   * create marker cluster layer and all listeners
   */
  createMarkerCluster(
    clusterGroups: Record<string, MarkerGroup>,
    restColor: string,
  ): L.MarkerClusterGroup {
    const markerCluster = L.markerClusterGroup({
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      zoomToBoundsOnClick: false,
      iconCreateFunction: this.createClusterIcon(clusterGroups, restColor),
    }) as L.MarkerClusterGroup
    markerCluster.on("clustermouseover", (e: { propagatedFrom: L.MarkerCluster }) =>
      this.mouseOver(
        (e.propagatedFrom.getAllChildMarkers() as CustomMarker[]).map((layer) => layer.markerData),
      ),
    )
    markerCluster.on("clustermouseout", () =>
      this.selectedMarkers.length > 0 ? this.mouseOver(this.selectedMarkers) : this.mouseOut(),
    )
    markerCluster.on("clusterclick", (e: { propagatedFrom: L.MarkerCluster }) => {
      this.selectedMarkers = (e.propagatedFrom.getAllChildMarkers() as CustomMarker[]).map(
        (layer) => layer.markerData,
      )
      this.mouseOver(this.selectedMarkers)
      if (this.shouldZooomToBounds(e.propagatedFrom)) {
        return e.propagatedFrom.zoomToBounds()
      }
    })
    markerCluster.on("click", (e: { propagatedFrom: CustomMarker }) => {
      this.selectedMarkers = [e.propagatedFrom.markerData]
      return this.mouseOver(this.selectedMarkers)
    })
    markerCluster.on("mouseover", (e) => this.mouseOver([e.propagatedFrom.markerData]))
    markerCluster.on("mouseout", () =>
      this.selectedMarkers.length > 0 ? this.mouseOver(this.selectedMarkers) : this.mouseOut(),
    )
    markerCluster.on("animationend", () => this.updateMarkerSizes())
    return markerCluster
  }

  updateMarkers(selectedMarkers: MarkerGroup[], restColor: string) {
    if (this.markerCluster) this.map.removeLayer(this.markerCluster)
    if (this.featureLayer) this.map.removeLayer(this.featureLayer)

    if (this.useClustering) {
      const clusterGroups = keyBy(selectedMarkers, "color")
      const cluster = (this.markerCluster = this.createMarkerCluster(clusterGroups, restColor))
      this.map.addLayer(cluster)

      const isCluster = selectedMarkers.length !== 1
      for (const markerGroup of selectedMarkers) {
        this.maxRel = 0
        Object.values(markerGroup.markers).map((markerOrig) => {
          const icon = this.createMarkerIcon(markerGroup.color, isCluster)
          const marker = L.marker([markerOrig.lat, markerOrig.lng], { icon }) as CustomMarker
          marker.markerData = {
            label: markerOrig.label,
            color: markerGroup.color,
            point: markerOrig.point,
            queryData: markerOrig.queryData,
          }
          cluster.addLayer(marker)
        })
      }
    } else {
      this.featureLayer = this.createFeatureLayer()
      this.map.addLayer(this.featureLayer)

      const markersMerged = this.mergeMarkers(selectedMarkers)
      for (const markerData of markersMerged) {
        const icon = createMultiMarkerIcon(markerData.markerData, this.maxRel)
        const marker = L.marker([markerData.lat, markerData.lng], { icon }) as CustomMarkerMany
        marker.markerData = markerData.markerData
        this.featureLayer.addLayer(marker)
      }
    }

    this.updateMarkerSizes()
  }

  /**
   * merge lists of markers into one list with several hits in one marker
   * also calculate maxRel
   */
  mergeMarkers(markerLists: MarkerGroup[]): MergedMarker[] {
    this.maxRel = 0
    const val = markerLists.reduce(
      (memo, parent) => {
        for (const child1 of Object.values(parent.markers)) {
          const child: MarkerData = { ...child1, color: parent.color }
          const latLng = child1.lat + "," + child1.lng
          if (child.point.rel > this.maxRel) this.maxRel = child.point.rel
          if (latLng in memo) memo[latLng].markerData.push(child)
          else
            memo[latLng] = {
              markerData: [child],
              lat: child1.lat,
              lng: child1.lng,
            }
        }
        return memo
      },
      {} as Record<string, MergedMarker>,
    )
    return Object.values(val)
  }
}
