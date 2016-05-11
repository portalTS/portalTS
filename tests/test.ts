var requireDirectory = require('require-directory');
module.exports = requireDirectory(module);

require('../app').onReadyCallback = () => {
    console.log("\n\nReady to start a test!");
};
