import express = require('express');

export interface Package {
    isRoot(): boolean;
    init(app:express.Express):void;
    hasRouter(): boolean;
    getRouter(): express.Router;
}
