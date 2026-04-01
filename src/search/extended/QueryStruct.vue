<script lang="ts" setup>
/** A boundary item in the query builder */
import { useReactiveCorpusSelection } from "@/corpora/useReactiveCorpusSelection"
import { useId } from "vue"

const struct = defineModel<string>("struct", { required: true })
const start = defineModel<boolean>("start", { required: true })

defineEmits<{
  /** Remove this token */
  (event: "remove"): void
}>()

const corpusSelection = useReactiveCorpusSelection()
const id = useId()
</script>

<template>
  <div class="hstack gap-2">
    <div class="vstack gap-2">
      <select v-model="struct" class="form-select">
        <option v-for="(label, tag) in corpusSelection.getCommonWithins()" :key="tag" :value="tag">
          {{ $t(`tag.${label}`) }}
        </option>
      </select>

      <div>
        <div class="form-check">
          <label class="form-check-label">
            <input
              class="form-check-input"
              type="radio"
              :name="`boundary-${id}-start`"
              :checked="start"
              @change="start = true"
            />
            {{ $t("search.extended.boundary.start") }}
          </label>
        </div>
        <div class="form-check">
          <label class="form-check-label">
            <input
              class="form-check-input"
              type="radio"
              :name="`boundary-${id}-start`"
              :checked="!start"
              @change="start = false"
            />
            {{ $t("search.extended.boundary.end") }}
          </label>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="btn-close"
      :aria-label="$t('search.extended.boundary_remove')"
      @click="$emit('remove')"
      style="width: 0.2rem; background-size: contain"
    ></button>
  </div>
</template>
