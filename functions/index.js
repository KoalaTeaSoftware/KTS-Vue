/*
As of today, this pulls-in and makes available just the getUserByEmail - it works!
 */

// Things that are pulled into this use stuff pulled in by this 'require'
const functions = require("firebase-functions");

const admin = require('firebase-admin');
admin.initializeApp();

const userManagement = require('./manageUsers');
exports.getUserByEmail = userManagement.getUserByEmail

