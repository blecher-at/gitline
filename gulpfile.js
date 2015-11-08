var gulp = require('gulp');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var serve = require('gulp-serve');
var mocha = require('gulp-mocha');

var tsProject = ts.createProject({
    outFile: 'gitline.js',
    noImplicitAny: false
});

gulp.task('tsc', function () {
    var tsResult = gulp.src('src/main/ts/*.ts')
        .pipe(ts(tsProject, {}, ts.reporter.fullReporter(true)));
    return tsResult.js.pipe(gulp.dest('target'));
});

gulp.task('compress', ['tsc'], function () {
    return gulp.src('target/gitline.js')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('target'));
});

gulp.task('build', ['compress']);

gulp.task('run', ['build'], serve('.'));

gulp.task('watch', ['build'], function () {
    gulp.watch('src/main/ts/*.ts', ['build']);
});

gulp.task('test', function () {
    return gulp.src('src/test/GitlineTests.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha());
});
