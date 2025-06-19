<script setup lang="ts">
import { useSearchStore } from '@/stores/search'
import { storeToRefs } from 'pinia'
import { Button, Card } from 'primevue'
import { reactive } from 'vue'

type Token = {
  attr: string
  op: string
  val: string
}

const searchStore = useSearchStore()
const { cqp } = storeToRefs(searchStore)

const tokens = reactive<Token[]>([{ attr: 'word', op: '=', val: '' }])

function addToken() {
  tokens.push({ attr: 'word', op: '=', val: '' })
}

function removeToken(i: number) {
  tokens.splice(i, 1)
}

function buildQuery() {
  return tokens.map((token) => `[${token.attr} ${token.op} "${token.val}"]`).join(' ')
}

function submit() {
  cqp.value = buildQuery()
}
</script>

<template>
  <div>
    <Card v-for="(token, i) in tokens" :key="i" style="display: inline-block; margin-right: 1em">
      <template #header>
        <div style="text-align: right">
          <Button @click="removeToken(i)" label="Remove token" size="small" />
        </div>
      </template>
      <template #content>
        <select v-model="token.attr">
          <option>lemgram</option>
          <option>word</option>
        </select>
        <select v-model="token.op">
          <option>!=</option>
          <option>=</option>
        </select>
        <input v-model="token.val" />
      </template>
    </Card>
    <Button @click="addToken()" label="Add token" />
  </div>
  <Button @click="submit()" label="Search" />
  <pre>{{ cqp }}</pre>
</template>
