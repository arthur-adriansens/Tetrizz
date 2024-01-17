/** @format */

const path = require("path");
const db = require("./sqlite.js");
const axios = require("axios");

const fastify = require("fastify")();
fastify
    .register(require("@fastify/formbody"))
    .register(require("@fastify/static"), {
        root: path.join(__dirname, "public"),
        prefix: "/",
    })
    .register(require("@fastify/view"), {
        engine: {
            handlebars: require("handlebars"),
        },
    })
    .register(require("@fastify/cookie"), {
        secret: process.env.ADMIN_KEY,
    });

class Server {
    constructor() {
        fastify.get("/", this.get_homepage);
        fastify.post("/newScore", this.post_score);
        fastify.get("/admin", this.get_adminpage);
        fastify.post("/admin", this.post_admin);

        this.start_server();
    }

    async get_homepage(request, reply) {
        const scores = await db.getScores();
        const views = await db.addView();
        return reply.status(scores ? 200 : 400).view("public/index.hbs", { scores: scores[0], weekly_scores: scores[1], views: views });
    }

    async post_score(request, reply) {
        const body = request.body;
        if (!body.user || !body.score) return reply.status(400);

        let success = await db.addScore(body.user, body.score, request.headers["x-forwarded-for"]);

        if (success == false) return reply.status(400);
        //TODO:::
        reply.setCookie("username", body.user, { path: "/" });
        return reply.status(200);
    }

    async get_adminpage(request, reply) {
        const key = request.cookies.key;
        // console.log(key)
        // reply.setCookie('key', process.env.ADMIN_KEY, { path: '/' });

        if (key == process.env.ADMIN_KEY) {
            const scores = await db.getScores(undefined, true);
            return reply.status(200).view("src/admin.hbs", { scores: scores });
        }

        return reply.status(403).view("public/admin_error.html");
    }

    async post_admin(request, reply) {
        if (request.cookies.key != process.env.ADMIN_KEY) return reply.status(403).view("public/admin_error.html");

        if ("remove" in request.query && request.body.user) {
            let success = await db.removeUser(request.body.user);
            return reply.status(success ? 200 : 400).send({ reload: true });
        }

        if ("addUser" in request.query) {
            const { username, score } = request.body;
            let success = await db.addScore(username, score);
            return reply.status(success ? 200 : 400).send("hi");
        }
    }

    start_server() {
        fastify.listen({ port: process.env.PORT, host: "0.0.0.0" }, (err, address) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.log(`Your app is listening on ${address}`);
        });
    }
}

new Server();
