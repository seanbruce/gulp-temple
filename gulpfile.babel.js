import gulp from 'gulp';
import sass from 'gulp-sass';
import uglify from 'gulp-uglify';
import postcss from 'gulp-postcss';
import concat from 'gulp-concat';
import autoprefixer from 'autoprefixer';
import browserSync from 'browser-sync';
import cssnano from 'cssnano';
import sourcemaps from 'gulp-sourcemaps';
import rename from 'gulp-rename';
import cleanCss from 'gulp-clean-css';
import babel from 'gulp-babel';
import del from 'del';
import imagemin from 'gulp-imagemin';

const server = browserSync.create();

const paths = {
	server: './build',
	sourceCode: './src',
	style: {
		src: './src/scss/**/*.scss',
		dest: 'build/css'
	},
	markup: {
		src: './src/*.html',
		dest: 'build/'
	},
	script: {
		src: './src/scripts/**/*.js',
		dest: 'build/scripts'
	}
};

const clean = () => {
	return del(['build']);
};

const compressPng = () => {
	return gulp
		.src('src/assets/**/*.png')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/assets'));
};

const compressJpg = () => {
	return gulp
		.src('src/assets/**/*.{jpg,jpeg}')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/assets'));
};

const compressSvg = () => {
	return gulp
		.src('src/assets/**/*.svg')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/assets'));
};

const compressImg = done => {
	gulp.parallel(compressJpg, compressPng, compressSvg);
	done();
};

const compileStyle = () => {
	return (
		gulp
			.src(paths.style.src)
			// Initialize sourcemaps before compilation starts
			.pipe(sourcemaps.init())
			.pipe(sass())
			.on('error', sass.logError)
			.pipe(cleanCss())
			// Use postcss with autoprefixer and compress the compiled file using cssnano
			.pipe(rename({ suffix: '.min' }))
			.pipe(postcss([autoprefixer(), cssnano()]))
			// Now add/write the sourcemaps
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(paths.style.dest))
			// Add browersync stream pipe after compilation
			.pipe(server.stream())
	);
};

const compileScript = () => {
	return gulp
		.src(paths.script.src, { sourcemaps: true })
		.pipe(babel())
		.pipe(uglify())
		.pipe(concat('main.min.js'))
		.pipe(gulp.dest(paths.script.dest))
		.pipe(server.stream());
};

const compileMarkup = () => {
	return gulp
		.src(paths.markup.src)
		.pipe(gulp.dest(paths.markup.dest))
		.pipe(server.stream());
};

const watchMarkup = () => {
	gulp.watch(paths.markup.src, gulp.series(compileMarkup, reload));
};

const watchScript = () => {
	gulp.watch(paths.script.src, gulp.series(compileScript, reload));
};

const watchStyle = () => {
	gulp.watch(paths.style.src, gulp.series(compileStyle, reload));
};

const watchImg = () => {
	gulp.watch('./src/assets/**/*.{jpg,jpeg,png,svg}', gulp.series(compressImg));
};

const reload = done => {
	server.reload();
	done();
};

const startServer = done => {
	server.init({
		server: {
			baseDir: './build'
		}
	});
	done();
};

const watch = () => {
	watchImg();
	watchMarkup();
	watchScript();
	watchStyle();
};

const dev = gulp.series(
	clean,
	gulp.parallel(compileMarkup, compileScript, compileStyle, compressImg),
	startServer,
	watch
);

export default dev;
