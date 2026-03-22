# CMC MC Dashboard

A dashboard to show various bits of data from the CMC MC server.

<br><br>

# Useful links
* [Vue Docs](https://vuejs.org/guide/introduction.html)
  * [Vite Configuration Reference](https://vite.dev/config/)
* [Tailwind Docs](https://tailwindcss.com/docs/styling-with-utility-classes)
* [Tailwind templates](https://tailwindcss.com/plus/ui-blocks/application-ui/application-shells/stacked)
* [Flowbite components](https://flowbite.com/docs/components/buttons/)


<br><br><br>

# Local Setup

## IDE & tools
* [VS Code](https://code.visualstudio.com/)
  * Extension [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).
* Node 25 or later

<br>

## Config
Create the file `.env.local` in the root folder with the following contents
```
VITE_API_URL="https://api.smponlinedashboard.com"
```

<br>

## Running
In the terminal
```sh
# Install current packages
npm ci

# Run the project
npm start
```

<br>

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

<br>

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.
