import path = require('path');
import fs = require('fs');
import express = require('express');
import loader = require('./loader');
import ppackage = require('./ppackage');
var colors = require('colors/safe');

export class Module {
    private path:string;
    private route:string;
    private public:string;
    private _views:string;
    private controllers:string[];
    private configFile:any;

    public constructor(dir:string, baseDir:string) {
        this.path = dir;
        this.route = dir.substring(dir.lastIndexOf('/')+1);
        this.public = path.join(baseDir, dir, 'public');
        this._views = path.join(baseDir, dir, 'views');
        this.controllers = [];
        var c = path.join(dir, 'controllers');
        if (fs.existsSync(c)) {
            var controllers = fs.readdirSync(c);
            for (var i = 0; i<controllers.length; i++) {
                if (controllers[i].indexOf('.js')==controllers[i].length-3) {
                    var p = path.join(baseDir, dir, 'controllers', controllers[i]);
                    this.controllers.push(p);
                }
            }
        }
        try {
            this.configFile = JSON.parse(fs.readFileSync(path.join(baseDir, dir, 'config.json'), "utf8"));
            if (this.configFile) {
                if (this.configFile.administration) {
                    this.configFile.administration.path = '../../'+this.route+'/views/'+this.configFile.administration.view_path;
                }
            }
        }
        catch (e) {
            this.configFile = null;
        }
    }


    public mount(app:express.Express):void {
        if (this.controllers.length>0) {
            console.log('Loading module '+colors.yellow(colors.underline(this.path))+" to route /"+this.route+"...");
            for (var i=0; i<this.controllers.length; i++) {
                var c = require(this.controllers[i]);
                for (var module_class in c) {
                    try {
                        var m = <ppackage.Package>new c[module_class]();
                        m.init(app);
                        var p = '/'+this.route;
                        if (m.isRoot()) p = '/';
                        if (m.hasRouter()) app.use(p, m.getRouter());
                    }
                    catch (ex) {
                        console.log(ex);
                    }
                }
            }
        }
        if (fs.existsSync(this.public)) app.use('/'+this.route, express.static(this.public));
        loader.Loader.addModule(this);
        loader.Loader.loadViews();
        console.info('Module '+colors.yellow(colors.underline(this.path))+' '+colors.bgGreen(colors.blue('loaded!')));
    }


    get views():string {
        return this._views;
    }

    public getRoute():string {
        return this.route;
    }

    public getConfigFile():any {
        return this.configFile;
    }

}
