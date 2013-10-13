/* jshint node: true */

module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

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
            src: {
                files: [ 'test/index.html' ]
            },
            dist: {
                files: [ 'test/index.min.html' ]
            }
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

    grunt.registerTask('test', [ 'jshint', 'qunit:src' ]);
    grunt.registerTask('build', [ 'test:src', 'clean', 'concat', 'uglify', 'recess', 'test:dist' ]);
};
