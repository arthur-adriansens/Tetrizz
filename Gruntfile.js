/** @format */

module.exports = function (grunt) {
    // Load the plugins
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-text-replace");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-rename");

    // Project configuration.
    grunt.initConfig({
        clean: {
            public: ["public/*"],
        },
        concat: {
            options: {
                separator: ";",
            },
            target: {
                src: ["src/js/setup.js", "src/js/game.js", "src/js/piece.js"],
                dest: "public/tetris.js",
            },
        },
        copy: {
            assets: {
                expand: true,
                cwd: "src/assets/",
                src: "**",
                dest: "public/",
            },
            css: {
                expand: true,
                cwd: "src/",
                src: "style.css",
                dest: "public/",
            },
            html: {
                expand: true,
                cwd: "src/",
                src: "index.html",
                dest: "public/",
            },
            adminError_page: {
                expand: true,
                cwd: "src/",
                src: "admin_error.html",
                dest: "public/",
            },
            css_dark_mode: {
                expand: true,
                cwd: "src/",
                src: "style-dark.css",
                dest: "public/",
            },
            css_phone_mode: {
                expand: true,
                cwd: "src/",
                src: "style-touchScreen.css",
                dest: "public/",
            },
            // alpina: {
            //     expand: true,
            //     cwd: "src/js/",
            //     src: "alpina.js",
            //     dest: "public/",
            // },
        },
        rename: {
            main: {
                files: [
                    {
                        src: ["public/index.html"],
                        dest: "public/index.hbs",
                    },
                ],
            },
        },
        replace: {
            dist: {
                src: ["public/tetris.js"],
                overwrite: true,
                replacements: [
                    {
                        from: "./assets/",
                        to: "",
                    },
                ],
            },
            index: {
                src: ["public/index.hbs"],
                overwrite: true,
                replacements: [
                    {
                        from: "./assets/",
                        to: "",
                    },
                    {
                        from: '<script src="js/setup.js"></script>',
                        to: '<script src="tetris.js"></script>',
                    },
                    {
                        from: '<script src="js/setup.js"></script>',
                        to: '<script src="tetris.js"></script>',
                    },
                    {
                        from: '<script src="js/game.js"></script>',
                        to: "",
                    },
                    {
                        from: '<script src="js/piece.js"></script>',
                        to: "",
                    },
                    // {
                    //     from: '<div class="scores"></div>',
                    //     to: `<div class="scores"><ol>{{#if scores}}{{#each scores}}<li><b>{{this.username}}</b>: {{this.highscore}}</li>{{/each}}{{else}}<li style="list-style: none;"><i>It seems like you're first!</i></li>{{/if}}</ol></div>`,
                    // },
                    {
                        from: '<ol class="allTimeScores"></ol>',
                        to: '<ol class="allTimeScores">{{#if scores}}{{#each scores}}<li><b>{{this.username}}</b>: {{this.highscore}}</li>{{/each}}{{else}}<li style="list-style: none;"><i>It seems like you are first!</i></li>{{/if}}</ol>',
                    },
                    {
                        from: '<ol class="weeklyScores"></ol>',
                        to: '<ol class="weeklyScores">{{#if weekly_scores}}{{#each weekly_scores}}<li><b>{{this.username}}</b>: {{this.highscore}}</li>{{/each}}{{else}}<li style="list-style: none;"><i>It seems like you are first this week!</i></li>{{/if}}</ol>',
                    },
                ],
            },
        },
    });

    // Default task(s).
    grunt.registerTask("default", ["clean", "concat", "copy", "rename", "replace"]);
};
