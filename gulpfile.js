/* requires */

var gulp	= require('gulp'),
	bs		= require('browser-sync'),
	$		= require('gulp-load-plugins')({
		replaceString: /^gulp(-|\.)|postcss-/,
		pattern: ['*']
	});

/* paths */

var input = {
		html: 'dev/example/**/*.html',
		scss: 'dev/scss/**/*.scss',
		images: 'dev/example/images/*'
	},
	output = {
		dist: 'dist',
		main: 'example',
		css: 'example/css',
		images: 'example/images'
	};

var errorHandler = function(title) {
	return $.plumber({
		errorHandler: $.notify.onError(function(err) {
			return {
				title: title  + ' (' + err.plugin + ')',
				message: err.message
			};
		})
	});
} 

gulp.task('markup', function() {
	return gulp.src(input.html)
		.pipe(errorHandler('Markup'))
		
		.pipe($.fileInclude())
		.pipe($.cached('markup'))
		.pipe($.filter(['*']))
		.pipe(gulp.dest(output.main))
		.pipe(bs.stream());
});

gulp.task('styles', function() {
	return gulp.src(input.scss)
		.pipe(errorHandler('Styles'))
		
		.pipe($.concat('awsm.scss'))
		.pipe($.stylelint({
	      reporters: [
	        { formatter: 'string', console: true }
	      ]
	    }))
		.pipe($.sass())

		.pipe($.postcss([
			$.autoprefixer({ browsers: [ "> 1%" ] }),
			$.discardComments()
		]))
		.pipe(gulp.dest(output.css))
		.pipe(gulp.dest(output.dist))

		.pipe($.minifyCss())
		.pipe($.rename('awsm.min.css'))
		.pipe(gulp.dest(output.css))
		.pipe(gulp.dest(output.dist))

		.pipe(bs.stream());
});

gulp.task('images', function() {
	return gulp.src(input.images) 
		.pipe(errorHandler('Images'))

		.pipe(gulp.dest(output.images))
		.pipe(bs.stream());
});

gulp.task('server', function() {
	bs.init({
		server: output.main,
		open: false,
		browser: "browser",
		reloadOnRestart: true
	});
});

gulp.task('watch', function() {
	gulp.watch(input.html, gulp.series('markup'));
	gulp.watch(input.scss, gulp.series('styles'));
	gulp.watch(input.images, gulp.series('images'));
});

gulp.task('clean', function(cb) {
	return $.del(output.main);
});

gulp.task('build', gulp.series('markup', 'styles', 'images'));

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'server')));
