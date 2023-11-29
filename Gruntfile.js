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
                        from: /<script src="\.[\/\\]js[\/\\]setup\.js"><\/script>\n\s+<script src="\.[\/\\]js[\/\\]tetris\.js"><\/script>\n\s+<script src="\.[\/\\]js[\/\\]pieces\.js"><\/script>/g,
                        to: '<script src="tetris.js"></script>',
                    },
                    {
                        from: '<div class="scores"></div>',
                        to: `<div class="scores"><ol>{{#if scores}}{{#each scores}}<li><b>{{this.username}}</b>: {{this.highscore}}</li>{{/each}}{{else}}<li style="list-style: none;"><i>It seems like you're first!</i></li>{{/if}}</ol></div>`,
                    },
                ],
            },
        },
    });

    // Default task(s).
    grunt.registerTask("default", ["clean", "concat", "copy", "rename", "replace"]);
};
