module.exports = function(grunt) {
    var path = require('path'),
        tasks = {};

    // Project configuration.
    grunt.initConfig({
        uglify: {
            dynamic_mappings: {
                files: grunt.file.expandMapping(['**/src/*.js', '!**/node_modules/**'], '', {
                    cwd: process.env.PWD,
                    rename: function(destBase, destPath) {
                        destPath = destPath.replace('src', 'build');
                        destPath = destPath.replace('.js', '.min.js');
                        destPath = path.resolve(process.env.PWD, destPath);
                        return destPath;
                    }
                }),

            }
        }
    });

    tasks.shifter = function() {
       var  exec = require('child_process').spawn,
            done = this.async(),
            args = [],
            options = {
                recursive: true,
                watch: false,
                walk: false,
                module: false
            },
            shifter;

            // Determine the most appropriate options to run with based upon the current location.
            if (path.basename(process.env.PWD) === 'src') {
                // Detect whether we're in a src directory.
                grunt.log.debug('In a src directory');
                args.push('--walk');
                options.walk = true;
            } else if (path.basename(path.dirname(process.env.PWD)) === 'src') {
                // Detect whether we're in a module directory.
                grunt.log.debug('In a module directory');
                options.module = true;
            }

            if (grunt.option('watch')) {
                if (!options.walk && !options.module) {
                    grunt.fail.fatal('Unable to watch unless in a src or module directory');
                }

                // It is not advisable to run with recursivity and watch - this
                // leads to building the build directory in a race-like fashion.
                grunt.log.debug('Detected a watch - disabling recursivity');
                options.recursive = false;
                args.push('--watch');
            }
            
            if (options.recursive) {
                args.push('--recursive');
            }

            // Always ignore the node_modules directory.
            args.push('--excludes', 'node_modules');

            // Add the stderr option if appropriate
            if (grunt.option('verbose')) {
                args.push('--lint-stderr');
            }
            
            // Actually run shifter.
            shifter = exec(process.cwd() + '/node_modules/.bin/shifter', args, {
                cwd: process.env.PWD,
                stdio: 'inherit',
                env: process.env
            });
            
            // Tidy up after exec.
            shifter.on('exit', function (code) {
                if (code) {
                    grunt.fail.fatal('Shifter failed with code: ' + code);
                } else {
                    grunt.log.ok('Shifter build complete.');
                    done();
                }
            });
    };

    tasks.startup = function() {
        // Are we in a YUI directory?
        if (path.basename(path.resolve(process.env.PWD, '../../')) == 'yui') {
            grunt.task.run('shifter');
        // Are we in an AMD directory?
        } else if (path.basename(process.env.PWD) == 'amd') {
            grunt.task.run('uglify');
        } else {
            grunt.fail.fatal("not in an amd or yui directory");
        }
    };

    // Register the uglify task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Register the shifter task.
    grunt.registerTask('shifter', 'Run Shifter against the current directory', tasks.shifter);
    
    // Register the startup task.
    grunt.registerTask('startup', 'Run the startup task', tasks.startup);

    // Register the default task.
    grunt.registerTask('default', ['startup']);
};
