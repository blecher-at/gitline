'use strict';

var gulp = require('gulp');
var del = require('del');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var serve = require('gulp-serve');
var mocha = require('gulp-mocha');
var sass = require('gulp-sass');
//var git = require('gulp-git');
//#var process = require('gulp-process');
var sourcemaps = require('gulp-sourcemaps');
var deploy = require('gulp-deploy-git');
var all = require('gulp-all');

var typescriptSource = 'src/main/ts/**/*.ts';
var typeScriptTarget = 'target/js';
var sassSource = 'src/main/scss/**/*.scss';
var sassTarget = 'target/css';
var jsFileName = 'gitline.js';

var tsProject = ts.createProject({
    outFile: jsFileName,
    noImplicitAny: false
});


gulp.task('clean', function () {
  return del([
   	'.pages',
	'dist',
	'target/**/*'
  ]);
});

gulp.task('tsc', ['clean'], function () {
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

gulp.task('run', ['build', 'package'], serve('dist'));

gulp.task('watch', ['build', 'test','package'], function () {
    gulp.watch(typescriptSource, ['compress', 'test', 'package']);
    gulp.watch(sassSource, ['sass', 'package']);
});

gulp.task('package', ['clean', 'test'], function () {
	var p1 = gulp.src([
	  		'target/js/gitline.min.js', 
	  		'target/css/gitline.min.css', 
	  		'src/demo/html/**']).pipe(gulp.dest('dist'));
	var p2 = gulp.src([ 'src/main/external/**']).pipe(gulp.dest('dist/external'));
	var p3 = gulp.src([ 'src/test/data/**']).pipe(gulp.dest('dist/data'));
	return all(p1, p2, p3);
});

gulp.task('deploy', ['package'], function() {
  return gulp.src('dist/**/*')
    .pipe(deploy({
      repository: 'git@github.com:blecher-at/gitline.git',
	branches: ['feature/GL-36-dist', 'master'],
	message: 'auto deploy',
	debug: true,
	remoteBranch: 'gh-pages-test'
    }));
});

gulp.task('test', ['build'], function () {
    return gulp.src('src/test/GitlineTests.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha());
});
