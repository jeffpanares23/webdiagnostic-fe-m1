import { createApp } from "vue";
import App from "./App.vue";
// import "./registerServiceWorker";
import router from "./router";
// import store from "./store";
import "./assets/styles.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";
import { directive as tippyDirective } from "vue-tippy";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";

// Create Vue App Instance
const app = createApp(App);

// Register VueTippy as a Global Directive
app.directive("tippy", tippyDirective);

// Use Router & Other Plugins
app.use(router);

// Load Custom Font
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap";
document.head.appendChild(fontLink);

// Mount the App Once
app.mount("#app");
