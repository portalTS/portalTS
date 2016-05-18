/**
 * API for the configurations module.
 * The Configurations Module allows to save and retrieve configurations stored in the database.
 *
 * @module configurationsAPI
 * @inner
 */

import configurations = require('./libs/configurations');



/**
 * Callback returning an error and the configuration object
 * @callback configurationCallback
 * @param {any} err       the error, if any
 * @param {any} config    the configuration object
 */

/**
 * getConfiguration - returns a configuration object with the selected name
 *
 * @param  {string} name                             the name of the configuration object
 * @param  {configurationCallback} callback          standard callback function with error (if any) and the configuration object
 */
export function getConfiguration(name:string, callback:(err:any, config:any)=>void) {
    return configurations.getConfiguration(name, callback);
}


/**
 * Callback returning an error if any
 * @callback errorCallback
 * @param {any} err                                 the error, if any
 */

/**
 * saveConfigruation - save or update a configuration object with the selected name
 *
 * @param  {string} name                the name of the configuration object
 * @param  {any} config                 the configuration object
 * @param  {errorCallback} callback     standard callback function with error (if any)
 */
export function saveConfigruation(name:string, config:any, callback:(err:any)=>void) {
    return configurations.saveConfigruation(name, config, callback);
}



/**
 * removeConfiguration - removes (if exsists) the configuration object with the selected name
 *
 * @param  {string} name                     the name of the configuration object
 * @param  {errorCallback} callback          standard callback function with error (if any)
 */
export function removeConfiguration(name:string, callback:(err:any)=>void) {
    return configurations.removeConfiguration(name, callback);
}
