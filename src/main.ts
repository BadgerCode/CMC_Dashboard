import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Add icons
// Solid icons
import { faShop, faGavel, faQuestion } from '@fortawesome/free-solid-svg-icons'
library.add(faShop, faGavel);
// Regular icons
// import { farThumbsUp } from '@fortawesome/free-regular-svg-icons'
// library.add(farThumbsUp);


const app = createApp(App)
    .component('font-awesome-icon', FontAwesomeIcon)

app.use(router)

app.mount('#app')
