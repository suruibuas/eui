const gulp 	  = require('gulp');
const concat  = require('gulp-concat');
const uglify  = require('gulp-uglify');
const rename  = require('gulp-rename');
const header  = require('gulp-header');
const less    = require('gulp-less');
const cssmin  = require('gulp-minify-css');
const plumber = require('gulp-plumber');
const babel   = require('gulp-babel');
const sync    = require('browser-sync').create();
const reload  = sync.reload;

// 定义通用注释
var note = "/*!\r\n eadmin极速后台UI框架（我只想要个后台） | @author:317953536@qq.com \r\n*/\r\n";

// 开发模式
gulp.task('dev', [
    'jsmin'
], function() {
    sync.init({
        server: {
            baseDir: './dist'
        },
        browser: 'chrome'
    });
    // 编译类库
    gulp.watch([
        'src/js/**/*.js'
    ], ['jsmin']);
    // 编辑less
    gulp.watch('src/less/**/*.less', ['less']);
    // 合并CSS
    gulp.watch('src/css/**/*.css', ['css']).on('change', reload);
    // 重载
    gulp.watch([
        'dist/js/**/*.js',
        'dist/css/**/*.css',
        'dist/html/**/*.html',
        'dist/demo/**/*.html'
    ]).on('change', reload);
});

// 运行模式
gulp.task('run', [], function() {
    sync.init({
        server: {
            baseDir: './dist'
        },
        browser: 'chrome'
    });
});

// 压缩JS
gulp.task('jsmin', function(){
    // 压缩核心类，函数，初始化文件
    gulp.src([
        'src/js/core/al.load.js'
    ]).
    pipe(plumber()).
    pipe(babel()).
    pipe(uglify()).
    pipe(rename({
        suffix : '.min'
    })).
    pipe(header(note)).
    pipe(gulp.dest('dist/js/core'));
    // 压缩核心类，函数，初始化文件
    gulp.src([
        'src/js/core/al.conf.js',
        'src/js/core/al.func.js',
        'src/js/core/al.init.js'
    ]).
    pipe(plumber()).
    pipe(babel()).
    pipe(concat('al.init.js')).
    pipe(uglify()).
    pipe(rename({
        suffix : '.min'
    })).
    pipe(header(note)).
    pipe(gulp.dest('dist/js/core'));
    // 压缩类库
    gulp.src([
    	'src/js/lib/*.js'
    ]).
    pipe(plumber()).
	pipe(babel()).
    pipe(uglify()).
    pipe(rename({
    	suffix : '.min'
    })).
    pipe(header(note)).
    pipe(gulp.dest('dist/js/lib'));
    // 压缩框架
    gulp.src([
    	'src/js/framework/eadmin/1.0.1/*.js'
    ]).
    pipe(plumber()).
    pipe(babel()).
    pipe(uglify()).
    pipe(rename({
    	suffix : '.min'
    })).
    pipe(header(note)).
    pipe(gulp.dest('dist/js/framework/eadmin/1.0.1'));
});

//编译less
gulp.task('less', function(){
	gulp.src([
		'src/less/**/*.less',
		'!src/less/global.less'
	]).
	pipe(plumber()).
	pipe(less()).
    pipe(gulp.dest('src/css'));
});

//合并css
gulp.task('css', function(){
	return gulp.src([
        'src/css/*.css',
        'src/css/common/*.css',
        'src/css/lib/*.css',
	]).
    pipe(plumber()).
    pipe(concat('eadmin.min.css')).
    pipe(cssmin()).
	pipe(gulp.dest('dist/css'));
});