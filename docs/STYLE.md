# Style

The following guidelines are recommendations,
meant to decrease the load of decision-making and to make things more recognizable.

## Code

### Formatting

Use `npm run check` and `npm run fix` to run Eslint and Prettier.
Committed code must pass these checks.
If you can, set up your environment to lint and format automatically, see [DEVELOPMENT.md: Editor](./DEVELOPMENT.md#editor).

### TypeScript

Use TypeScript and no vanilla JavaScript: `*.ts` and `<script setup lang="ts">`.

Use types at least as enforced by the linter.
Beyond that, let developer experience guide usage, i.e. create and use them if it makes coding easier

### Core and View code

Strive to keep the View layer thin by pushing Vue-unrelated modelling and logic down to Core code. See [ARCHITECTURE.md: Layout](./ARCHITECTURE.md#layout)

### Vue concepts

Use **single-file components** with `<script setup lang="ts">`, see [Vue docs on \<script setup>](https://v3.vuejs.org/api/sfc-script-setup.html).

A **composable** for a feature called "foo" should be named `useFoo.ts` and export a function `useFoo()`.
See [Vue docs on composables](https://vuejs.org/guide/reusability/composables).

## User interface

### Basics

Use **Bootstrap** classes primarily.
Copy example code from the [Bootstrap docs](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
and adjust as needed.
The Bootstrap styles are slightly customized in Sass files under `@/assets`.

For styling that cannot be covered by Bootstrap classes,
use `style` attributes.
If you need CSS selectors, add a `<style>` section in the concerned Vue component.

Design for both **light** and **dark mode**.

Design for different **screen sizes**, but primarily for a low-end computer screen size, about 1000px wide.

### Typography

The **font** is [Jost](https://indestructibletype.com/Jost.html) for headings and `sans-serif` for everything else.

Use **links** if clicking means changing the page, use **button** if clicking triggers a change on the same page.

Use `target="_blank"` for links outside the app.

### Colors

Use the **primary color** for:

- a small number of actions/buttons that are most expected as the next step
- active items in a list
- clickable text on hover

Use the **secondary color** for:

- actions/buttons that aren't primary
- informational elements

Use the **error color** if the user's intention cannot be fulfilled, and the **warning color** if you suspect that the user's intention may not be fulfilled.

### Patterns

Use `<ModalDialog>` to give more space to a UI flow, while blocking interaction with the rest of the app.

### Elements

Add an **icon** to an element if it helps to clarify its meaning, or you want to make it more prominent.
Only replace a label with an icon if the need to save space is larger than the importance of the element.
