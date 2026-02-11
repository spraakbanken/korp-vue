import { defineAsyncComponent, inject, type Component, type InjectionKey, type Ref } from "vue"
import { mapValues } from "lodash-es"
import type { AuthModule } from "./core/auth"
import type { SelectedToken } from "./core/kwic/kwic"
import type { Stringifier } from "./attributes/attributes.types"

/** Load a component which can be overridden by instance config. */
export const injectComponent = (name: keyof typeof components) =>
  inject(componentInjectionKeys[name], undefined) || defineAsyncComponent(components[name])

const components = {
  BrandPrimary: () => import("@/header/BrandPrimary.vue"),
  BrandSecondary: () => import("@/header/BrandSecondary.vue"),
}

// Generate injection keys for components
export const componentInjectionKeys = mapValues(
  components,
  () => Symbol() as InjectionKey<Component>,
)

export const injectionKeys = {
  auth: Symbol() as InjectionKey<AuthModule>,
  search: {
    widgets: Symbol() as InjectionKey<Record<string, Component>>,
  },
  attribute: {
    stringifiers: Symbol() as InjectionKey<Record<string, Stringifier>>,
  },
  selectedToken: Symbol() as InjectionKey<Ref<SelectedToken | undefined>>,
}
