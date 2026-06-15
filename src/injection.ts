import { defineAsyncComponent, inject, type Component, type InjectionKey, type Ref } from "vue"
import { mapValues } from "lodash-es"
import type { AuthModule } from "./core/auth"
import type { RowToken } from "./core/kwic/kwic"
import type { Stringifier } from "./attributes/attributes.types"
import type { MaybeConfigurable } from "./core/config/config.types"
import type { Widget } from "./search/extended/widgets/widget"
import type { Formatter } from "./results/formatter"
import type { Reader } from "./results/text/text"

/** Load a component which can be overridden by instance config. */
export const injectComponent = (name: keyof typeof components) =>
  inject(componentInjectionKeys[name], undefined) || defineAsyncComponent(components[name])

const components = {
  BrandPrimary: () => import("@/page/header/BrandPrimary.vue"),
  BrandSecondary: () => import("@/page/header/BrandSecondary.vue"),
  FooterContent: () => import("@/page/FooterContent.vue"),
  HelpMenu: () => import("@/page/header/HelpMenu.vue"),
}

// Generate injection keys for components
export const componentInjectionKeys = mapValues(
  components,
  () => Symbol() as InjectionKey<Component>,
)

export const injectionKeys = {
  auth: Symbol() as InjectionKey<AuthModule>,
  search: {
    widgets: Symbol() as InjectionKey<Record<string, MaybeConfigurable<Widget>>>,
  },
  attribute: {
    formatters: Symbol() as InjectionKey<Record<string, MaybeConfigurable<Formatter>>>,
    stringifiers: Symbol() as InjectionKey<Record<string, Stringifier>>,
  },
  readers: Symbol() as InjectionKey<Record<string, MaybeConfigurable<Reader>>>,
  resultProgress: Symbol() as InjectionKey<Ref<number>>,
  selectedToken: Symbol() as InjectionKey<Ref<RowToken | undefined>>,
}
