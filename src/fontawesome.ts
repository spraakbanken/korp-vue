import type { Plugin } from "vue"
import { library } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import {
  faAnglesDown,
  faAnglesUp,
  faArrowLeft,
  faArrowRight,
  faArrowRightFromBracket,
  faArrowRightToBracket,
  faCaretDown,
  faCaretRight,
  faChartLine,
  faCircleInfo,
  faDownload,
  faEarthAfrica,
  faLock,
  faLockOpen,
  faPlus,
} from "@fortawesome/free-solid-svg-icons"
import { faCircleQuestion, faFilePdf, faTrashCan } from "@fortawesome/free-regular-svg-icons"

// Search icons at https://fontawesome.com/search?ic=free-collection
library.add(
  faAnglesDown,
  faAnglesUp,
  faArrowLeft,
  faArrowRight,
  faArrowRightToBracket,
  faArrowRightFromBracket,
  faCaretDown,
  faCaretRight,
  faChartLine,
  faCircleInfo,
  faCircleQuestion,
  faDownload,
  faEarthAfrica,
  faFilePdf,
  faLock,
  faLockOpen,
  faPlus,
  faTrashCan,
)

const install: Plugin = (app) => {
  app.component("fa-icon", FontAwesomeIcon)
}

export default install
