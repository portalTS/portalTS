import configuration = require('../models/configuration');



export function getConfiguration(name:string, callback:(err:any, config:any)=>void) {
    return configuration.repository.findOne({name:name}, (err, c) => {
        if (err) return callback(err, null);
        if (!c) return callback(null, null);
        return callback(null, c.data);
    });
}

export function saveConfigruation(name:string, config:any, callback:(err:any)=>void) {
    configuration.repository.findOne({name:name}, (err, c) => {
        if (err || !c) {
            return configuration.repository.create({
                name: name,
                data: config
            }, callback);
        }
        c.data = config;
        c.save(callback);
    });
}

export function removeConfiguration(name:string, callback:(err:any)=>void) {
    configuration.repository.remove({name:name}, callback);
}
