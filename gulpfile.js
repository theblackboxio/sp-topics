var gulp = require('gulp');
var template = require('gulp-template');
var data = require('gulp-data');
var del = require('del'); // rm -rf
var gutil = require('gulp-util');
var minifyCSS = require('gulp-minify-css');
var sftp = require('gulp-sftp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var uncss = require('gulp-uncss');
var size = require('gulp-size');
var notify = require('gulp-notify');
var minifyHTML = require('gulp-minify-html');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var cmq = require('gulp-combine-media-queries');
var es = require('event-stream');
var properties = require('./properties.json');
var argv = require('yargs').argv;
var composer = require('gulp-composer');

var cssSources = [
    'src/assets/css/bootstrap.min.css',
    'src/assets/css/custom-bootstrap-paper.css',
    'src/assets/css/header.css',
    'src/assets/css/styles.css',
    'src/assets/css/vis.min.css'
];
var jsSources = [
    'src/assets/js/mustache.min.js',
    'src/assets/js/topic-dashboard.min.js',
    'src/assets/js/vis.min.js'
];
var ieJsSources = [
    'src/assets/js/html5shiv.js',
    'src/assets/js/respond.min.js'
];

var htmlSources = [
    'src/views/**/*'
];
var vendorSources = [
    'vendor/mustache/**/*'
];
var sizeChangeMessageCallBack = function(preSize, postSize, title) {
    return function () {
        var compression = 1.0 - postSize.size / preSize.size;
        var message = '';
        if (title) {
            message += title + ' ';
        }
        message += preSize.prettySize + ' -> ' + postSize.prettySize;
        message += ' (' + (compression * 100).toFixed(1) + '% compression rate)';
        return message;
    };
};


var output = 'dist/';
var environment;

if (argv.p) {
    if (! properties.production) {
        gutil.log('Production profile not found in properties file.');
        gulp.exit();
    }
    properties = properties.production;
    environment = 'production';
} else {
    if (! properties.development) {
        gutil.log('Development profile not found in properties file.');
        gulp.exit();
    }
    properties = properties.development;
    environment = 'development';
}
gulp.task('htaccess', ['clean'], function() {
   return gulp.src("src/**/.htaccess")
       .pipe(gulp.dest(output))
});
gulp.task('composer', ['clean'], function () {
    composer({ cwd: './', bin: 'composer' });
    return gulp.src(vendorSources)
        .pipe(gulp.dest(output + 'lib'))
});
gulp.task('template', ['clean'], function() {
    return gulp.src('src/api/**/*.php')
        .pipe(data(properties))
        .pipe(template())
        .pipe(gulp.dest(output + 'api'));
});
gulp.task('php', ['clean'], function() {
    return gulp.src('src/*.php')
        .pipe(gulp.dest(output));
});
gulp.task('html', ['clean'], function() {
    var preSize = size();
    var postSize = size();
    return gulp.src(htmlSources)
        .pipe(preSize)
        .pipe(data(properties))
        .pipe(template())
        .pipe(minifyHTML())
        .pipe(postSize)
        .pipe(gulp.dest(output + 'views'))
        .pipe(notify({
            onLast: true,
            title: 'HTML compression',
            message: sizeChangeMessageCallBack(preSize, postSize)
        }));
});

gulp.task('fonts', ['clean'], function() {
    return gulp.src(['src/fonts/*'])
        .pipe(gulp.dest(output + 'fonts'));
});
gulp.task('img', ['clean'], function() {
    var preSize = size();
    var postSize = size();
    return gulp.src(['src/images/**/*'])
        .pipe(preSize)
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(postSize)
        .pipe(gulp.dest(output + 'images'))
        .pipe(notify({
            onLast: true,
            title: 'Img compression',
            message: sizeChangeMessageCallBack(preSize, postSize)
        }));
});
gulp.task('css', ['clean'], function() {
    var preSize = size();
    var postSize = size();
    return gulp.src(cssSources)
        .pipe(preSize)
        .pipe(concat('all.css'))
        .pipe(cmq())
        //.pipe(uncss({html: htmlSources}))
        .pipe(minifyCSS())
        .pipe(postSize)
        .pipe(gulp.dest(output + 'assets/css'))
        .pipe(notify({
            onLast: true,
            title: 'CSS compression',
            message: sizeChangeMessageCallBack(preSize, postSize)
        }));
});
gulp.task('js', ['clean'], function() {
    var preSize = size();
    var postSize = size();
    var jsStream = gulp.src(jsSources)
        .pipe(concat('all.js'));
    var ieJsStream = gulp.src(ieJsSources)
        .pipe(concat('ie.js'));
    return es.merge(jsStream, ieJsStream)
        .pipe(preSize)
        .pipe(uglify())
        .pipe(gulp.dest(output + 'assets/js'))
        .pipe(postSize)
        .pipe(notify({
            onLast: true,
            title: 'JS compression',
            message: sizeChangeMessageCallBack(preSize, postSize)
        }));
});

gulp.task('send', ['build'], function() {
    var stream = gulp.src(output + '**/*');
    if (environment == 'development') {
        return stream.pipe(gulp.dest(properties.deploy.path));
    } else if (environment == 'production') {
        return stream.pipe(sftp(properties.deploy));
    }
});

gulp.task('build', ['template', 'html', 'php', 'htaccess', 'img', 'css', 'js', 'fonts','composer']);

gulp.task('clean', function(cb) {
    del([output], cb);
});

gulp.task('default', ['build']);

gulp.task('deploy', ['build', 'send']);
