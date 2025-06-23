<script setup lang="ts">
import { computed, defineProps, ref, type DeepReadonly } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useToggle, watchDeep } from '@vueuse/core'
import type { Corpus } from '@/backend/types/corpus-config'
import { pick, pickBy } from 'es-toolkit'
import type { TreeNode } from 'primevue/treenode'
import { Tree } from 'primevue'
import { useInit } from '@/useInit'
import { th } from '@/util'

const [isOpen] = useToggle()
const { corpusInfo } = useInit()

const props = defineProps<{
  items: DeepReadonly<Corpus[]>
}>()
console.log('items', props.items)

const selection = defineModel<string[]>({ required: true })

const nodes = ref<TreeNode[]>(props.items.map((item) => ({ key: item.id, label: th(item.title) })))
// TODO reactive?
const treeSelection = ref<Record<string, { checked: boolean }>>(
  Object.fromEntries(
    props.items.map((item) => [
      item.id,
      {
        checked: selection.value.includes(item.id),
      },
    ]),
  ),
)
const tokenCount = computed<number | undefined>(() => {
  if (!corpusInfo.value) return undefined
  const selectedInfos = Object.values(pick(corpusInfo.value, selection.value))
  return selectedInfos.reduce((sum, info) => sum + Number(info.info.Size), 0)
})

watchDeep(treeSelection, () => {
  selection.value = Object.keys(pickBy(treeSelection.value, (v) => v.checked)).sort()
})
</script>

<template>
  <div>
    <!-- Button to open the modal dialog -->
    <Button
      :label="`Corpora: ${selection.length} selected, ${tokenCount} tokens`"
      @click="isOpen = true"
      severity="secondary"
      variant="outlined"
    />

    <!-- PrimeVue Dialog used as a modal -->
    <Dialog header="Select corpora" v-model:visible="isOpen" modal>
      <Tree v-model:selectionKeys="treeSelection" :value="nodes" selectionMode="checkbox"></Tree>
    </Dialog>
  </div>
</template>
