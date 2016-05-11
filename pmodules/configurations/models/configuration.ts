import mongoose = require('mongoose');

export var configurationSchema = new mongoose.Schema({
    created_at: Date,
    edited_at: Date,
    name: String,
    data: {}
}, {
    timestamps: true
});

export interface Configuration extends mongoose.Document {
    created_at: Date,
    edited_at: Date,
    name: string,
    data: any
}

export var repository = mongoose.model<Configuration>("Configuration", configurationSchema);
