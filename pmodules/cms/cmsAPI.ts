/**
 * API for the CMS module. It defines functions for the web pages generation, integrated on the standard model of the web portal.
 *
 * @module cmsAPI
 * @inner
 */


 /**
  * Helper object cotaining information about the page to render
  * @typedef {Object} generatePageConfiguration
  * @property {string} html                 the html of the page
  * @property {string} title                the title of the displayed page
  * @property {string} path                 the path to the desired template, relative to the cms/views folder
  * @property {any} obj                     the object containing the information to generate the selected template
  */
function hackToGenerateTheCorrectDocumentation() {}


import express = require('express');
import persistenceAPI = require('../api/persistenceAPI');
import document = require('../api/models/document');
import users = require('../users/libs/users');
import group = require('../users/models/group');
import user = require('../users/models/user');
import usersAPI = require('../users/usersAPI');


function safeGetGroups(_user:user.User, callback:(groups:group.Group[])=>void) {
    if (!_user) {
        callback([]);
        return;
    }
    users.getGroups(_user, (err:any, groups:group.Group[])=> {
        if (err) callback([]);
        else callback(groups);
    });

}

function isExcludedMenuElement(menu:any, groups:group.Group[]) {
    var excluded = false;
    if (menu._payload.excluded_to) {
        for (var k=0; k<groups.length; k++) {
            for (var j=0; j<menu._payload.excluded_to.length; j++) {
                if (groups[k]._id==menu._payload.excluded_to[j]) {
                    excluded = true;
                    break;
                }
            }
            if (excluded) break;
        }
    }
    return excluded;
}

export function generateMenu(req:express.Request, callback:(menu:any[])=>void) {
    safeGetGroups(req.user, (groups:group.Group[]) => {
        persistenceAPI.searchDocuments('cms_menu_items', null, '', null, req.user, (err:any, docs?:document.Document[]):void => {
            var fathers = [];
            if (!docs) docs = [];
            for (var i = 0; i<docs.length; i++) {
                if (!docs[i]._payload.father_id) {
                    if (!isExcludedMenuElement(docs[i], groups)) {
                        var m = {
                            _id: docs[i]._id,
                            title: docs[i]._payload.title,
                            external_url: docs[i]._payload.external_url,
                            page_id: docs[i]._payload.page_id,
                            url: '',
                            order: docs[i]._payload.order,
                            sons: []
                        }
                        if (m.external_url) m.url = m.external_url;
                        else m.url = '/cms/'+m.page_id;
                        fathers.push(m);
                    }
                }
            }

            for (var i = 0; i<docs.length; i++) {
                if (docs[i]._payload.father_id) {
                    var father = null;
                    for (var k=0; k<fathers.length; k++) {
                        if (fathers[k]._id==docs[i]._payload.father_id) {
                            father = fathers[k];
                            break;
                        }
                    }
                    if (!father) continue;
                    var mm = {
                        _id: docs[i]._id,
                        title: docs[i]._payload.title,
                        external_url: docs[i]._payload.external_url,
                        page_id: docs[i]._payload.page_id,
                        url: '',
                        order: docs[i]._payload.order
                    }
                    if (mm.external_url) mm.url = mm.external_url;
                    else mm.url = '/cms/'+mm.page_id;
                    father.sons.push(mm);
                }

            }
            fathers.sort((a,b) => {
                return a.order - b.order;
            });
            callback(fathers);
        });
    });
}




export interface generatePageConfiguration {
    html?,
    title?,
    path?,
    notRewritePath?:boolean,
    obj?:any
}



/**
 * render - this method automatically generate a web page, using the header and the footer of the CMS, and putting the
 * chosen content as main content of the page.
 * The method can use both HTML and other templates.
 *
 * The configuration must be expressed on the config parameters, that needs the following properties:
 *
 * 1. title, the title of the displayed page;
 * 2. html, the html to display in the page;
 * 3. path, a path to the desired template, relative to the cms/views folder;
 * 4. obj, a javascript object that can be used by the desired template to display data
 *
 * @param  {express.Request} req             standard express request object
 * @param  {express.Response} res             standard express response object
 * @param  {generatePageConfiguration} config the configuration of the page to display
 */
export function render(req:express.Request, res:express.Response, config:generatePageConfiguration):void {
    if (config.html) {
        return res.render('page', {title: config.title, menus:(<any>req).menus, page:config.html});
    }
    /*if (config.path && !config.notRewritePath && config.path.chartAt(0)!='.' && config.path.chartAt(0)!='/') {
        path =
    }*/
    res.render('page_include', {title:config.title, menus:(<any>req).menus, included: config.path, obj:config.obj});
}
