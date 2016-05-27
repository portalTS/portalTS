import relement = require('../models/relement');
import mongoose = require('mongoose');


import logger = require('../../logger/loggerAPI');

/**
 * Callback returning an error and an array of available elements
 * @callback elementsCallback
 * @param {any} err                                 the error, if any
 * @param {relement.RElement[]} _elements           the array of relements
 */


/**
 * getElements - This method returns the elements of a specified folder.
 *
 * @param  {ObjectId} fatherId              the folder
 * @param  {elementsCallback} callback      the callback
 * @return {void}
 */
export function getElements(fatherId, callback: (err, elements) => void) {
    relement.repository.find({ father: fatherId }, 'contentType size name isDirectory father _created_at _updated_at', callback);
}


/**
 * Callback returning an error and the new folder
 * @callback elementCallback
 * @param {any} err                                 the error, if any
 * @param {relement.RElement} _element              the new folder
 */


/**
 * createNewFolder - create a new folder with the specified name and father
 *
 * @param  {ObjectId} fatherId                 the fatherId
 * @param  {string} name                       the name of the new folder
 * @param  {elementCallback} callback          the callback
 * @return {void}
 */
export function createNewFolder(fatherId, name, callback: (err, element) => void) {
    var data = {
        name: name,
        isDirectory: true,
        father: fatherId
    };
    relement.repository.create(data, callback);
}


export function updateElement(element, callback: (err, element) => void) {
    relement.repository.findByIdAndUpdate(element._id, element, { new: true }, (err, updated) => {
        if (err) callback(err, null);
        var r = {
            contentType: updated.contentType,
            size: updated.size,
            name: updated.name,
            isDirectory: updated.isDirectory,
            father: updated.father,
            _created_at: updated._created_at,
            _updated_at: updated._updated_at
        };
        callback(err, r);
    });
}

export function renameElement(element, callback: (err, element) => void) {
    relement.repository.findByIdAndUpdate(element._id, { name: element.name }, { new: true }, (err, updated) => {
        if (err) callback(err, null);
        var r = {
            contentType: updated.contentType,
            name: updated.name,
            isDirectory: updated.isDirectory,
            father: updated.father,
            _created_at: updated._created_at,
            _updated_at: updated._updated_at
        };
        callback(err, r);
    });
}

export function createFile(d, callback: (err, element) => void) {
    if (d.father == 'null') d.father = null;
    else d.father = new mongoose.Types.ObjectId(d.father);
    relement.repository.create(d, callback);
}

export function getFile(id, callback: (err, element) => void) {
    relement.repository.findById(id, callback);
}

export function getFileFromName(fatherId, name, callback: (err, element) => void) {
    relement.repository.findOne({ father: fatherId, name: name }, callback);
}

export function getFileFromPath(path, callback: (err, element) => void) {
    var files = path.split('/');
    var recursive = (father, index, files) => {
        if (index == files.length - 1) {
            return getFileFromName(father, files[index], callback);
        }
        getFileFromName(father, files[index], (err, el) => {
            if (err) return callback(err, null);
            if (!el) return callback(files[index] + " not found", null);
            if (!el.isDirectory) return callback(files[index] + " is not a directory", null);
            index++;
            recursive(el, index, files);
        });
    }
    recursive(null, 0, files);
}

export function deleteFile(id, callback:(err) => void) {
    relement.repository.findById(id, (err, element) => {
        if (err) return callback(err);
        if (!element) return callback('not found');
        if (!element.isDirectory) {
            relement.repository.remove({_id:id}, callback);
            return;
        }
        var remover = (id) => {
            relement.repository.find({father:id}, (err, elements) => {
                if (err) {
                    logger.error(err);
                    return;
                }
                for (var i = 0; i<elements.length; i++) {
                    if (elements[i].isDirectory) {
                        remover(elements[i]._id);
                    }
                    relement.repository.remove({_id:elements[i]._id}, (err) => {
                        if (err) logger.error(err);
                    });
                }
            });
        }
        remover(element._id);
        relement.repository.remove({_id:element._id}, callback);
    });
}
