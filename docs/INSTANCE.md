# Instance

Any institution or person can run their own **instance** of Korp.
Depending on your data and requirements,
you can customize, disable or extend many aspects of Korp's functionality.
This document explains how.

The basic requirements for making the app run are covered in
[ARCHITECTURE.md: Instance code](./ARCHITECTURE.md#instance-code).

## Vue plugin

The **instance plugin** is a Vue plugin
that is installed to the app at initialization
(see [ARCHITECTURE.md: Initialization](./ARCHITECTURE.md#initialization)
and [Vue docs: Plugins](https://vuejs.org/guide/reusability/plugins)).

The `instance/plugin.ts` file must not directly export a plugin.
Instead, it must export a function, optionally async,
that returns the plugin.
This is in order to allow code-splitting
([Vue docs: Code Splitting](https://vuejs.org/guide/best-practices/performance.html#code-splitting)).

The creation function takes an `options` parameter, an object with:

- `mode: string`, the current mode, so you can make different customizations in different modes
- `t: (key: string) => string`, the Vue-I18n translation function, which you can use in value stringifiers, etc

## Configuration

During initialization
(see [ARCHITECTURE.md: Data flow](./ARCHITECTURE.md#data-flow)),
**instance config** is merged with **corpus config**.
The latter is fetched from the backend, and mainly documented in
[Backend README](https://github.com/spraakbanken/korp-backend/blob/dev/README.md#corpus-configuration-for-the-korp-frontend).
However, frontend-related parts of the corpus config are covered here.

### Instance config reference

> TODO Review, update

The first few settings are needed at initialization time, and thus must be specified in `config.yml` or `<mode>_mode.js`.

- **korp_backend_url** - String. _Required during init._ URL to Korp's backend
- **languages** - Array of objects. _Required during init._ Each object has a language code and label, for example:
  ```yaml
  - value: eng
    label: English
  - value: swe
    label: Svenska
  ```
- **logo** - Object. _Optional, but must be set during init._ Specify site-specific logos.
  - **korp** - String. HTML content for the Korp logo to the left of the corpus chooser. Default: [plain Korp logo](../app/img/korp.svg).
  - **organization** - String. HTML content for the organization logo(s) on the top right of the Korp window. Default: empty.
  - **chooser_right** - String. HTML content for a logo to the right of the corpus chooser: Default: empty.
    The HTML content can refer to image files in the `app/img/` directory of the configuration as `img/`_file_.
    If you wish to use the the [plain Korp logo](../app/img/korp.svg) (or other images in this repository) differently from the default, you should copy it to the configuration.
- **auth_module** - String or object. See [Authentication](#authentication)
- **autocomplete** - Boolean. If enabled, the Simple search input will use [Karp](https://spraakbanken.gu.se/en/tools/karp) to autocomplete lemgrams.
- **common_struct_types** - Object with attribute name as a key and attribute definition as value. Attributes
  that may be added automatically to a corpus. See [backend documentation](https://github.com/spraakbanken/korp-backend)
  for more information about how to define attributes.
- **config_dependent_on_authentication** - Boolean. If true, backend config will not be fetched until login check has finished.
- **corpus_info_link** - Object. Use this to render a link for each corpus in the corpus chooser.
  - **url_template** - String or translation object. A URL containing a token "%s", which will be replaced with the corpus id.
  - **label** - String or translation object. The label is the the same for all corpora.
- **default_options** - See [Operators](#operators).
- **default_overview_context** - The default context for KWIC-view. Use a context that is supported by the majority of corpora in the mode (URLs will be shorter). E.g.: `"1 sentence"`. For corpora that do not support this context an additional parameter will be sent to the backend based on the `context`-setting in the corpus.
- **default_reading_context** - Same as **default_overview_context**, but for the context-view. Use a context larger than the **default_overview_context**.
- **default_within** - An object containing the structural elements of a corpus. `default_within` is used unless a corpus overrides the setting using `within`. Example:

  ```yaml
  default_within:
    sentence: sentence
  ```

  In simple search, we will search within the default and supply extra information for the corpora that do not support the default.

  In extended search, the default `within` will be used unless the user specifies something else. In that case the user's choice will be used for all corpora that support it and for corpora that do not support it, a supported `within` will be used.

- **default_language** - String. The default interface language. Default: `"eng"`
- **description** - String. Any HTML content to show on frontpage until search is made.
- **enable_frontend_kwic_download** - Boolean. Frontend download. Gives CSV created by same data as available in the KWIC.
- **frontpage** - Object. Settings for what to show under the search form until a search is made.
  - **corpus_updates** - Boolean. Enables a listing of most recently updated corpora.
  - **examples** - List of objects. A random selection of three of these are shown on the frontpage as search links.
    - **label**: String or translation object.
    - **params**: Object. This is translated to URL search params when the link is clicked.
    - **hint**: String or translation object. Can contain HTML.
- **get_corpus_ids** - Async function returning a list of strings. The corpus ids are passed as the `corpus=` param to the `<korp_backend_url>/corpus_config?mode=<mode>` call, see the [`corpus_config`](https://ws.spraakbanken.gu.se/docs/korp#tag/Information/paths/~1corpus_config/get) API.
- **group_statistics** - List of attribute names. Attributes that either have a rank or a numbering used for multi-word units. For example, removing `:2` from `ta_bort..vbm.1:2`, to get the lemgram of this word: `ta_bort..vbm.1`.
- **has_timespan** - Boolean. If the backend supports the `timespan` call, used in corpus chooser for example. Default: `true`
- **hits_per_page_values** - Array of integer. The available page sizes. Default: `[25, 50, 75, 100]`
- **hits_per_page_default** - Integer. The preselected page size. Default: `hits_per_page_values[0]`
- **initialization_checks** - Async function. Implement this to do customized async initialization when setting initial corpus selection. Return true to skip standard selection processing afterwards.
- **input_case_insensitive_default** - Boolean. Decides if the simple search input should be case-insensitive by default.
- **iso_languages** - A map of two-letter ISO language codes to three-letter. Only used for fixing old links. Default: See `settings.js`
- **map_center** - See [Map](#map)
- **map_enabled** - Boolean. See [Map](#map)
- **matomo** - Object. Enable analytics with a [Matomo](https://matomo.org/) instance.
  - **url**: String. The URL of the Matomo instance, including trailing slash.
  - **site**: Integer. The site ID that Matomo has assigned for the Korp instance.
  - It is also possible to override each value underneath keys corresponding to `ENVIRONMENT` values, e.g:
    ```yaml
    matomo:
      url: https://matomo.example.com/
      site: 1
      production:
        site: 2
    ```
- **news_url** - See [News widget](#news-widget)
- **reduce_word_attribute_selector** - String, `union` / `intersection`. For the "compile based on" configuration in statistics, show all selected corpora _word_ attributes or only the attributes common to selected corpora. **Warning:** if set to `"union"`, the statistics call will fail if user selects an attribute that is not supported by a selected corpus.
- **reduce_struct_attribute_selector** - Same as **reduce_word_attribute_selector**, but for structural attributes.
- **statistics** - Boolean. Enable statistics search. Default: `true`
- **statistics_case_insensitive_default** - Boolean. Decides if the "Group by" option should be case-insensitive by default.
- **statistics_limit** - Boolean. Maximum number of rows to retrieve for statistics. Some accuracy is lost for large results, but it can save the browser from crashing.
- **statistics_postprocess** - Function. Allows post-processing of the statistics result.
- **visible_modes** - Integer. The number of modes to show links to. If there are more modes than this value, the rest will be added to a drop-down. Default: `6`
- **word_label** - Translation object. Translations for "word". Add if you need support for other languages. Default:
  ```yaml
  swe: ord
  eng: word
  ```
- **word_picture** - Boolean. Enable/disable the word picture.
- **word_picture_tagset** - See [Word picture](#word-picture)
- **word_picture_conf** - See [Word picture](#word-picture)

### Attribute config reference

> TODO Review, update

Corpora and their attributes are configured in the backend,
but most of the available settings are frontend related.
These are the available configuration parameters for attributes.

The following settings are available for `pos_attributes` and `struct_attributes`:

- **label**: Label to display wherever the attribute is shown.
- **display_type**: Set to `hidden` to fetch attribute, but never show it in the frontend.
  See `hide_sidebar`, `hide_statistics`, `hide_extended` and `hide_compare` for more control.
- **extended_component**: For available components, see [extended components](#extended-components). For writing custom components, see [customizing extended search](#customizing-extended-search).
- **external_search**: Link with placeholder for replacing value. Example `https://spraakbanken.gu.se/karp/#?search=extended%7C%7Cand%7Csense%7Cequals%7C<%= val %>`
- **group_by**: Set to either `group_by` or `group_by_struct`. Should only be needed for attributes with `is_struct_attr: true`.
  Those attributes are by default sent as `group_by_struct` in the statistics, but can be overridden here.
- **hide_sidebar**: `boolean`. Default `false`. Hide attribute in sidebar.
- **hide_statistics**: `boolean`. Default: `false`. Should it be possible to compile statistics based on this attribute?
- **hide_extended**: `boolean`. Default: `false`. Should it be possible to search using this attribute in extended?
- **hide_compare**: `boolean`. Default: `false`. Should it be possible to compare searches using this attribute?
- **internal_search**: `boolean`. Should the value be displayed as a link to a new Korp search? Only works for sets.
  Searches for CQP-expression: `[<attrName> contains "<regescape(attrValue)>"]`
- **is_struct_attr**: `boolean`.
  If `true`, the attribute will appear as a word-level attribute, but be used with the backend as a structural attribute.
  Useful for structural attributes that extend to smaller portions of the text than the selected context, such as name tagging.
- **opts**: Operators available in the query builder. See [Operators](#operators).
- **order**: Order of attribute in the sidebar. Attributes with a lower `order`-value will be placed above attributes
  with a higher `order`-value.
- **pattern**: HTML snippet with placeholders for replacing values. Available is `key` (attribute name) and `value`.
  Also works for sets. Example: `'<p style="margin-left: 5px;"><%=val.toLowerCase()%></p>'`
- **sidebar_component**: See [Customizing sidebar](#customizing-sidebar).
- **sidebar_info_url**: `string` (URL). If defined and non-empty, add an info symbol ⓘ for the attribute in the
  sidebar, linking to the given URL. This can be used to link to an explanation page for morphosyntactic tags, for example.
- **sidebar_hide_label**: `boolean`. If `true`, do not show the localized attribute label and the colon following it in the
  sidebar, only the attribute value. This can be used, for example, if the `pattern` for the attribute includes the label but
  the label should be shown in the attribute lists of the extended search or statistics.
- **stats_cqp**: See [Rendering attribute values in the statistics view](#rendering-attribute-values-in-the-statistics-view).
- **stats_stringify**: See [Rendering attribute values in the statistics view](#rendering-attribute-values-in-the-statistics-view).
- **stringify**: `string`. The key of a function in `<configDir>/custom/stringify.js`, used to render values in the sidebar and comparison results.
- **translation**: An object containing translations of possible values of the attribute, in this format:
  ```yaml
  ROOT:
    eng: Root
    swe: Rot
  ++:
    eng: Coordinating conjunction
    swe: Samordnande konjunktion
  +A:
    eng: Conjunctional adverbial
    swe: Konjuktionellt adverb
  ```
  This replaces value-translation in the translation-files, and also the old attribute `translationKey`.
- **type**: Possible values:
  - `set` - The attribute is formatted as "|value1|value2|". Include contains and not contains in `opts`.
    In the sidebar, the value will be split before formatted. When using compile / `groupby` on a "set"
    attribute in a statistics request, it will be added to `split`.
  - `url` - The value will be rendered as a link to the URL and possibly truncated if too long.

#### Custom attributes

Custom attributes are attributes that do not correspond to an attribute / annotation in the backend. They are mainly used to present information in the sidebar that combines values from other attributes.

- **custom_attributes**: creates fields in the sidebar that have no corresponding attribute in the backend. Useful for combining two different attributes. All settings concerning sidebar format for normal attributes apply in addition to:
  - **custom_type**: `"struct"` / `"pos"` - decides if the attribute should be grouped under word attributes or text attributes.
  - **pattern**: Same as pattern for normal attributes, but `struct_attrs` and `pos_attrs` also available. Example: `'<p style="margin-left: 5px;"><%=struct_attrs.text_title - struct_attrs.text_description%></p>'`

### Configuring features

This section aims to add context to some of the settings.

#### Dependency tree visualization

If a corpus has dependency annotations, the sidebar can show a tree visualization of the sentence. A button triggers a modal with the tree diagram.

Dependency annotations are identified as four attributes, by default `ref`, `pos`, `dephead` and `deprel`. The names can be overridden in corpus config:

```yaml
deptree:
  attrs: # This corpus has upos and udeprel instead
    pos: upos
    rel: udeprel
```

The button shows automatically if the attributes are present. To prevent this:

```yaml
deptree:
  hidden: true
```

#### Word picture

The word picture config object looks like this:

```yaml
word_picture_conf:
  pos_tag:
    - table_def1
    - table_def2
  # ...
```

where `table_defX` is an array of objects that describe the resulting word picture table.
`table_def1` above might look like this:

```yaml
- rel: subject
  color: "#d0d7f0"
- _
- rel: object
  color: "#f7d1e4"
- rel: adverbial
  color: "#edfcd5"
```

The `_` refers to the placement of the lookup word in the table order.
The value for `rel` refers to a key in `word_picture_tagset` looking like this:

```yaml
word_picture_tagset:
  subject: ss
  object: obj
  adverbial: adv
  preposition_rel: pa
  pre_modifier: at
  post_modifier: et
  adverbial2: aa
  # ...
```

The values are the actual relations returned by the backend.
The relation used is determined by `field_reverse` in the column def.
If `field_reverse` is `false` (default), `dep` is used, else `head`.
If you find yourself with a table full of the search word just flip the `field_reverse` switch.

`color` determines the background color of the column.
The last supported attribute is `alt_label`,
used for when another value than the relation name should be used for the table header.

#### Map

Korp's map uses annotations to get locations.
The user selects rows from the statistics table, and map markers derived from different rows will have different colors.
The selected corpora must have structural attributes with location data in them.
The format is `Fukuoka;JP;33.6;130.41667`

- the location name, country, latitude and longitude separated by `;`.

Also the name of the attribute must contain `"__"` and `"geo"` to show up in the list of supported attributes.

- `map_enabled` - Boolean. Enable/disable the map functionality.
- `map_center` - Where the center of the map should be located when user opens map. Example:

```yaml
map_center:
  lat: 62.99515845212052
  lng: 16.69921875
  zoom: 4
```

#### News widget

By setting `news_url`, the news widget is enabled.
The widget simply fetches a YAML file from the given URL.
A short example of such a file,
including only one news item with its title and body in two languages and a date:

```yaml
- title:
    swe: "Ny korpus: Tvåkammarriksdagen"
    eng: "New corpus: Tvåkammarriksdagen"
  body:
    swe: <p><a href="...">Tvåkammarriksdagen</a> finns nu i Korp.</p>
    eng: <p><a href="...">Tvåkammarriksdagen</a> is now available in Korp.</p>
  created: 2023-11-30
```

#### Date interval widget

If a corpus has time data
(see [Backend README: Time data](https://github.com/spraakbanken/korp-backend#time-data)),
you can enable a date interval widget for the Extended search query builder.
Add a **common structural attribute** config named `date_interval`:

```yaml
common_struct_types:
  date_interval:
    label: "time interval"
    hide_sidebar: "true"
    hide_compare: "true"
    hide_statistics: "true"
    opts: false
    extended_component: dateInterval
```

#### Operators

The operators available for an attribute in the Extended search query builder
are specified as `opts` in the attribute config.
The default value is given by the `default_options` setting.

Example setting:

```yaml
default_options:
  is: =
  is_not: "!="
  starts_with: ^=
  contains: _=
  ends_with: "&="
  matches: "*="
  matches_not: "!*="
```

The keys in this object are translation keys:
`is` yields the translation key `search.operator.is`.

The values are "Korp operators", a frontend-internal variant of CQP operators.
The purpose of the internal operators are, for example,
to know if values need to be escaped/unescaped with regards to special regexp characters.
They will be translated to proper CWB-supported operators
before being sent to the backend.
For example, `starts_with_contains` will be translated to `contains`
and the operand will be escaped and then have `.*` added to the end.

The object above is suitable for simple words/strings
where one can be interested in searching for affixes.

If there is a known value set of an attribute,
as for example in POS-tagging,
this is a suitable value for `opts`:

```yaml
opts:
  is: "="
  is_not": "!="
```

And if the attribute has a set of values instead of a single one,
but regexp and affixes should be supported,
use this:

```yaml
opts:
  contains: incontains_contains
  ends_with: ends_with_contains
  is: contains
  is_not: not contains
  matches: regexp_contains
  matches_not: not_regexp_contains
  starts_with: starts_with_contains
```

And if no regexp or affix-search is needed:

```yaml
opts:
  is: contains
  is_not: not contains
```

## Modes

Different sets of copora may have different features and requirements.
Therefore, corpora can be organized into **modes**.
You can make the instance plugin detect the current mode and make customizations accordingly.

The mode is specified by the `?mode=` URL parameter.
If not specified, the mode name is `default`.
In the instance plugin creation function, it is available as part of the `options` parameter.

To override settings in the plugin creation function,
simply import the instance config and modify it.

### Parallel mode

If the current mode has `parallel: true`,
some parts of the app are changed:

- The global corpus listing object uses the `CorpusSetParallel` class, which handles linked corpora, instead of `CorpusSet`
- The only available search mode is a multilingual variant of the Extended mode
- The KWIC shows linked sentences

## Localization

Specify available languages in the `languages` setting.
Then provide matching locales as `instance/locales/<code>.yaml`.

You can also override the default original locales by providing `swe.yaml` and `eng.yaml`.
They will be merged with the core versions,
so you only have to add the strings you want to change.

## Overriding services and components

Core functionality can be extended using
the [Provide/Inject](https://vuejs.org/guide/components/provide-inject) mechanism.
The `@/injection` module contains available injection keys.

### Overriding components

Vue components that can be overridden are included in `componentInjectionKeys`.
Implement your own component, import it in the plugin file and provide it to the key:

```js
app.provide(componentInjectionKeys.BrandPrimary, MyBrandPrimary)
```

### Authentication module

An authentication module implements the `VueAuthModule` type
to provide login and check corpus access.
Two implementations are provided in core:

- **Basic auth** (`@/auth/basic`) asks the user for credentials and then sends these along with each Korp backend request
- **Federated auth** (`@/auth/federated`) delegates authentication to a separate service that returns a [JWT](https://www.jwt.io/)

Create a module and use it with:

```js
app.provide(injectionKeys.auth, auth)
```

## Adding subplugins

The term _subplugins_ refers to various components and functions that can be identified by name in config.

Providing your own implementations is a three-step process:

- Implement a component or function
- Include it in an object that you provide for the subplugin type
- Reference the subplugin in config

For instance,
a component `MyFormatter.vue` can be provided as a formatter
and then referenced as `myFormatter` in config:

```js
app.provide(injectionKeys.attribute.formatters, {
  myFormatter: { component: MyFormatter },
})
```

### Subplugin types

Note the naming is undergoing change, and will eventually be more harmonized.

| Subplugin type | TS type                     | Injection key             | Config               |
| -------------- | --------------------------- | ------------------------- | -------------------- |
| Formatter      | `Component<FormatterProps>` | `.attribute.formatters`   | `sidebar_component`  |
| Widget         | `Component<WidgetProps>`    | `.search.widgets`         | `extended_component` |
| Stringifier    | `(item: string) => string`  | `.attribute.stringifiers` | `stringify`          |
| Reader         | `Component<ReaderProps>`    | `.readers`                | `reading_mode`       |

### Subplugin options

Some subplugin types allow passing optional **options** to the implementations,
in addition to basic props or args.
This makes it easier to vary implementation details in different contexts.

Assuming a formatter implementation `MyFormatter.vue`:

```html
<script lang="ts" setup>
import type { FormatterProps } from "@/results/formatter"

// Optionally declare custom options in addition to the basic formatter props
export type MyFormatterOptions = {
  foo: string
}

// Props will include `attribute`, `value`, etc, as well as `options.foo`
defineProps<FormatterProps<MyFormatterOptions>>()

// ...
```

Pass options either in config:

```yaml
# Enable by name
sidebar_component: myFormatter

# Enable by name and options
sidebar_component:
  name: myFormatter
  options:
    foo: bar
```

Or in the provide step:

```js
app.provide(injectionKeys.attribute.formatters, {
  myBarFormatter: {
    component: MyFormatter,
    options: { foo: "bar" },
  },
  myBazFormatter: {
    component: MyFormatter,
    options: { foo: "baz" },
  },
})
```

```yaml
# Enable by name
sidebar_component: myBarFormatter
```

### Formatters

An **formatter** is a component that shows an attribute value in the KWIC sidebar.

The default formatter is fairly powerful, and should mostly be enough.
With the appropriate attribute config, it can handle cases like sets, ranked values and urls.

### Stringifiers

A **stringifier** formats an attribute value string as HTML.
It is used by the default formatter for the sidebar,
but also in other result views like the statistics and comparison.

Please make sure you can trust that the output doesn't contain any harmful markup,
or otherwise escape or filter the data.
The default stringifier escapes any HTML in the value string.

### Widgets

A **widget** presents a value input for the query builder in the Extended search mode.
It should define a v-model
(see [Vue docs: Component v-model](https://vuejs.org/guide/components/v-model))
that the user can modify:

```ts
// A reactive model of the value in the query under construction
const model = defineModel<string>({ required: true })
```

### Reading mode

If a corpus has a text attribute named `text__id`,
the **reading mode** feature can be enabled.

To use the default reader component, modify the corpus config:

```yaml
reading_mode: true
```

Or provide a custom **reader** component and enable it with:

```yaml
reading_mode: myReader
```
