<script lang="ts" setup>
import { prefixAttr } from "@/core/config"
import { corpusSelection } from "@/core/corpora/corpusListing"
import type { AttributeOption } from "@/core/corpora/CorpusSet"
import type { Condition } from "@/core/cqp/cqp.types"
import { useLocale } from "@/i18n/useLocale"
import { groupBy } from "lodash"
import { computed, onMounted, ref } from "vue"

const props = defineProps<{
  condition: Condition
}>()

const emit = defineEmits<{
  (e: "update", value: string): void
}>()

const { locObj } = useLocale()

const optionsAll = ref<AttributeOption[]>([])
const optionsGrouped = computed(() => groupBy(optionsAll.value, "group"))

function findOption(name: string): AttributeOption | undefined {
  return optionsAll.value.find((option) => option.name === name)
}

function refresh() {
  const items = corpusSelection.getAttributeGroupsExtended()
  optionsAll.value = items

  // If selected attribute is no longer available, reset selection
  if (!findOption(props.condition.type)) {
    const wordOption = items[0]!
    emit("update", prefixAttr(wordOption))
  }
}

onMounted(refresh)
corpusSelection.listen(refresh)

function update(event: Event) {
  const target = event.target as HTMLSelectElement
  const selected = findOption(target.value)!
  emit("update", prefixAttr(selected))
}
</script>

<template>
  <div>
    <select class="form-select" @change="update">
      <optgroup
        v-for="(options, type) in optionsGrouped"
        :key="type"
        :label="$t(`attribute_type.${type}`)"
      >
        <option
          v-for="option in options"
          :key="option.name"
          :value="option.name"
          :selected="condition.type === option.name"
        >
          {{ locObj(option.label) }}
        </option>
      </optgroup>
    </select>
  </div>
</template>
