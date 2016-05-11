import module = require('./module');
import express = require('express');
import path = require('path');
import fs = require('fs');

var __app:express.Express;

export function __getApp() {
    return __app;
}

export class Loader {

    private static modules:module.Module[];
    private static app:express.Express;
    private static baseDir:string;
    private static config;
    private static router:express.Router;


    public static init(app:express.Express, baseDir:string):void {
        this.app = app;
        __app = app;
        this.baseDir = baseDir;
        this.modules = [];
        this.config = JSON.parse(fs.readFileSync(path.join(baseDir,'pmodules','modules.json'), "utf8"));

        for (var i=0; i<this.config.modules.length; i++) {
            this.addDir('pmodules/'+this.config.modules[i]);
        }

        this.router = express.Router();
        this.router.all('/*',  (req: express.Request, res: express.Response, next: Function) => {
            if (this.isEnable(req.originalUrl)) return next();
            else {
                res.send("no");
            }
        });
        app.use('/', this.router);
    }

    private static addDir(path:string):void {
        if (path=="./pmodules/") return;
        if (path.split('/').length>2) return;
        var mod = new module.Module(path, this.baseDir);
        mod.mount(this.app);
    }

    public static addModule(mod:module.Module):void {
        this.modules.push(mod);
    }

    public static loadViews():void {
        var v = [];
        for (var i=0; i<this.modules.length; i++) {
            v.push(this.modules[i].views);
        }
        v.push(path.join(this.baseDir, 'views'));
        this.app.set('views', v);
    }

    private static isEnable(url: string) : boolean {
        for (var mod in this.modules) {
            var route = this.modules[mod].getRoute();
            var l = route.length+1;
            var sub = url.substring(1,l);
            if (sub==route) {
                sub = url.substring(l);
                if (sub.length==0 || sub.charAt(0)=='/' || sub.charAt(0)=='?') {
                    return true;
                }
            }
        }
        return false;
    }

    public static getModules() : module.Module[] {
        return this.modules;
    }

}
