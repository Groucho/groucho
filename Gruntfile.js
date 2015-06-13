'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('groucho.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n\n',
    // Task configuration.
    clean: {
      files: ['dist']
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true,
        sourceMap :true
      },
      dist: {
        src: ['src/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
    },
    connect: {
      server: {
        options: {
          port: 8085
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        mangle: true,
        sourceMap: 'dist/<%= pkg.name %>.map',
        //sourceMapIncludeSources: true,
        //sourceMapIn: 'dist/<%= pkg.name %>.map',
        compress: true
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      options: {
        '--web-security': 'no',
        coverage: {
          disposeCollector: true,
          baseUrl: 'http://localhost:<%= connect.server.options.port %>/',
          src: ['src/*.js'],
          instrumentedFiles: '.temp/',
          lcovReport: 'report/',
          linesThresholdPct: 85,
          statementsThresholdPct: 85,
          functionsThresholdPct: 85,
          branchesThresholdPct: 80
        }
      },
      all: {
        options: {
          // @todo Extendable.
          urls: [
            'storage=false',
            '',
            'jquery=1.5.2&jstorage=0.4.12',
            'jquery=1.6.4&jstorage=0.4.12',
            'jquery=1.7.2&jstorage=0.4.12',
            'jquery=1.8.3&jstorage=0.4.12',
            'jquery=1.9.1&jstorage=0.4.12',
            'jquery=1.10.2&jstorage=0.4.12',
            'jquery=1.11.1&jstorage=0.4.12',
            'jquery=2.0.3&jstorage=0.4.12',
            'jquery=2.1.1&jstorage=0.4.12',
            'jquery=2.1.4&jstorage=0.4.12',
            'zepto=1.1.0&jstorage=0.4.12',
            'zepto=1.1.4&jstorage=0.4.12',
            'zepto=1.1.6&jstorage=0.4.12',
            'jquery=1.5.2&store.js=1.3.17',
            'jquery=1.6.4&store.js=1.3.17',
            'jquery=1.7.2&store.js=1.3.17',
            'jquery=1.8.3&store.js=1.3.17',
            'jquery=1.9.1&store.js=1.3.17',
            'jquery=1.10.2&store.js=1.3.17',
            'jquery=1.11.1&store.js=1.3.17',
            'jquery=2.0.3&store.js=1.3.17',
            'jquery=2.1.1&store.js=1.3.17',
            'jquery=2.1.4&store.js=1.3.17',
            'zepto=1.1.0&store.js=1.3.17',
            'zepto=1.1.4&store.js=1.3.17',
            'zepto=1.1.6&store.js=1.3.17',
            'jquery=1.5.2&simplestorage=0.1.3',
            'jquery=1.6.4&simplestorage=0.1.3',
            'jquery=1.7.2&simplestorage=0.1.3',
            'jquery=1.8.3&simplestorage=0.1.3',
            'jquery=1.9.1&simplestorage=0.1.3',
            'jquery=1.10.2&simplestorage=0.1.3',
            'jquery=1.11.1&simplestorage=0.1.3',
            'jquery=2.0.3&simplestorage=0.1.3',
            'jquery=2.1.1&simplestorage=0.1.3',
            'jquery=2.1.4&simplestorage=0.1.3',
            'zepto=1.1.0&simplestorage=0.1.3',
            'zepto=1.1.4&simplestorage=0.1.3',
            'zepto=1.1.6&simplestorage=0.1.3',
            // 'jquery=1.5.2&lawnchair=0.6.4',
            // 'jquery=1.6.4&lawnchair=0.6.4',
            // 'jquery=1.7.2&lawnchair=0.6.4',
            // 'jquery=1.8.3&lawnchair=0.6.4',
            // 'jquery=1.9.1&lawnchair=0.6.4',
            // 'jquery=1.10.2&lawnchair=0.6.4',
            // 'jquery=1.11.1&lawnchair=0.6.4',
            // 'jquery=2.0.3&lawnchair=0.6.4',
            // 'jquery=2.1.1&lawnchair=0.6.4',
            // 'jquery=2.1.4&lawnchair=0.6.4',
            // 'zepto=1.1.0&lawnchair=0.6.4',
            // 'zepto=1.1.4&lawnchair=0.6.4',
            // 'zepto=1.1.6&lawnchair=0.6.4',
            //'sizzle=2.2.0',
            //'sizzle=2.0.0',
            //'sizzle=1.11.1',
            //'sizzle=1.9.3',
            //'sizzle=1.7.2',
            ].map(function(version) {
              return 'test/groucho.html?' + version;
          })
        }
      }
    },
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      src: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        src: ['src/*.js']
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/*.js']
      },
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.src.src %>',
        tasks: ['jshint:src', 'qunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'qunit']
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-qunit-istanbul');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task.
  grunt.registerTask('default', ['connect', 'jshint', 'qunit', 'clean', 'concat', 'uglify']);

  // Test task.
  grunt.registerTask('test', ['connect', 'jshint', 'qunit']);

};
