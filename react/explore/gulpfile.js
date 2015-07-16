// Honestly, this gulp file is an amalgum of random snippets I found online
// that help me get this stuff to build... Funky.
// I think the latest place I copypasted from was this site:
// https://truongtx.me/2014/08/06/using-watchify-with-gulp-for-fast-browserify-build/
//
var browserify = require('browserify');
var gulp = require('gulp');
var reactify = require('reactify');
var source = require("vinyl-source-stream");
var watchify = require('watchify');

gulp.task('browserify', function(){
  browserifyShare();
});

function browserifyShare(){
  // you need to pass these three config option to browserify
  var b = browserify({
    cache: {},
    packageCache: {},
    fullPaths: true
  });
  // use the reactify transform .jsx files
  b.transform(reactify); 
  b = watchify(b);
  b.on('update', function(){
    bundleShare(b);
  });
  
  b.add('./src/app.js');
  bundleShare(b);
}

function bundleShare(b) {
  b.bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./dist'));
}
