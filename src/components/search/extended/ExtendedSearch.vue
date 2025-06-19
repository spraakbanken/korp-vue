<script setup lang="ts">
import { useSearchStore } from '@/stores/search'
import { storeToRefs } from 'pinia'
import { reactive } from 'vue'

type Token = {
  attr: string
  op: string
  val: string
}

const searchStore = useSearchStore()
const { cqp } = storeToRefs(searchStore)

const tokens = reactive<Token[]>([])

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
    <div v-for="(token, i) in tokens" :key="i" style="display: inline-block; margin-right: 1em">
      <select v-model="token.attr">
        <option>lemgram</option>
        <option>word</option>
      </select>
      <select v-model="token.op">
        <option>!=</option>
        <option>=</option>
      </select>
      <input v-model="token.val" />
      <pre>{{ token.attr }} {{ token.op }} {{ token.val }}</pre>
      <button @click="removeToken(i)">Remove token</button>
    </div>
    <button @click="addToken()">Add token</button>
  </div>
  <input type="submit" @click="submit()" value="Search" />
  <pre>{{ cqp }}</pre>
</template>
