import loader = require('../../core/loader');

var app = loader.__getApp();
var transporter = app.get('pmodules.mailer');


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
  * sendMail - send a new email using the defined transport layer with the options
  * specified in the options argument.
  *
  * @param  {type} options:mailOptions The options, containing sender, receivers, messages
  * @param  {type} callback:(err, info)=>void       Standard callback function. err is null if everythink is ok  
  */
export function sendMail(options:mailOptions, callback:(err, info)=>void) {
    transporter.sendMail(options, callback);
}
