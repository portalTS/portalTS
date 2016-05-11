import mongoose = require('mongoose');


export var documentSchema = new mongoose.Schema({
    _collection: mongoose.Schema.Types.ObjectId,
    _author: mongoose.Schema.Types.ObjectId,
    _readable: [mongoose.Schema.Types.ObjectId],
    _writable: [mongoose.Schema.Types.ObjectId],
    _public_readable: Boolean,
    _public_writable: Boolean,
    _updates: [
        {
            by: mongoose.Schema.Types.ObjectId,
            at: Date
        }
    ],
    _payload: {}
}, {
    timestamps: { createdAt: '_created_at', updatedAt: '_updated_at' }
});



export interface Document extends mongoose.Document {
    _collection: mongoose.Types.ObjectId,
    _author: mongoose.Types.ObjectId,
    _created_at: Date,
    _updated_at: Date,
    _readable: [mongoose.Types.ObjectId],
    _writable: [mongoose.Types.ObjectId],
    _public_readable: boolean,
    _public_writable: boolean,
    _updates: [
        {
            by: mongoose.Types.ObjectId,
            at: Date
        }
    ],
    _payload: any
}
