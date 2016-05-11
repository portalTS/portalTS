import group = require('../models/group');
import logger = require('../../logger/loggerAPI');

export function create(name:string, description:string, creator_id, callback:(err:any, newGroup:group.Group)=>void) {

    var _newGroup:any = {};
    _newGroup.name = name;
    _newGroup.description = description;
    _newGroup.created_by = creator_id;
    _newGroup.created_at = new Date();
    _newGroup.modified_by = creator_id;
    _newGroup.modified_at = _newGroup.created_at;

    group.repository.create(_newGroup, (err:any, newGroup:group.Group) => {
        if (err) {
            logger.error("Error creating a group", err);
        }
        callback(err, newGroup);
    });
};
