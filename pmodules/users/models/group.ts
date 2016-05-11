import mongoose = require('mongoose');

export var groupMemberSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    added_at: Date,
    until: Date
});

export interface GroupMember {
    _id: mongoose.Types.ObjectId,
    added_at: Date,
    until: Date
};

export var groupSchema = new mongoose.Schema({
    name: String,
    description: String,
    created_by: mongoose.Schema.Types.ObjectId,
    created_at: Date,
    modified_by: mongoose.Schema.Types.ObjectId,
    modified_at: Date,
    users: [groupMemberSchema]
});


export interface Group extends mongoose.Document {
    name: string,
    description: string,
    created_by: mongoose.Types.ObjectId,
    created_at: Date,
    modified_by: mongoose.Types.ObjectId,
    modified_at: Date,
    users: GroupMember[]
}

export var repository = mongoose.model<Group>("Group", groupSchema);
