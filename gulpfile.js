var gulp = require('gulp');
var clean = require('gulp-clean');
var gcallback = require('gulp-callback');
var typescript = require('gulp-tsc');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var map = require('map-stream');
var bower = require('gulp-bower');
var jsdoc = require('gulp-jsdoc3');
var gulpJsdoc2md = require('gulp-jsdoc-to-markdown')

gulp.task('default', function() {
    console.log("Main commands:");
    console.log("build             build all the modules and the portal source code");
    console.log("\n");
    console.log("Other commands:");
    console.log("compile           compile all the typescript files to the build folder");
    console.log("copy              copy all the files (!.ts) from the source folder to the build folder");
    console.log("clean             delete the build folder");
    console.log("bower             automatically install bower dependencies on the pmodules public folder");
    console.log("doc               to generate documentation of the different modules API");
});


gulp.task('copy', function() {
    return gulp.src(['pmodules/**', '!pmodules/**/*.ts']).pipe(gulp.dest('build/pmodules/'));

});

gulp.task('clean', function() {
    return gulp.src('build', {
        read: false
    }).pipe(clean());
});

gulp.task('compile', function() {
    return gulp.src(['./**/*.ts', "!./node_modules/**/*.ts", "!./**/bower_components/**/*.ts"])
        .pipe(typescript({
            "target": "es5",
            "module": "commonjs",
            "declaration": false,
            "noImplicitAny": false,
            "removeComments": false,
            "noLib": false,
            "outDir": "build"
        }))
        .pipe(gulp.dest('build/'))
});

gulp.task('build', function(callback) {
    runSequence('clean', 'compile', 'copy', callback);
});



gulp.task('bower', function() {
    return gulp.src(['pmodules/*/public/bower.json']).pipe(map(function(file, cb) {
        var path = file.history[0];
        path = path.substring(0, path.length - 'bower.json'.length);
        bower({
            cwd: path,
            interactive: true
        }).pipe(map(function() {
            cb(null, file);
        }));
    })).pipe(gulp.dest('build/'));
});



gulp.task('doc', function(cb) {
    return gulp.src('build/pmodules/*/*API.js')
        .pipe(gulpJsdoc2md())
        .on('error', function(err) {
            console.log(err);
        })
        .pipe(rename(function(path) {
            path.extname = '.md'
        }))
        .pipe(gulp.dest('../portalTS.wiki/docs/'));
});
