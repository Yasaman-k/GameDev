const { task, watch, series, src, dest, parallel } = require('gulp');
var program = require('commander');
var browserify = require('browserify');
var express = require('express');
var path = require('path');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var buffer = require('gulp-buffer');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var eslint = require('gulp-eslint');
var htmlmin = require('gulp-htmlmin');
var less = require('gulp-less');
var micro = require('gulp-micro');
var size = require('gulp-size');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var source = require('vinyl-source-stream');



program.on('--help', function () {
  console.log('Tasks:');
  console.log();
  console.log('    build       build the game');
  console.log('    clean       delete generated files');
  console.log('    dist        generate archive');
  console.log('    serve       launch development server');
  console.log('    watch       watch for file changes and rebuild automatically');
  console.log();
});

program
  .usage('<task> [options]')
  .option('-P, --prod', 'generate production assets')
  .parse(process.argv);

var prod = !!program.prod;

// task('default', series('build'));


task('build_source', function () {
  var bundler = browserify('./src/main', { debug: !prod });
  if (prod) {
    bundler.plugin(require('bundle-collapser/plugin'));
  }

  return bundler
    .bundle()
    .on('error', browserifyError)
    .pipe(source('build.js'))
    .pipe(buffer())
    .pipe(gulpif(prod, uglify()))
    // .pipe(dest('build'));
});

task('build_index', function () {
  return src('src/index.html')
    .pipe(gulpif(prod, htmlmin({
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true,
    })))
    .pipe(dest('build'));
});

task('build_styles', function () {
  return src('src/styles.less')
    .pipe(less())
    .pipe(concat('build.css'))
    .pipe(gulpif(prod, cssmin()))
    .pipe(dest('build'));
});





// task('clean', function () {
//   rimraf.sync('build');
//   rimraf.sync('dist');
// });
// function isFixed(file) {
//   // Has ESLint fixed the file contents?
//   return file.eslint != null && file.eslint.fixed;
// }


// task('lint', function () {
//   return src(['*.js', 'src/**/*.js'])
//     .pipe(eslint({ fix: true }))
//     .pipe(eslint.format())
//     .pipe(gulpif(isFixed, dest('../test/fixtures')))
// });



task('dist', function () {
  if (!prod) {
    gutil.log(gutil.colors.yellow('WARNING'), gutil.colors.gray('Missing flag --prod'));
    gutil.log(gutil.colors.yellow('WARNING'), gutil.colors.gray('You should generate production assets to lower the archive size'));
  }

  return src('build/*')
    .pipe(zip('archive.zip'))
    .pipe(size())
    .pipe(micro({ limit: 13 * 1024 }))
    .pipe(dest('dist'));
});

task('default', parallel('dist'));

task('watch', function () {
  // watch('src/**/*.js', parallel('lint', 'build_source'));
  watch('src/styles.less', series('build_styles'));
  watch('src/index.html', series('build_index'));
});

task('serve', function () {
  var htdocs = path.resolve(__dirname, 'build');
  var app = express();

  app.use(express.static(htdocs));
  app.listen(3000, function () {
    gutil.log("Server started on '" + gutil.colors.green('http://localhost:3000') + "'");
  });
});

function browserifyError(err) {
  gutil.log(gutil.colors.red('ERROR'), gutil.colors.gray(err.message));
  this.emit('end');
}
task('default', parallel('build_source', 'build_index', 'build_styles','dist', 'serve'));
// task('default', series('dist', 'serve'));

// exports.build = parallel('dist','serve');

// exports.build = series(build_source, build_index, build_styles, parallel(clean, watch));