'use strict';
var gulp        = require('gulp'),
    size        = require('gulp-size'),
    gutil       = require('gulp-util'),
    rename      = require('gulp-rename'),
    plumber     = require('gulp-plumber'),
    portfinder  = require('portfinder'),
    browserSync = require('browser-sync').create(),
    reload      = browserSync.reload;

// Styles

gulp.task('styles', function () {
    var postcss = require('gulp-postcss');
    var processors = [
            require('postcss-import'),
            require('postcss-mixins'),
            require('postcss-simple-vars'),
            require('postcss-nested'),
            require('postcss-focus'),
            require('postcss-assets'),
            require('postcss-inline-svg'),
            require('postcss-color-alpha'),
            require('postcss-color-function'),
            require('postcss-calc'),
            require('postcss-size'),
            require('postcss-easings'),
            require('postcss-custom-media'),
            require('postcss-media-minmax'),
            require('postcss-will-change'),
            require('autoprefixer', { browsers: ['last 2 versions'] })];
    var cssnano = require('cssnano');

    return gulp.src('assets/style/style.css')
            .pipe(plumber({errorHandler: onError}))
            .pipe(postcss(processors))
            .pipe(size())
            .pipe(gulp.dest('build/css/'))
            .pipe(postcss([cssnano({discardComments: {removeAll: true}})]))
            .pipe(size())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('build/css/'))
            .pipe(browserSync.stream());
});

// Scripts

gulp.task('scripts', function () {
    var concat = require('gulp-concat');
    var uglify = require('gulp-uglify');

    return gulp.src('assets/script/*.js')
            .pipe(plumber({errorHandler: onError}))
            .pipe(concat('scripts.js'))
            .pipe(size())
            .pipe(gulp.dest('build/js/'))
            .pipe(uglify())
            .pipe(size())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('build/js/'))
            .pipe(browserSync.stream());
});

// Images

gulp.task('imgmin', function () {
    var imagemin = require('gulp-imagemin');
    var png = require('imagemin-pngquant');
    var jpeg = require('imagemin-jpegtran');
    var svg = require('imagemin-svgo');

    return gulp.src('assets/img/*')
            .pipe(imagemin({
                progressive: true,
                use: [jpeg(), png(), svg()]
            }))
            .pipe(gulp.dest('build/img/.'))
            .pipe(browserSync.stream());
});

// Запуск локального сервера
gulp.task('server', function() {
  portfinder.getPort(function (err, port){
    browserSync.init({
      server: {
        baseDir: "."
      },
      host: 'localhost',
      notify: false,
      port: port
    });
  });
});

// Запуск локального сервера c туннелем
gulp.task('web-server', function() {
  portfinder.getPort(function (err, port){
    browserSync.init({
      server: {
        baseDir: "."
      },
      tunnel: true,
      host: 'localhost',
      notify: false,
      port: port
    });
  });
});

// Ошибки
var onError = function(error) {
  gutil.log([
    (error.name + ' in ' + error.plugin).bold.red,
    '',
    error.message,
    ''
  ].join('\n'));
  gutil.beep();
  this.emit('end');
};

gulp.task('watch', function() {
    gulp.watch(['assets/style/*.css'], ['styles']).on('change', browserSync.reload);
    gulp.watch(['assets/script/*.js'], ['scripts']).on('change', browserSync.reload);
    gulp.watch(['assets/img/*'], ['imgmin']).on('change', browserSync.reload);
});

// Одноразовая сборка проекта
gulp.task('build', function() {
  gulp.start('imgmin', 'styles', 'scripts');
});

// Запуск живой сборки
gulp.task('default', function() {
  gulp.start('server', 'imgmin', 'styles', 'scripts', 'watch');
});

// Туннель
gulp.task('external-world', function() {
  gulp.start('web-server', 'imgmin', 'styles', 'scripts', 'watch');
});
