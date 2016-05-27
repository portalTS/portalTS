import mongoose = require('mongoose');


export var relementSchema = new mongoose.Schema({
    data: Buffer,
    contentType: String,
    size: Number,
    name: String,
    isDirectory: Boolean,
    father: mongoose.Schema.Types.ObjectId,
}, {
    timestamps: { createdAt: '_created_at', updatedAt: '_updated_at' }
});

export interface RElement extends mongoose.Document {
    data: Buffer,
    contentType: string,
    size: number,
    name: String,
    isDirectory: boolean,
    father: mongoose.Types.ObjectId,
    _created_at: Date,
    _updated_at: Date
}

export var repository = mongoose.model<RElement>("RElements", relementSchema);
