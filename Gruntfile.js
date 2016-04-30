/* jshint node: true */

var semver = require('semver'),
    format = require('util').format;

module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        version: grunt.file.readJSON('package.json').version,

        banner: [
            ' /* ----------------------------------------------------------------------------',
            ' // <%= pkg.title || pkg.name %>',
            ' // v<%= pkg.version %> - released <%= grunt.template.today("yyyy-mm-dd HH:MM") %>',
            ' // Licensed under the MIT license.',
            ' // <%= pkg.homepage %>',
            ' // ----------------------------------------------------------------------------',
            ' // Copyright (C) <%= grunt.template.today("yyyy") %> Jay Salvat',
            ' // http://jaysalvat.com/',
            ' // ---------------------------------------------------------------------------*/',
            '\n'
        ].join('\n'),

        clean: {
          dist: ['dist'],
          tmp: ['tmp']
        },

        sed: {
            version: {
                pattern: '%VERSION%',
                replacement: '<%= version %>',
                path: [ 'dist/*' ]
            },
            copyright: {
                pattern: /\(c\) \d{4} /,
                replacement: '(c) <%= grunt.template.today("yyyy") %> ',
                path: [ 'README.md', 'MIT-LICENSE' ]
            }
        },

        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            js: {
                src: [ 'src/jquery.ezdz.js' ],
                dest: 'dist/jquery.ezdz.js'
            },
            css: {
                src: [ 'src/jquery.ezdz.css' ],
                dest: 'dist/jquery.ezdz.css'
            }
        },

        jshint: {
            files: [
                'Gruntfile.js',
                'src/*.js',
                'test/*.js'
            ]
        },

        uglify: {
            min: {
                options: {
                    banner: '<%= banner %>',
                    report: 'min',
                    mangle: true,
                    compress: true
                },
                src: 'src/jquery.ezdz.js',
                dest: 'dist/jquery.ezdz.min.js'
            }
        },

        qunit: {
            src: [ 'test/index.html' ],
            dist: [ 'test/index.min.html' ]
        },

        recess: {
            min: {
                options: {
                    compress: true,
                    compile: true,
                    banner: '<%= banner %>'
                },
                src: [ 'src/jquery.ezdz.css' ],
                dest: 'dist/jquery.ezdz.min.css'
            }
        },

        compress: {
            main: {
                options: {
                    archive: 'tmp/jquery.ezdz.zip'
                },
                files: [
                    { flatten: true, expand: true, src: [ 'dist/*' ], dest: 'tmp/' }
                ]
            }
        },

        copy: {
            main: {
                files: [
                    { flatten: true, expand: true, src: [ 'dist/*' ], dest: 'tmp/' }
                ]
            }
        },

        exec: {
            gitIsClean: {
                cmd: 'test -z "$(git status --porcelain)"'
            },
            gitIsOnMaster: {
                cmd: 'test $(git symbolic-ref -q HEAD) = refs/heads/master'
            },
            gitAdd: {
                cmd: 'git add .'
            },
            gitCommit: {
                cmd: function(message) {
                    return format('git commit -m "Build v%s"', message);
                }
            },
            gitTag: {
                cmd: function(version) {
                    return format('git tag v%s -am "%s"', version, version);
                }
            },
            gitPush: {
                cmd: [
                    'git push origin master',
                    'git push origin master --tags'
                ].join(' && ')
            },
            publish: {
                cmd: [
                    'git checkout gh-pages',
                    'mkdir -p releases',
                    'rm -rf releases/latest',
                    'cp -r tmp releases/<%= version %>',
                    'cp -r tmp releases/latest',
                    'git add releases/<%= version %> releases/latest',
                    'git commit -m "Add assets for v<%= version %>."',
                    'git push origin gh-pages',
                    'git checkout -',
                    'rm -rf tmp/'
                ].join(' && ')
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-sed');
    grunt.loadNpmTasks('grunt-recess');

    grunt.registerTask('default', 'Default task', [ 'qunit:src', 'build' ]);
    grunt.registerTask('test', 'Run tests.', [ 'jshint', 'qunit:src' ]);
    grunt.registerTask('build', 'Build.', [ 'clean:dist', 'concat', 'uglify', 'recess', 'qunit:dist' ]);
    grunt.registerTask('tmp', 'Build tmp folder.', [ 'clean:tmp', 'copy', 'compress', 'metadata' ]);

    /**
     * Publish and release a new version
     * @param  {string} version semver version number
     * @param  {bool}   force   force the bump even if the version is lower
     */
    grunt.registerTask('release', 'Release.', function(version, force) {
        var currentVersion = grunt.config.get('version');

        version = semver.inc(currentVersion, version) || version;

        if (!semver.valid(version) || (!force && semver.lte(version, currentVersion))) {
            grunt.fatal('Invalid version dummy.');
        }

        grunt.config.set('version', version);

        grunt.task.run([
            'exec:gitIsOnMaster',           // Check if it is on Master
            'exec:gitIsClean',              // Check if everything has been committed
        //  'test',                         // Run test
            'manifests:' + version,         // Update manifests
            'build',                        // Build the disttib
            'exec:gitAdd',                  // Git add it
            'exec:gitCommit:' + version,    // Git commit it
            'exec:gitTag:' + version,       // Git add a new tag
            'exec:gitPush',                 // Git push it to Github
            'publish'                       // Publish assets
        ]);
    });

    /**
     * Publish the assets
     */
    grunt.registerTask('publish', 'Publish file.', function() {
        grunt.task.run([
            'tmp',           // Build the tmp folder from dist
            'exec:publish',  // Publish assets
            'clean:tmp'      // Remove the tmp folder
        ]);
    });

    /**
     * Create a metadata json file
     * @param  {string} version numeric version
     */
    grunt.registerTask('metadata', 'Create metadata file.', function(version) {
        version = version || grunt.config.get('version');

        var metadata = {
            'date': grunt.template.today("yyyy-mm-dd HH:MM:ss"),
            'version': version
        };

        grunt.file.write('tmp/metadata.json', JSON.stringify(metadata, null, 4));
    });

    /**
     * Bump manifests and build
     * @param  {string} version semver version number
     * @param  {bool}   force   force the bump even if the version is lower
     */
    grunt.registerTask('bump', 'Bump version.', function(version, force) {
        var currentVersion = grunt.config.get('version');

        version = semver.inc(currentVersion, version) || version;

        if (!semver.valid(version) || (!force && semver.lte(version, currentVersion))) {
            grunt.fatal('Invalid version dummy.');
        }

        grunt.config.set('version', version);

        grunt.task.run([
            'manifests:' + version,
            'build'
        ]);
    });

    /**
     * Update manifests
     * @param  {string} version semver version number
     */
    grunt.registerTask('manifests', 'Update manifests.', function(version) {
        var _     = grunt.util._,
            pkg   = grunt.file.readJSON('package.json'),
            bower = grunt.file.readJSON('bower.json'),
            jqry  = grunt.file.readJSON('ezdz.jquery.json');

        bower = JSON.stringify(_.extend(bower, {
            version: version
        }), null, 4);

        jqry = JSON.stringify(_.extend(jqry, {
            version: version,
            description: pkg.description
        }), null, 4);

        pkg = JSON.stringify(_.extend(pkg, {
            version: version
        }), null, 4);

        grunt.config.data.pkg = JSON.parse(pkg);

        grunt.file.write('package.json', pkg);
        grunt.file.write('bower.json', bower);
        grunt.file.write('ezdz.jquery.json', jqry);

        grunt.task.run([
            'sed:copyright'
        ]);
    });
};
