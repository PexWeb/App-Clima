const {src, dest, watch} = require("gulp");
const sass = require("gulp-sass")(require("sass"));
function compilarSass(done){
    src('src/scss/app.scss')
        .pipe(sass())
            .pipe(dest('build/css/'));
    done();
}

function dev(done){
    watch('src/scss/**/*scss',compilarSass);
    done();
}

exports.dev = dev;