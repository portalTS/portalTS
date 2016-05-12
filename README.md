![PortalTS](http://portalts.it/images/portal_small.png)

### Warning ###
We have just published the project. We are writing and uploading the documentation as fast as possible!
If you don't find the information that you need, please open a new issue, and we try to prioritize it!


## Intro ##
PortalTS is a web portal for developers created by developers.
If you are a NodeJS backend developer, or a frontend developer that wants to exploit the full power of Web Apps (also Single Page Applications) then you are in the right place!

## Motivation ##
We are NodeJS and AngularJS developers frustrated of the absence of a production ready web portal developed in NodeJS which implements all the necessary basic stuff, like user managements and authorization.

Thus, we decided to create PortalTS, in order to let developers to focus on important thinks, like their own business logic or web app, leaving all the boring stuff to our portal.

Moreover, we implement a RESTful API to save and retrieve any kind of data directly in the database, without loosing efficiency. It works like a backend-as-a-service inside the web portal, allowing frontend developers to persist their data without writing a single line of backend code.

Last but not least, we also provide a full featured administration interface, implemented using [AngularJS](https://angularjs.org/). You can manage users, groups and all the important stuff directly from this UI.
Of course, there is also the possibility to create static html pages. And when we say html pages, we mean that you write directly the html code in an online editor with real-time preview. No WYSIWYG! (at least for the moment :grin:).

## Technologies ##
PortalTS is built using some of the most important NodeJS library:

1. [ExpressJS](http://expressjs.com/), to manage different routers
2. [Mongoose](http://mongoosejs.com/), to interact with the MongoDB database
3. [Winston](https://github.com/winstonjs/winston), to save logs on different location
4. [Passport](http://passportjs.org/), to perform user authentication
5. [JWT (JSON Web Token)](https://jwt.io/), to manage stateless session, and allows easy mobile app integration
6. [Nodemailer](http://nodemailer.com/), to send email

Probably, if you work on NodeJS for more than 2 weeks, you know at lest 3 of them :yum:

PortalTS is completely written in [Typescript](https://www.typescriptlang.org/), a typed superset of Javascript that compiles to plain Javascript. Thanks to Typescript, say goodbye to the typical typo errors, and welcome a new level of code maintainability.


## Requirements ##
PortalTS needs to run:

1. MongoDB
2. Redis, necessary to manage user session


## Still reading?? ##
So you are really interested! For further information, you can swtich to the wiki!

## Contributors ##
* [Luca Roverelli](https://github.com/Sprechen)
* [Gabriele Zereik](https://github.com/gabrielezereik)
