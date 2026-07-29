import type { TaskBase } from "@/core/task/TaskBase"
import { randomString } from "@/core/util"
import { reactive } from "vue"

export type DynamicTab = {
  readonly id: string
  readonly getLabel: () => string
  readonly task: TaskBase
}

const dynamicTabs = reactive<DynamicTab[]>([])

export function useDynamicTabs() {
  function createTab(getLabel: () => string, task: TaskBase) {
    const id = randomString()
    const tab = { id, getLabel, task }
    dynamicTabs.push(tab)
  }

  function closeTab(id: string) {
    const index = dynamicTabs.findIndex((tab) => tab.id === id)
    if (index !== -1) {
      dynamicTabs.splice(index, 1)
    }
  }

  return {
    createTab,
    closeTab,
    dynamicTabs,
  }
}
