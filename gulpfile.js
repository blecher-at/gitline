'use strict';

var gulp = require('gulp');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var serve = require('gulp-serve');
var mocha = require('gulp-mocha');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

var typescriptSource = 'src/main/ts/**/*.ts';
var typeScriptTarget = 'target/js';
var sassSource = 'src/main/scss/**/*.scss';
var sassTarget = 'target/css';
var jsFileName = 'gitline.js';

var tsProject = ts.createProject({
    outFile: jsFileName,
    noImplicitAny: false
});

gulp.task('tsc', function () {
    var tsResult = gulp.src(typescriptSource)
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject, {}, ts.reporter.fullReporter(true)));

    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(typeScriptTarget));
});

gulp.task('compress', ['tsc'], function () {
    return gulp.src(typeScriptTarget + '/' + jsFileName)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(typeScriptTarget));
});

gulp.task('sass:compressed', function () {
    return gulp.src(sassSource)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(sassTarget));
});

gulp.task('sass:uncompressed', function () {
    return gulp.src(sassSource)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(sassTarget));
});

gulp.task('sass', ['sass:uncompressed', 'sass:compressed']);

gulp.task('build', ['compress', 'sass']);

gulp.task('run', ['build'], serve('.'));

gulp.task('watch', ['build', 'test'], function () {
    gulp.watch(typescriptSource, ['compress', 'test']);
    gulp.watch(sassSource, ['sass']);
});

gulp.task('test', ['build'], function () {
    return gulp.src('src/test/GitlineTests.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha());
});