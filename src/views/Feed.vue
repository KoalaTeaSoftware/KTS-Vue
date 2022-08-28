<template>
  <h1> Feed </h1>
  <h3> This page is for users only </h3>
</template>

<script setup>
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {useRouter} from 'vue-router'
import {onBeforeUnmount} from 'vue'

const router = useRouter()

/**
 * onAuthState changed waits for all asynchronous actions (like initialization) to resolve before running
 * so we get an accurate view of the usr, and we wait until we _can_  get it, and take action if the user
 * is not logged-in
 */
const authListener = onAuthStateChanged(getAuth(), function (user) {
  if (!user) { // not logged in
    alert('you must be logged in to view this. redirecting to the home page')
    router.push('/')
  }
});

// We also want to make sure to remove our authListener whenever our component is unmounted.
// I don't understand this
onBeforeUnmount(() => {
    // clear up listener
  authListener()
})

</script>