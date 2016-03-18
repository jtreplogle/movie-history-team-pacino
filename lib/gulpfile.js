"use strict";

let gulp = require('gulp');
let jshint = require('gulp-jshint');
let watch = require('gulp-watch');
let sass = require('gulp-sass');
let sourcemaps = require('gulp-sourcemaps');
let gutil = require('gulp-util');

gulp.task('default', ['sass', 'watch']);

gulp.task('lint', () => {
  return gulp.src(['../app/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .on('error', function() {}
  );
});

gulp.task('sass', () => {
  return gulp.src('../sass/*.scss')
    // sourcemaps + sass + error handling
    .pipe(sourcemaps.init())
    .pipe(sass({
      sourceComments: true,
      outputStyle: 'compressed'  // nested || compressed
    }))
    .on('error', () => {})
    // generate .maps
    .pipe(sourcemaps.write({
      'includeContent': false,
      'sourceRoot': '.'
    }))
    .pipe(sourcemaps.write({
      'includeContent': true
    }))
    // write sourcemaps to a specific directory
    // give it a file and save
    .pipe(gulp.dest('../css'));
});

gulp.task('watch', () => {
  //gulp.watch(['../app/**/*.js'], ['lint']);
  gulp.watch('../sass/**/*.scss', ['sass']);

  gutil.log(gutil.colors.bgGreen('Watching for changes...'));
});
