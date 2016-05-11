import mongoose = require('mongoose');


export var collectionSchema = new mongoose.Schema({
    name: String,
    created_by: mongoose.Schema.Types.ObjectId,
    created_at: Date
});

export interface Collection extends mongoose.Document {
    name: string,
    created_by: mongoose.Types.ObjectId,
    created_at: Date,
}

export var repository = mongoose.model<Collection>("Collection", collectionSchema);
