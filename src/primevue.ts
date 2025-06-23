import { definePreset } from '@primeuix/themes'
import Nora from '@primeuix/themes/nora'

const preset = definePreset(Nora, {
  // Override default styles. To know what keys to use, find CSS variables in generated HTML/CSS using browser dev tools.
  // For instance, `--p-tabs-tab-padding` corresponds to `tabs.tab.padding` here.
  components: {
    panel: {
      header: {
        padding: '.5rem .75rem',
      },
      content: {
        padding: '.75rem',
      },
    },
    tabs: {
      tab: {
        padding: '.5rem .75rem',
      },
    },
  },
})

const primevueOptions = {
  theme: {
    preset,
  },
}

export default primevueOptions
