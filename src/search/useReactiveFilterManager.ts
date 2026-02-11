import { GlobalFilterManager } from "@/core/search/GlobalFilterManager"
import { once } from "lodash-es"
import { reactive, type Reactive } from "vue"

/** Reactive wrapper around the `GlobalFilterManager` singleton object */
// Use `once` to ensure the reactive wrapper is only created once and then reused.
export const useReactiveFilterManager = once(
  () =>
    reactive(GlobalFilterManager.getInstance()) as Reactive<GlobalFilterManager> &
      GlobalFilterManager,
)
