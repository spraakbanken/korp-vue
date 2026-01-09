import type { LangString } from "@/core/model/locale"
import type { TaskBase } from "@/core/task/TaskBase"
import { randomString } from "@/core/util"
import { reactive } from "vue"

export type DynamicTab = {
  readonly id: string
  readonly label: LangString
  readonly task: TaskBase
}

const dynamicTabs = reactive<DynamicTab[]>([])

export function useDynamicTabs() {
  function createTab(label: LangString, task: TaskBase) {
    const id = randomString()
    const tab = { id, label, task }
    dynamicTabs.push(tab)
  }

  return {
    createTab,
    dynamicTabs,
  }
}
