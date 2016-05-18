/**
 * API for the mailer module.
 *
 * @module mailerAPI
 * @inner
 */

import loader = require('../../core/loader');

var app = loader.__getApp();
var transporter = app.get('pmodules.mailer');




/**
 * Helper object containing information about the email to send
 * @typedef {Object} mailOptions
 * @property {string} from              the sender email
 * @property {any} to                   the receivers, can be a single receiver (a string) or a list of receivers (array of string)
 * @property {string} subject           the subject of the email
 * @property {string} text              the plaintext of the email
 * @property {string} html              the html body of the email
 */
/**
 * mailOptions interface defines the options needed for the sendMail function
 */
export interface mailOptions {
    from:string, // sender address
    to:any, // String o arrays of string - list of receivers
    subject:string, // Subject line
    text:string, // plaintext body
    html:string // html body
};



/**
 * Callback returning an error and the info after an email is sent
 * @callback mailCallback
 * @param {any} err         the error, if any
 * @param {any} info        the info
 */

 /**
  * sendMail - send a new email using the defined transport layer with the options
  * specified in the options argument.
  *
  * @param  {mailOptions} options           The options, containing sender, receivers, messages
  * @param  {mailCallback} callback                 Standard callback function. err is null if everythink is ok
  */
export function sendMail(options:mailOptions, callback:(err, info)=>void) {
    transporter.sendMail(options, callback);
}
