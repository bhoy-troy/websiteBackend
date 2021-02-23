////////////////////////////////
// Setup
////////////////////////////////

// Gulp and package
const {src, dest, parallel, series, watch} = require('gulp');
const pjson = require('./package.json');

// Plugins
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();

const concat = require('gulp-concat');

const cssnano = require('cssnano');
// const imagemin = require('gulp-imagemin');
const pixrem = require('pixrem');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const reload = browserSync.reload;
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const spawn = require('child_process').spawn;
const uglify = require('gulp-uglify-es').default;
const cleanCSS = require('gulp-clean-css');

// Relative paths function
function pathsConfig(appName) {
  this.app = `./${pjson.appRoot}`;
  const vendorsRoot = 'node_modules';

  return {

    bootstrapSassSrc: `${vendorsRoot}/bootstrap/scss/**`,
    fontAwesome: {
      css: [`${vendorsRoot}/@fortawesome/fontawesome-free/css/all.css`],
      js: [`${vendorsRoot}/@fortawesome/fontawesome-free/js/all.js`],
      webfonts: [`${vendorsRoot}/@fortawesome/fontawesome-free/webfonts/**`],
      svgs: [`${vendorsRoot}/@fortawesome/fontawesome-free/svgs/**`],
      sprites: [`${vendorsRoot}/@fortawesome/fontawesome-free/sprites/**`]
    },


    vendorsJs: [
      `${vendorsRoot}/jquery/dist/jquery.slim.js`,
      `${vendorsRoot}/popper.js/dist/umd/popper.js`,
      `${vendorsRoot}/bootstrap/dist/js/bootstrap.js`,
    ],

    app: this.app,
    templates: `${this.app}/templates`,
    css: `${this.app}/static/css`,
    sass: `${this.app}/static/sass`,
    bootstrapSassDest: `${this.app}/static/sass/bootstrap`,
    fonts: `${this.app}/static/fonts`,
    images: `${this.app}/static/images`,
    js: `${this.app}/static/js`,
    vendors: {
      css: `${this.app}/static/vendors/css`,
      js: `${this.app}/static/vendors/js`,
      webfonts: `${this.app}/static/vendors/webfonts`,
      sprites: `${this.app}/static/vendors/sprites`,
      svgs: `${this.app}/static/vendors/svgs`
    }
  }
}


var paths = pathsConfig();

////////////////////////////////
// Tasks
////////////////////////////////

// Styles autoprefixing and minification
function styles() {
  var processCss = [
    autoprefixer(), // adds vendor prefixes
    pixrem(),       // add fallbacks for rem units
  ];

  var minifyCss = [
    cssnano({preset: 'default'})   // minify result
  ];

  return src(`${paths.sass}/project.scss`, {allowEmpty: true})
      .pipe(sass({
        includePaths: [
          // paths.bootstrapSass,
          paths.sass
        ]
      }).on('error', sass.logError))
      .pipe(plumber()) // Checks for errors
      .pipe(postcss(processCss))
      .pipe(dest(paths.css))
      .pipe(rename({ suffix: '.min' }))
      .pipe(postcss(minifyCss)) // Minifies the result
      .pipe(dest(paths.css))
}

function bootstrapSass() {
  return src(paths.bootstrapSassSrc, {allowEmpty: true})
      .pipe(dest(paths.bootstrapSassDest));
}

function fontAwesomeStyles() {
  return src(paths.fontAwesome.css, {allowEmpty: true})
      .pipe(concat('fontAwesome.css'))
      .pipe(dest(paths.vendors.css))
      .pipe(plumber()) // Checks for errors
      .pipe(cleanCSS())// Minifies the CSS
      .pipe(rename({ suffix: '.min' }))
      .pipe(dest(paths.vendors.css))
}


// Javascript minification
function scripts() {
  return src(`${paths.js}/project.js`, {allowEmpty: true})
      .pipe(plumber()) // Checks for errors
      .pipe(uglify()) // Minifies the js
      .pipe(rename({ suffix: '.min' }))
      .pipe(dest(paths.js))
}

// Vendor Javascript minification
function vendorScripts() {
  return src(paths.vendorsJs,{allowEmpty: true})
      .pipe(concat('vendors.js'))
      .pipe(dest(paths.js))
      .pipe(plumber()) // Checks for errors
      .pipe(uglify()) // Minifies the js
      .pipe(rename({ suffix: '.min' }))
      .pipe(dest(paths.js))
}

function fontAwesomeScripts() {
  return src(paths.fontAwesome.js, {allowEmpty: true})
      .pipe(concat('fontAwesome.js'))
      .pipe(dest(paths.vendors.js))
      .pipe(plumber()) // Checks for errors
      .pipe(uglify()) // Minifies the js
      .pipe(rename({ suffix: '.min' }))
      .pipe(dest(paths.vendors.js))
}

function fontAwesomeSprites() {
  return src(paths.fontAwesome.sprites, {allowEmpty: true})
      .pipe(dest(paths.vendors.sprites));
}

function fontAwesomeSvgs() {
  return src(paths.fontAwesome.svgs, {allowEmpty: true})
      .pipe( dest(paths.vendors.svgs) );

}

function fontAwesomeWebfonts() {
  return src(paths.fontAwesome.webfonts, {allowEmpty: true})
      .pipe( dest(paths.vendors.webfonts) );

}

// Run django server
function runServer(cb) {
  var cmd = spawn('python', ['manage.py', 'runserver_plus'], {stdio: 'inherit'});
  cmd.on('close', function(code) {
    console.log('runServer exited with code ' + code);
    cb(code)
  })
}

// Browser sync server for live reload
function initBrowserSync() {
  browserSync.init(
      [
        `${paths.css}/*.css`,
        `${paths.js}/*.js`,
        `${paths.templates}/*.html`
      ], {
        // https://www.browsersync.io/docs/options/#option-proxy
        proxy:  {
          target: 'django:8000',
          proxyReq: [
            function(proxyReq, req) {
              // Assign proxy "host" header same as current request at Browsersync server
              proxyReq.setHeader('Host', req.headers.host)
            }
          ]
        },
        // https://www.browsersync.io/docs/options/#option-open
        // Disable as it doesn't work from inside a container
        open: false
      }
  )
}

// Watch
function watchPaths() {
  watch(`${paths.sass}/*.scss`, styles);
  watch(`${paths.templates}/**/*.html`).on("change", reload);
  watch([`${paths.js}/*.js`, `!${paths.js}/*.min.js`], scripts).on("change", reload)
}

// Generate all assets
const generateAssets = parallel(
    styles,
    scripts,
    vendorScripts,
    fontAwesomeStyles,
    fontAwesomeScripts,
    fontAwesomeWebfonts,
    fontAwesomeSvgs,
    fontAwesomeSprites,
    // bootstrapSass,
    // imgCompression,

);

// Set up dev environment
const dev = parallel(
    initBrowserSync,
    watchPaths
);

exports.default = series(generateAssets, dev);
exports["generate-assets"] = generateAssets;
exports["dev"] = dev;
