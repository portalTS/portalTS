import ppackage = require('../../../core/ppackage');
import express = require('express');
var router = express.Router();


var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
// check http://nodemailer.com/ for more information about how to configure your transport layer!
var transporter = nodemailer.createTransport({
    host: 'your-host.com',
    port: 25,
    auth: {
        user: 'user@your-host.com',
        pass: 'password'
    },
    authMethod: 'PLAIN',
    secure: false,
    tls: { rejectUnauthorized: false },
    debug: true
});



export class MailerModule implements ppackage.Package {

    isRoot(): boolean {
        return false;
    }

    init(app: express.Express): void {
        app.set('pmodules.mailer', transporter);
    }

    hasRouter(): boolean {
        return false;
    }

    getRouter(): express.Router {
        return null;
    }



}
