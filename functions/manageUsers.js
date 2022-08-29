'use strict';

const logger = require("firebase-functions/lib/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * data: a json object to be supplied by you
 *     : i.e. {email: String, role: String, value: Boolean}
 * context: magically provided by firebase
 *
 * Note: the role's name has to be a reasonable number of chars long (just to try to make things more usable)
 * Compare this with the update. This one OVERWRITES existing claims, giving (or rescinding) just the one authority, and
 * rescinding all of the rest
 *
 * Find the user to go with the email, and set the specified custom claim accordingly
 * https://firebase.google.com/docs/auth/admin/custom-claims#set_and_validate_custom_user_claims_via_the_admin_sdk
 *  */

exports.setUserRole = functions.https.onCall((data, context) => {
    logger.debug(`Call made to my setUserRole with data [${JSON.stringify(data)}]`)
    // if ((context.auth.token.admin === true) || (context.auth.token.editor === true)) {
    const roleName = data.role
    const roleValue = !!data.value // convert it into a Boolean
    if (roleName.length > 1) {
        logger.debug(`A role has been defined in the call's parameters`)
        return admin.auth().getUserByEmail(data.email)
            .then(user => {
                logger.debug(`Received a response from firebase-getUserByEmail`)
                if (user.uid) {
                    logger.debug(`Response defines the user [${user.uid}]`)
                    return admin.auth().setCustomUserClaims(user.uid, {[roleName]: roleValue})
                        .then(() => {
                            logger.debug(`setCustomClaims has returned (am in the 'then' block)`)
                            return {
                                code: 200,
                                message: `User ${user.email}'s ${roleName} authority should now be ${roleValue}. `
                            }
                        })
                        .catch(err => {
                            logger.error(`[setUserRole] Crashed setting custom claims: ${JSON.stringify(err)}.`)
                            return {
                                code: 500,
                                message: `Unable to set role for ${data.email}. `
                            }
                        })
                } else {
                    // really this should not be called against an unknown user
                    logger.error(`[setUserRole] No UID was found to match the email [${data.email}]`)
                    return {code: 404, message: `User ${data.email}'s details can not be found. `}
                }
            })
            .catch(err => {
                logger.error(`[setUserRole] Crashed finding for ${data.email}: ${JSON.stringify(err)}`)
                return {
                    code: 500,
                    message: `Unable to get a handle on ${data.email}}. `
                }
            })
    } else {
        // client-side should be preventing this, really, so I'm calling this a warning
        logger.warn('[getUserAuthority] A more substantial role name is required')
        return {code: 400, message: `A more substantial role name is required. `}
    }
    // } else {
    //     // client-side should be preventing this, really, so I'm calling this a warning
    //     logger.warn('[getUserAuthority] Permission for action denied')
    //     return {code: 403, message: `Permission for action denied`}
    // }
})

/**
 * This uses onCall because it can be directly called from the client-side code
 * A common failure is forgetting that the input must be as a json object
 *
 * input - data: Object {email:<String>}
 * Return: A Promise that will give the User object (from firebase) to match the given email address, or a null object
 exports.getUserByEmail = functions.https.onCall((data, context) => {
    logger.debug(`[getUserByEmail] digging up info based on : [${data.email}]`)
    // if ((context.auth.token.admin === true) || (context.auth.token.editor === true)) {
    return admin.auth().getUserByEmail(data.email)
        .then(user => {
            logger.debug(`[getUserByEmail] found a user : [${JSON.stringify(user)}]`)
            return user
        })
        .catch(err => {
            if (err.code === "auth/user-not-found")
                logger.debug(`[getUserByEmail] Failed: ${JSON.stringify(err)} not found`)
            else
                logger.error(`[getUserByEmail] Failed: ${JSON.stringify(err)}`)
            // in either case, return nothing, and rely on the called to handle this
            return {}
        })
    // } else {
    //     // client-side should be preventing this, really, so I'm calling this a warning
    //     logger.warn('[getUserByEmail] Permission for action denied')
    //     return {}
    // }
})
 */

/**
 * Returns a Promise that will give the custom claims for the given user
 * See the file getUserAuthority.md
 * This has to operate on this side of the divide because you can only get your on claims on the client side
 * data: firebase User - a user object
 exports.getUserAuthority = functions.https.onCall((data, context) => {
        logger.debug(`[getUserAuthority] digging up info based on : [${data.email}]`)
        // if ((context.auth.token.admin === true) || (context.auth.token.editor === true)) {
        return admin.auth().getUser(data.uid)
            .then((userRecord) => {
                logger.debug(`[getUserAuthority] got the user's data on : [${JSON.stringify(userRecord)}]`)
                if (userRecord.customClaims) {
                    logger.info(`[getUserAuthority] the user has some custom claims [${JSON.stringify(userRecord.customClaims)}]]`)
                    return userRecord.customClaims
                } else {
                    logger.info('[getUserAuthority] the user has no custom claims at all')
                    return {}
                }
            })
            .catch(err => {
                logger.error(`[getUserAuthority] crashed: ${JSON.stringify(err)}`)
                return {}
            })
        // } else {
        //     // client-side should be preventing this, really, so I'm calling this a warning
        //     logger.warn('[getUserAuthority] Permission for action denied')
        //     return {}
        // }
    }
 )
 */


/**
 * Find the user to go with the email, and UPDATE the specified custom claim accordingly
 * data: {email: String, role: String, value: Boolean}
 * cf. the set version. This one affects only 1 of the set of roles that the user may have. The rest remain unchanged
 * Note: the role's name has to be a reasonable number of chars long (just to try to make things more usable)
 *
 * https://firebase.google.com/docs/auth/admin/custom-claims#set_and_validate_custom_user_claims_via_the_admin_sdk
 exports.updateUserRoles = functions.https.onCall((data, context) => {
    if ((context.auth.token.admin === true) || (context.auth.token.editor === true)) {
        const roleName = data.role
        const roleValue = !!data.value // ensure that it is a Boolean
        if (roleName.length > 1)
            return admin.auth().getUserByEmail(data.email)
                .then(user => {
                    if (user.uid) {
                        let currentRoles = user.customClaims ? user.customClaims : {}  // get what the user is already
                        currentRoles[roleName] = roleValue       // add/update the required claim
                        return admin.auth().setCustomUserClaims(user.uid, currentRoles)
                            .then(() => {
                                return {
                                    code: 200,
                                    message: `User ${user.email}'s authority should now be ${currentRoles}. `
                                }
                            })
                            .catch(err => {
                                logger.error(`[updateUserRoles] Error setting claims for ${data.email}: ${JSON.stringify(err)}`)
                                return {
                                    code: 500,
                                    message: `unable to get a handle on ${data.email}}. `
                                }
                            })
                    } else {
                        // really this should not be called against an unknown user
                        logger.error(`[updateUserRoles.getUserByEmail] Unable to find user ${data.email}.`)
                        return {code: 404, message: `User ${data.email}'s details can not be found. `}
                    }
                })
                .catch(err => {
                    logger.error(`[updateUserRoles] Crashed finding user, or setting, or getting their custom claims. ${JSON.stringify(err)}`)
                    return {
                        code: 500,
                        message: `Unable to get a handle on ${data.email}. `
                    }
                })
        else {
            // client-side should be preventing this, really, so I'm calling this a warning
            logger.warn('[updateUserRoles] A more substantial role name is required')
            return {code: 400, message: `A more substantial role name is required. `}
        }
    } else {
        // client-side should be preventing this, really, so I'm calling this a warning
        logger.warn('[updateUserRoles] Permission for action denied')
        return {code: 403, message: `Permission for action denied`}
    }
 })
 */

