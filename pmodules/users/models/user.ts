import mongoose = require('mongoose');


export var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: Number, min: 0, max: 1000, default: 0 },
    create_at: Date,
    last_login: Date,
    registrationToken: String,
    custom_data: {}
});

export interface User extends mongoose.Document {
    username: string,
    password: string,
    role: number,
    create_at: Date,
    last_login: Date,
    registrationToken: string,
    custom_data: any
}

export var repository = mongoose.model<User>("User", userSchema);
