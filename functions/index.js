// get the admin stuff working
const admin = require('firebase-admin');
admin.initializeApp();

// make our custom-build functions available to the rest of the client-side code
const userManagement = require('./manageUsers');
exports.setUserRole = userManagement.setUserRole;