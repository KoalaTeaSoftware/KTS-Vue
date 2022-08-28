import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// this use of the compat variant is determined by the ID. This import is required for hte initialiseApp
import firebase from "firebase/compat";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCy9T3RZEsmWpkF3D4kxQiFKwP2N9CQ-JA",
  authDomain: "koala-tea-software-site.firebaseapp.com",
  projectId: "koala-tea-software-site",
  storageBucket: "koala-tea-software-site.appspot.com",
  messagingSenderId: "137250625085",
  appId: "1:137250625085:web:a009f37cb5b4fc943c3c54",
  measurementId: "G-RJ2SXNG7SZ"
};
firebase.initializeApp(firebaseConfig)

// when the project was cloned, it had this her. It results in the register crashing when run locally
// removing it allows for the thing to work locally
// if (location.hostname === "localhost") {
//   connectAuthEmulator(getAuth(), "http://localhost:9099");
// }

const app = createApp(App)

app.use(router)
app.mount('#app')
