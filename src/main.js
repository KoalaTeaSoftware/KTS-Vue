import {createApp} from 'vue'
import App from './App.vue'
import router from './router'

// Initialize Firebase
// this use of the compat variant is determined by the ID. This import is required for hte initialiseApp
import firebase from "firebase/compat";

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

// -------------------------- active set-up stuff done, now define some utilities for user authority / authorisation

/**
 * When and onAuthRequest listener is created, it returns immediately with info about the current user
 * It would then sit listening, nut this bit of code has done its jog and nothing more to do, so remove this listener
 * Note that this is added to firebase so that it will be available to anyone that has imported firebase
 *
 * return: a Promise (but it will return immediately)
 */
firebase.getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
            unsubscribe();
            resolve(user); // give the caller the user
        }, reject);
    })
}

/**
 *  Notice that this is failsafe. If the user's authority can not be determined, then the user is deemed to not have any authority
 *
 *  it is not much more than a wrapper that simplifies the business of talking to the back-end
 *  maybe, at a later date, it could make use of a purpose-build permissions object
 *
 *  input: user: a User object (got from firebase (either getCurrentUser, or something else))
 *  return: a Promise that will give the authorities of the user (as their set of claims)
 */
firebase.getMyAuthority = user => {
    if (user) {
        return new Promise((onSuccess, reject) => {
            user.getIdTokenResult(true)
                .then(idTokenResult => {
                    onSuccess(idTokenResult)
                })
                .catch((error) => {
                    console.error(`[firebase.getMyAuthority] Error: [${error.message}]`)
                    reject(error)
                })
        })
    } else {
        console.debug(`[firebase.getMyAuthority] User is not signed in`)
        return Promise.resolve("")
    }
}

/**
 * This has to use a firebase function to actually mess with a user's custom claims
 * NOTE: this will take away any other role, by overwriting the custom claims
 *
 * @param user - a simple string e.g. a@b.com
 * @param role - the name of the role that is to be given to this user
 */
const functions = firebase.functions();
const setUserRole = functions.httpsCallable('setUserRole')

firebase.promoteUser = function (userEmailAddress, newRole) {
    console.debug(`[firebase.promoteUser] input data: user [user], new role [${newRole}]`)
    setUserRole({email: userEmailAddress, role: newRole, value: true})
        .then(r => {
            console.log(`Response from setUserRole [${JSON.stringify(r)}]`)
        })
        .catch(e => {
            console.error(`Crashed trying to setUserRole [${JSON.stringify(e)}]`)
        })
}

