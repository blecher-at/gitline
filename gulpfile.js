'use strict';

var gulp = require('gulp');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var serve = require('gulp-serve');
var mocha = require('gulp-mocha');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

var tsProject = ts.createProject({
    outFile: 'gitline.js',
    noImplicitAny: false
});

gulp.task('tsc', function () {
    var tsResult = gulp.src('src/main/ts/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject, {}, ts.reporter.fullReporter(true)));

    return tsResult.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('target/js'));
});

gulp.task('compress', ['tsc'], function () {
    return gulp.src('target/js/gitline.js')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('target/js'));
});

gulp.task('sass:compressed', function () {
    return gulp.src('src/main/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('target/css'));
});

gulp.task('sass:uncompressed', function () {
    return gulp.src('src/main/scss/**/*.scss')
        .pipe(sourcemaps.write())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('target/css'));
});

gulp.task('sass', ['sass:uncompressed', 'sass:compressed']);

gulp.task('build', ['compress', 'sass']);

gulp.task('run', ['build'], serve('.'));

gulp.task('watch', ['build'], function () {
    gulp.watch('src/main/ts/**/*.ts', ['compress']);
    gulp.watch('src/main/scss/**/*.scss', ['sass']);
});

gulp.task('test', function () {
    return gulp.src('src/test/GitlineTests.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha());
});