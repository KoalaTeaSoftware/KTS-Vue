<template>
  <div>
    <nav>
      <router-link to="/"> Home</router-link>
      |
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

// this is used for the various re-directs when a user logs out and the like
const router = useRouter()

const isLoggedIn = ref(true)
const isEditor = ref(true)

// runs after firebase is initialized, and makes decisions about the current user
// you will probably see it run twice, once saying the user is anonymous, then who the user realy is
onAuthStateChanged(getAuth(), function (user) {
  // the user has changed, so take away any privileges that they have already, only turning-on those that we specifically find
  isLoggedIn.value = false;
  isEditor.value = false;

  if (user) {
    isLoggedIn.value = true // if we have a user, they must now be logged-in

    firebase.getMyAuthority(user)
        .then(userData => {
          isEditor.value = userData.claims['editor'];

          if (isEditor.value) {
            console.debug(`The current user is an editor`);
          } else {
            console.debug(`The current user is NOT an editor`);
          }
        })
        .catch(err => {
          console.debug(`Crashed getting the user's custom claims [${JSON.stringify(err)}]`);
        })
  } else {
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