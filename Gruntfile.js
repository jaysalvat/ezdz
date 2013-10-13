/* jshint node: true */

var semver = require('semver');

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
          dist: ['dist']
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
            options: {
                jshintrc: '.jshintrc'
            },
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
            all: [ 'test/index.html' ]
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-sed');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('semver');

    grunt.registerTask('test',  'Run tests.', [ 'jshint', 'qunit' ]);
    grunt.registerTask('build', 'Build.', [ 'test', 'clean', 'concat', 'uglify', 'recess' ]);

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
