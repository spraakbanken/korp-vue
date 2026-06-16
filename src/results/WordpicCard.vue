<script lang="ts" setup>
import type { RelationsSort } from "@/core/backend/types/relations"
import { formatWordOrLemgram, type MatchedRelation, type WordPictureSection } from "@/core/wordpic"
import WordpicRow from "./WordpicRow.vue"
import { memoize, sortBy } from "lodash-es"

const props = defineProps<{
  section: WordPictureSection
  prevSection?: WordPictureSection
  limit: number
  sort: RelationsSort
  showPos: boolean
}>()

defineEmits<{
  (e: "clickRow", row: MatchedRelation): void
}>()

// Memoize each step to reuse calculations
const findPrevTable = memoize((tableIndex: number) => {
  if (!props.prevSection) return
  return props.prevSection.tables.find((table) => table.index == tableIndex)
})

const findPrevColumn = memoize(
  (tableIndex: number, rel: string) => {
    const prevTable = findPrevTable(tableIndex)
    if (!prevTable) return
    return prevTable.columns.find((column) => column.config.rel == rel)
  },
  // Use both args for memoization key
  (tableIndex, rel) => `${tableIndex}-${rel}`,
)

function findPrevRow(
  tableIndex: number,
  rel: string,
  row: MatchedRelation,
): MatchedRelation | undefined {
  const prevColumn = findPrevColumn(tableIndex, rel)
  if (!prevColumn) return
  return prevColumn.rows.find(
    (prevRow) =>
      prevRow.other == row.other &&
      prevRow.otherpos == row.otherpos &&
      prevRow.prefix == row.prefix,
  )
}
</script>

<template>
  <div class="card p-2 bg-body-tertiary">
    <h4
      class="mb-3d"
      v-html="formatWordOrLemgram(section.heading.word, section.heading.pos, $t, true)"
    />

    <div class="d-flex flex-wrap gap-5">
      <div v-for="table in section.tables" :key="table.index">
        <!-- A table header with relation names -->
        <div class="hstack mb-2 justify-content-center">
          <div
            v-for="(column, i) in table.columnsBefore"
            :key="i"
            class="p-2 text-dark"
            :style="{ backgroundColor: column.config.color }"
          >
            {{ $t(column.config.alt_label || `rel.${column.config.rel.toLowerCase()}`) }}
          </div>
          <div
            class="p-2 fw-bold"
            v-html="formatWordOrLemgram(section.heading.word, section.heading.pos, $t)"
          />
          <div
            v-for="(column, i) in table.columnsAfter"
            :key="i"
            class="p-2 text-dark"
            :style="{ backgroundColor: column.config.color }"
          >
            {{ $t(column.config.alt_label || `rel.${column.config.rel.toLowerCase()}`) }}
          </div>
        </div>

        <!-- A column for each relation -->
        <div class="d-flex align-items-start">
          <div
            v-for="(column, i) in table.columns"
            :key="i"
            class="text-dark"
            :style="{ backgroundColor: column.config.color }"
          >
            <table class="m-1">
              <WordpicRow
                v-for="(row, key) in sortBy(column.rows, (row) => -row[sort]).slice(0, limit)"
                :key
                :row
                :prevRow="findPrevRow(table.index, column.config.rel, row)"
                :sort
                :showPos
                @click-row="$emit('clickRow', $event)"
              />
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
