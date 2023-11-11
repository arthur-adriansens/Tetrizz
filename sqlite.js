/** @format */

const fs = require("fs");
const dbFile = "./.data/chat.db";
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;

dbWrapper
    .open({
        filename: dbFile,
        driver: sqlite3.Database,
    })
    .then(async (dBase) => {
        db = dBase;

        try {
            let exists = await db.all("PRAGMA table_info('Scores')");
            exists = exists.length > 0;

            if (!exists) {
                await db.run("CREATE TABLE Scores (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, highscore INTEGER);");
            }

            console.log(await db.all("SELECT * from Scores ORDER BY highscore DESC;"));
        } catch (err) {
            console.error(err);
        }
    });

module.exports = {
    // Get the scores in the database
    getScores: async () => {
        try {
            return await db.all("SELECT * from Scores ORDER BY highscore DESC;");
        } catch (err) {
            console.error(err);
        }
    },

    // Add new score (PUT)
    addScore: async (user, newScore) => {
        let success = false;

        try {
            const scores = await module.exports.getScores();

            // check for previous records + check if bigger
            for (let score of scores) {
                if (score.username == user && score.highscore >= newScore) {
                    return success;
                }

                if (score.username == user) {
                    await db.run("DELETE FROM Scores WHERE id = ?", [score.id]);
                    break;
                }
            }

            // add the score
            let last_score = scores[scores.length - 1].highscore;

            if (newScore <= last_score && scores.length >= 20) return success;

            if (scores.length >= 20) {
                console.log("removing...");
                await db.run("DELETE FROM Scores WHERE highscore = (SELECT MIN(highscore) FROM Scores)");
            }

            success = await db.run("INSERT INTO Scores (username, highscore) VALUES (?, ?);", [user, newScore]);
        } catch (err) {
            console.error(err);
        }

        return success.changes > 0;
    },
    removeUser: async (user) => {
        let success = false;

        try {
            success = await db.run("DELETE FROM Scores WHERE username = ?;", [user]);
            return success.changes > 0;
        } catch (err) {
            console.error(err);
        }
    },
};
