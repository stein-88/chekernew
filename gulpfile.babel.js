import gulp from 'gulp'
import babel from 'gulp-babel'
import concat from 'gulp-concat'
import uglify from 'gulp-uglify'
import cleanCSS from 'gulp-clean-css'
import del from 'del'
import jsonlint from "gulp-jsonlint"
import log from 'fancy-log'
import ohhtml from 'gulp-htmllint'
import colors from 'ansi-colors'
import wxmlmin from 'gulp-wxml-min'
import eslint from 'gulp-eslint'

const paths = {
    js: {
        src: './filestocheck/scripts/*.js',
        dest: './assets/scripts'
    },
    json: {
        src: './filestocheck/jsons/*.json',
        dest: './assets/scripts'
    },
    css: {
        src: './filestocheck/styles/*.css',
        dest: './assets/style'
    },
    html: {
        src: './filestocheck/templates/*.html',
        dest: './assets'
    }
}

export const clean = () => {
    return del(['assets'])
}

export const checkcss = () => {
    return gulp.src(paths.css.src)
        .pipe(cleanCSS())
        .pipe(concat('main.min.css'))
        .pipe(gulp.dest(paths.css.dest))
}

const myCustomReporter = (file) => {
    log('File ' + file.path + ' is not valid JSON.')
}

export const checkjson = () => {
    return gulp.src(paths.json.src)
        .pipe(jsonlint())
        .pipe(jsonlint.reporter(myCustomReporter))
        .pipe(gulp.dest(paths.json.dest))
}

const htmllintReporter = (filepath, issues) => {
    if (issues.length > 0) {
        issues.forEach((issue) => {
            log(colors.cyan('[gulp-htmllint] ') + colors.white(filepath + ' [' + issue.line + ',' + issue.column + ']: ') + colors.red('(' + issue.code + ') ' + issue.msg))
        })
        process.exitCode = 1
    }
}

export const checkhtml = () => {
    return gulp.src(paths.html.src)
        .pipe(ohhtml({}, htmllintReporter))
        .pipe(wxmlmin({
            collapseWhitespace: true,
            removeComments: true,
            keepClosingSlash: true
        }))
        .pipe(gulp.dest(paths.html.dest))
}

export const checkjs = () => {
    return gulp.src(paths.js.src, { sourcemaps: true })
        .pipe(babel())
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest(paths.js.dest))
}

export const watcher = () => {
    gulp.watch(paths.js.src, checkjs)
    gulp.watch(paths.css.src, checkcss)
    gulp.watch(paths.json.src, checkjson)
    gulp.watch(paths.html.src, checkhtml)
    return null
}

export const build = gulp.series(clean, gulp.parallel(checkjs, checkjson, checkhtml, checkcss))

export default build