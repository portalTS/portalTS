import express = require('express');
import ppackage = require('../../../core/ppackage');

export class ErrorModule implements ppackage.Package {

    public init(app:express.Express):void {
        // catch 404 and forward to error handler
        app.use((req:express.Request, res:express.Response, next:Function) => {
            var err = <any>new Error('Not Found');
            err.status = 404;
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (app.get('env') === 'development') {
          app.use((err:any, req:express.Request, res:express.Response, next:Function) => {
            console.log(err);
            res.status(err.status || 500);
            res.render('error', {
                title: err,
              message: err.message,
              error: err
            });
          });
        }

        // production error handler
        // no stacktraces leaked to user
        app.use((err:any, req:express.Request, res:express.Response, next:Function) => {
            console.log(err);
          res.status(err.status || 500);
          res.render('error', {
              title: 'Error',
            message: err.message,
            error: {}
          });
        });
    }

    public isRoot(): boolean {
        return false;
    }

    public hasRouter(): boolean {
        return false;
    }

    public getRouter(): express.Router {
        return null;
    }

}
