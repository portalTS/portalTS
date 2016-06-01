
var lib = require('./libs/relements');



/**
 * readFile - read file from the Repository module.
 *
 * @param  {String} file            The file path
 * @param  {Function} callback      The callback is passed two arguments (err, data), where data is the contents of the file.
 * @return {void}
 */
export function readFile(file, callback) {
    lib.getFileFromPath(file, (err, element) => {
        if (err) return callback(err, null);
        if (!element) return callback('file not found', null);
        callback(null, element.data);
    });
}
