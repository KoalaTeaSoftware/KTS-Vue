<template>
  <div>
    <nav>
      <router-link to="/"> Home </router-link> |
      <span> 
        <router-link to="/feed"> Feed </router-link> |
      </span>
      <span v-if="isLoggedIn"> 
        <button @click="handleSignOut"> Logout </button> 
      </span>
      <span v-else>
        <router-link to="/register"> Register </router-link> |
        <router-link to="/sign-in"> Login </router-link>
      </span>

    </nav>
    <router-view/>
  </div>
</template>

<script setup>
import {ref} from 'vue' // used for conditional rendering
import {getAuth, onAuthStateChanged, signOut} from 'firebase/auth'
import {useRouter} from 'vue-router'

// this was automatically added by the IDE - it says use the compat variant - in order to use functions
import firebase from "firebase/compat";

const router = useRouter()

const isLoggedIn = ref(true)

const functions = firebase.functions();
const getUserByEmail = functions.httpsCallable('getUserByEmail')

// runs after firebase is initialized
onAuthStateChanged(getAuth(), function (user) {
  if (user) {
    isLoggedIn.value = true // if we have a user

    /*
    This is a temporary expedient - It trues to get user auth information - it WORKS!
     */
    getUserByEmail({email: "qwerty@uiop.com"})
        .then(response => {
          if (response.data.uid) {
            console.debug(`Received a response from the function. UID [${response.data.uid}]`);
          }
        })
        .catch(err => {
          console.debug(`[SetUpAdmin.getAuthorityOfSelectedUser.getUserByEmail] Error ${JSON.stringify(err)}`)
        })
  } else {
    isLoggedIn.value = false // if we do not

    console.debug(`App.vue:onAuthStateChanged - you have been logged-out`)
  }
})

// this calls a bit in the firebase auth SDK to ensure that the user data is cleared-off (I think)
const handleSignOut = () => {
  signOut(getAuth())
  router.push('/')
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>