/** @format */

const fastify = require("fastify")();
const fs = require("fs");
const path = require("path");
const db = require("./sqlite.js");

const errorMessage = "Whoops! Error connecting to the database - please try again!";

fastify.register(require("@fastify/formbody"));

// Setup static files
fastify.register(require("@fastify/static"), {
    root: path.join(__dirname, "public"),
    prefix: "/",
});

// View is a templating manager for fastify
fastify.register(require("@fastify/view"), {
    engine: {
        handlebars: require("handlebars"),
    },
});

fastify.get("/", async (request, reply) => {
    const scores = await db.getScores();

    if (!scores) return reply.status(400);

    return reply.status(200).view("public/index.hbs", { scores: scores });
});

fastify.post("/newScore", async (request, reply) => {
    const body = request.body;
    if (!body.user || !body.score) return reply.status(400);

    let success = await db.addScore(body.user, body.score);

    if (success == false) return reply.status(400);
    return reply.status(200);

    // return reply.status(200).view("public/index.hbs", { scores: scores });
});

// Run the server and report out to the logs
fastify.listen({ port: process.env.PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
});
