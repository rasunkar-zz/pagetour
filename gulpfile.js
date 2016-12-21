var gulp = require('gulp'),
    debug = require('gulp-debug'),
    plumber = require('gulp-plumber'),
    bower = require('gulp-bower'),
    main_bower_files = require('main-bower-files'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-cssmin'),
    filter = require('gulp-filter'),
    config = require('./project.config.json'),
    folders = require('gulp-folders'),
    replace = require('gulp-replace'),
    rename = require('gulp-rename'),
    prefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    rimraf = require("rimraf"),
    imagemin = require('gulp-imagemin');
runSequence = require('run-sequence');

// Error Handler function
var errorHandler = function(error) {
    console.log(error);
    this.emit('end');
};

// Function to filter the files based on extension
var filterByExtension = function(extension) {
    return filter(function(file) {
        return file.path.match(new RegExp('.' + extension + '$'));
    });
};


// Clean the distributable css directory
gulp.task('clean:css', function(done) {
    return rimraf(config.files.css.dest + '/*.css', done);
});

// Clean the distributable js directory
gulp.task('clean:js', function(done) {
    return rimraf(config.files.js.dest + '/*.js', done);
});

// Clean the distributable directory
gulp.task('clean:dist', function(done) {
    return rimraf(config.files.distDir + '/*', done);
});

// Minify css file and prepare the distributable css
gulp.task('minify:css', ['compile:scss'], function() {
    return gulp.src([
            config.files.css.lib + '**/*.css',
            config.files.css.dest + '**/*.css'
        ])
        .pipe(plumber(errorHandler))
        .pipe(concat('pagetour.module.css'))
        .pipe(cssmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.files.min));

});

// Compile the sass files
gulp.task('compile:scss', ['clean:css'], function() {
    return gulp.src(config.files.css.src)
        .pipe(plumber(errorHandler))
        .pipe(sass())
        .pipe(gulp.dest(config.files.css.dest));
});

// Minfiy the js files and prepare the distributable js
gulp.task('minify:js', ['pagetour:minify:js'], function() {
    return gulp.src([
            config.files.js.lib + '**/*.js',
            config.files.js.dest + '**/*.js'
        ])
        .pipe(plumber(errorHandler))
        .pipe(concat('pagetour.module.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.files.min));
});


// Minfiy the pagetour js files and prepare the distributable js
gulp.task('pagetour:minify:js', ['clean:js'], function() {
    console.log(config.files.js.src);
    return gulp.src(config.files.js.src)
        .pipe(plumber(errorHandler))
        .pipe(concat('pagetour.js'))
        .pipe(gulp.dest(config.files.js.dest));
});

// Minify images and prepare the distributable
gulp.task('minify:images', function() {
    return gulp.src(config.files.images.src)
        /*// Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))*/
        .pipe(gulp.dest(config.files.images.dest))
});

// Watch files for changes and repeat respective operations
gulp.task('watch', ['browserSync'], function() {
    gulp.watch(config.files.css[config.files.css.watch], ['minify:css']);
    gulp.watch(config.files.js[config.files.js.watch], ['minify:js']);
});

// Setting up the browser sync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: './',
        }
    })
});


// Clean the libraries directory
gulp.task('bower:clean', function(done) {
    del([config.files.lib], done);
});

// Install the libraries to the bower_components directory
gulp.task('bower:install', ['bower:clean'], function() {

    var js = filterByExtension('js');
    var css = filterByExtension('css');

    return gulp.src(main_bower_files())
        .pipe(debug())
        .pipe(plumber(errorHandler))
        .pipe(js)
        .pipe(gulp.dest(config.files.js.lib))
        .pipe(js.restore())
        .pipe(css)
        .pipe(gulp.dest(config.files.css.lib))
        .pipe(css.restore());
});

gulp.task('install', ['bower:install', 'bower:clean'], function() {});

gulp.task('default', function() {

    runSequence('clean:dist', ['minify:css', 'minify:js', 'minify:images'],
        function() {
            var message = 'Tasks Executed:\n' +
                '1. Cleaned the distributable folder. \n' +
                '2. Created js bundles and css bundles. \n' +
                '3. Minimized js bundles and css bundles. \n' +

                console.log(message);
        });
});

gulp.task('devTasks', function() {
    runSequence('default', 'watch');
});