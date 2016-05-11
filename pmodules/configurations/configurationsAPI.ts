import configurations = require('./libs/configurations');



/**
 * getConfiguration - returns a configuration object with the selected name
 *
 * @param  {type} name:string       the name of the configuration object
 * @param  {type} callback          standard callback function with error (if any) and the configuration object
 */
export function getConfiguration(name:string, callback:(err:any, config:any)=>void) {
    return configurations.getConfiguration(name, callback);
}



/**
 * saveConfigruation - save or update a configuration object with the selected name
 *
 * @param  {type} name:string       the name of the configuration object
 * @param  {type} config:any        the configuration object
 * @param  {type} callback          standard callback function with error (if any)
 */
export function saveConfigruation(name:string, config:any, callback:(err:any)=>void) {
    return configurations.saveConfigruation(name, config, callback);
}



/**
 * removeConfiguration - removes (if exsists) the configuration object with the selected name
 *
 * @param  {type} name:string       the name of the configuration object
 * @param  {type} callback          standard callback function with error (if any) 
 */
export function removeConfiguration(name:string, callback:(err:any)=>void) {
    return configurations.removeConfiguration(name, callback);
}
