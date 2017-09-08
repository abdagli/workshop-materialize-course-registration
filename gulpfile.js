
const autoPrefixBrowserList = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];

const gulp = require('gulp');
const gutil = require('gulp-util');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const sourceMaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const minifyCSS = require('gulp-minify-css');
const browserSync = require('browser-sync');
const autoprefixer = require('gulp-autoprefixer');
const gulpSequence = require('gulp-sequence').use(gulp);
const shell = require('gulp-shell');
const plumber = require('gulp-plumber');
const fileinclude = require('gulp-file-include');

gulp.task('browserSync', function() {
	browserSync({
		server: {
			baseDir: "app/"
		},
		options: {
			reloadDelay: 250
		},
		notify: false
	});
});

gulp.task('vendors-app', function() {
	gulp.src(['src/vendors/**'])
		.pipe(plumber())
		.pipe(gulp.dest('app/cdn/vendors'));
});

gulp.task('vendors-dist', function() {
	gulp.src(['src/vendors/**'])
		.pipe(plumber())
		.pipe(gulp.dest('dist/cdn/vendors'));
});

gulp.task('images-app', function(tmp) {
	gulp.src(['src/images/*.jpg', 'src/images/*.png'])
		.pipe(plumber())
		.pipe(imagemin({
			optimizationLevel: 5,
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest('app/cdn/images'));
});

gulp.task('images-dist', function() {
	gulp.src(['src/images/*.jpg', 'src/images/*.png'])
		.pipe(plumber())
		.pipe(gulp.dest('dist/cdn/images'));
});

gulp.task('scripts-app', function() {
	return gulp.src(['src/scripts/**/*.js'])
		.pipe(plumber())
		.pipe(concat('app.js'))
		.on('error', gutil.log)
		.pipe(gulp.dest('app/cdn'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('scripts-dist', function() {
	return gulp.src(['src/scripts/**/*.js'])
		.pipe(plumber())
		.pipe(concat('app.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/cdn'));
});

gulp.task('styles-app', function() {
	return gulp.src('src/scss/style.scss')
		.pipe(plumber({
			errorHandler: function(err) {
				console.log(err);
				this.emit('end');
			}
		}))
		.pipe(sourceMaps.init())
		.pipe(sass({
			errLogToConsole: true,
			includePaths: [
				'src/scss/'
			]
		}))
		.pipe(autoprefixer({
			browsers: autoPrefixBrowserList,
			cascade: true
		}))
		.on('error', gutil.log)
		.pipe(concat('styles.css'))
		.pipe(sourceMaps.write())
		.pipe(gulp.dest('app/cdn'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('styles-dist', function() {
	return gulp.src('app/scss/style.scss')
		.pipe(plumber())
		.pipe(sass({
			includePaths: [
				'app/scss',
			]
		}))
		.pipe(autoprefixer({
			browsers: autoPrefixBrowserList,
			cascade: true
		}))
		.pipe(concat('styles.css'))
		.pipe(minifyCSS())
		.pipe(gulp.dest('dist/cdn'));
});

gulp.task('html-app', function() {
	return gulp.src('src/*.html')
		.pipe(plumber())
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(gulp.dest('app'))
		.pipe(browserSync.reload({
			stream: true
		}))
		.on('error', gutil.log);
});

gulp.task('html-dist', function() {
	gulp.src(['src/*.html'])
		.pipe(plumber())
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('clean-app', function() {
	return shell.task([
		'rm -rf app',
		'rm -rf dist'
	]);
});

gulp.task('clean-dist', function() {
	return shell.task([
		'rm -rf app',
		'rm -rf dist'
	]);
});

gulp.task('watch', function() {
	gulp.watch('src/vendors/**', ['vendors-app']);
	gulp.watch('src/images/**', ['images-app']);
	gulp.watch('src/scripts/**', ['scripts-app']);
	gulp.watch('src/scss/**', ['styles-app']);
	gulp.watch('src/parts/**/*.html', ['html-app']);
	gulp.watch('src/*.html', ['html-app']);
});

gulp.task('default', gulpSequence('clean-app', ['browserSync', 'vendors-app', 'images-app', 'scripts-app', 'styles-app', 'html-app', 'watch']));
gulp.task('dist', gulpSequence('clean-dist', ['vendors-dist', 'images-dist', 'scripts-dist', 'styles-dist'], 'html-dist'));