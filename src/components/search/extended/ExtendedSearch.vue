<script setup lang="ts">
import { useSearchStore } from '@/stores/search'
import { storeToRefs } from 'pinia'
import { Button, Checkbox, IftaLabel, InputText, Panel, Select, Textarea } from 'primevue'
import { reactive, ref, watchEffect } from 'vue'

type Token = {
  attr: string
  op: string
  val: string
}

const createToken = (): Token => ({ attr: 'word', op: '=', val: '' })

const searchStore = useSearchStore()
const { cqp, freeOrder } = storeToRefs(searchStore)

const tokens = reactive<Token[]>([createToken()])
const freeOrderLocal = ref(freeOrder.value)
const cqpLocal = ref(cqp.value)

watchEffect(() => {
  cqpLocal.value = buildQuery()
})

function addToken() {
  tokens.push(createToken())
}

function removeToken(i: number) {
  tokens.splice(i, 1)
}

function buildQuery() {
  return tokens.map((token) => `[${token.attr} ${token.op} "${token.val}"]`).join(' ')
}

function submit() {
  freeOrder.value = freeOrderLocal.value
  cqp.value = buildQuery()
}
</script>

<template>
  <div class="flex flex-wrap items-center-safe gap-4 mb-4">
    <Panel v-for="(token, i) in tokens" :key="i">
      <template #header>
        <span class="font-medium">Token</span>
      </template>
      <template #icons>
        <Button
          v-if="tokens.length > 1"
          @click="removeToken(i)"
          icon="pi pi-times"
          aria-label="Remove token"
          size="small"
          text
          rounded
          severity="secondary"
          class="-my-1"
        />
      </template>

      <Select v-model="token.attr" :options="['lemgram', 'word']" class="mr-2" />
      <Select v-model="token.op" :options="['!=', '=']" />
      <div class="mt-2">
        <InputText v-model="token.val" />
      </div>
    </Panel>

    <Button @click="addToken()" label="Add token" />
  </div>

  <div class="my-4 flex flex-wrap gap-4">
    Options:
    <label><Checkbox binary v-model="freeOrderLocal" /> free order</label>
  </div>

  <Button @click="submit()" label="Search" />

  <IftaLabel class="my-2">
    <label>Search query</label>
    <Textarea v-model="cqpLocal" disabled auto-resize rows="1" class="w-full" />
  </IftaLabel>
</template>
