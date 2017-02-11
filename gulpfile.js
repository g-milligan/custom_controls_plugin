var minifyCode=false;

var gulp = require('gulp');
var fs = require('fs');
var concat = require('gulp-concat'); //npm install gulp gulp-concat --save-dev
var sass = require('gulp-sass'); //npm install gulp gulp-sass --save-dev
var uglify = require('gulp-uglify'); //npm install gulp gulp-uglify --save-dev
var browserSync = require('browser-sync'); //npm install gulp browser-sync --save-dev
var nodemon = require('gulp-nodemon'); //npm install gulp gulp-nodemon --save-dev

var cssOutput='./dist/css/';
var allSassDirs=['./css/*.scss','./css/**/*.scss','./css/**/**/*.scss','./css/**/**/**/*.scss'];
var allJsDirs=['./js/*.js','./js/**/*.js','./js/**/**/*.js','./js/**/**/**/*.js'];

var jsFiles={
  './dist/js/codemirror.js':[
    './js/vendor/codemirror/codemirror.js',
    './js/vendor/codemirror/mode/clike.js',
    './js/vendor/codemirror/mode/css.js',
    './js/vendor/codemirror/mode/htmlmixed.js',
    './js/vendor/codemirror/mode/javascript.js',
    './js/vendor/codemirror/mode/xml.js'
  ],
  './dist/js/jquery.min.js':[
    './js/vendor/jquery.min.js'
  ],
  './dist/js/scripts.js':[
    './codegen/template/webgl/js/page-title.js',
    './codegen/template/webgl/js/buffers.js',
    './codegen/template/webgl/js/canvas.js',
    './codegen/template/webgl/js/draw.js',
    './codegen/template/webgl/js/enable-attributes.js',
    './codegen/template/webgl/js/field-pointers.js',
    './codegen/template/webgl/js/init-js.js',
    './codegen/template/webgl/js/init-programs.js',
    './codegen/template/webgl/js/shaders.js',
    './js/app/plugins/customControls.js',
    './js/app/plugins/codeGen.js'
  ]
};

gulp.task('index', function() {
  return gulp.src('./index.html')
  .pipe(gulp.dest('./dist'));
});

gulp.task('scripts', function() {
  var ret=[];
  for(var j in jsFiles){
    if(jsFiles.hasOwnProperty(j)){
      var fileArr=jsFiles[j];
      var concatName=j;
      var concatPath=j;
      if(concatName.lastIndexOf('/')!==-1){
        concatName=concatName.substring(concatName.lastIndexOf('/')+'/'.length);
        concatPath=j.substring(0, j.lastIndexOf('/')+'/'.length);
      }
      var g=gulp.src(fileArr).pipe(concat(concatName));
      if(minifyCode){g=g.pipe(uglify());}
      ret.push(g.pipe(gulp.dest(concatPath)));
    }
  }
  return ret;
});

gulp.task('styles', function() {
  var sassStyle='expanded', sassComments=true;
  if(minifyCode){
    sassStyle='compressed'; sassComments=false;
  }
  return gulp.src(allSassDirs)
    .pipe(
      sass({outputStyle:sassStyle,sourceComments:sassComments})
      .on('error', sass.logError)
    )
    .pipe(gulp.dest(cssOutput));
});

//server task
gulp.task('watch', function() {
  //watch files for changes
  gulp.watch('./index.html', ['index']);
  for(var j=0;j<allJsDirs.length;j++){
    gulp.watch(allJsDirs[j], ['scripts']);
  }
  for(var s=0;s<allSassDirs.length;s++){
    gulp.watch(allSassDirs[s], ['styles']);
  }
});

gulp.task('demon', function () {
  setTimeout(function(){
    var ext='';
    for(var j=0;j<allJsDirs.length;j++){
      if(ext.length>0){ ext+=' '; }
      ext+=allJsDirs[j];
    }
    for(var s=0;s<allSassDirs.length;s++){
      if(ext.length>0){ ext+=' '; }
      ext+=allSassDirs[s];
    }
    console.log(ext);
    nodemon({
      script: 'server.js',
      ext: ext,
      env: {
        'NODE_ENV': 'development'
      }
    })
    .on('start', ['watch'])
    .on('change', ['watch'])
    .on('restart', function () {
      console.log('restarted!');
    });
  },700);
});

gulp.task('default', ['index','scripts','styles','demon']);
