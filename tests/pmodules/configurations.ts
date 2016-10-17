const assert = require('assert');
var vows = require('vows');


var _name:string = "test-"+new Date().getTime();
var testConfig = {
    test: new Date(),
    result: 'ok'
};
var configurationsAPI = require('../../pmodules/configurations/configurationsAPI');


var tests = vows.describe('configurationsAPI');
tests.addBatch({
    'configurationsAPI-save': {
        topic: {},
        'save a new configuration': {
            topic: function(topic) {
                configurationsAPI.saveConfigruation(_name, testConfig, (err) => {
                    topic.err = err;
                    this.callback(null, topic);
                });
                return;
            },
            'has been saved': function(topic) {
                assert.equal(topic.err, null);
            }
        }
    }
});
tests.addBatch({
    'configurationsAPI-get': {
        topic: {},
        'retrieve the saved configuration': {
            topic: function(topic) {
                configurationsAPI.getConfiguration(_name, (err, config) => {
                    topic.err = err;
                    topic.config = config;
                    this.callback(null, topic);
                });
            },
            'has been retrieved': function(topic) {
                assert.equal(topic.err, null);
                assert.deepEqual(topic.config, testConfig);
            }
        }
    }
});
tests.addBatch({
    'configurationsAPI-remove': {
        topic: {},
        'remove the saved configuration': {
            topic: function(topic) {
                configurationsAPI.removeConfiguration(_name, (err) => {
                    topic.err = err;
                    this.callback(null, topic);
                });
            },
            'has been removed': function(topic) {
                assert.equal(topic.err, null);
            }
        }
    }
});

tests.run();
