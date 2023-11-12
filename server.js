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
    });

class Server {
    constructor() {
        fastify.get("/", this.get_homepage);
        fastify.post("/newScore", this.post_score);

        this.start_server();
    }

    async get_homepage(request, reply) {
        const scores = await db.getScores();
        return reply.status(scores ? 200 : 400).view("public/index.hbs", { scores: scores });
    }

    async post_score(request, reply) {
        const body = request.body;
        if (!body.user || !body.score) return reply.status(400);

        let success = await db.addScore(body.user, body.score);

        if (success == false) return reply.status(400);
        return reply.status(200);
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
