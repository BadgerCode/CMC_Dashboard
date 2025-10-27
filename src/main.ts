import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import "./font-awesome"
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'


const app = createApp(App)
    .component('font-awesome-icon', FontAwesomeIcon)

app.use(router)

app.mount('#app')
