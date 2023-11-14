/** @format */

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

            console.log(await module.exports.getScores());
        } catch (error) {
            console.error(error);
        }
    });

module.exports = {
    // Get scores from the database
    getScores: async (user) => {
        try {
            if (user) {
                return await db.all("SELECT * from Scores WHERE username = ?;", [user]);
            }

            return await db.all("SELECT * from Scores ORDER BY highscore DESC LIMIT 10;");
        } catch (err) {
            console.error(err);
        }
    },

    // Post (add) a new score
    addScore: async (user, newScore) => {
        let success = false;

        try {
            // check for previous records + check if bigger
            let userInfo = await module.exports.getScores(user);
            if (userInfo[0].highscore >= newScore) return success;

            // add the score
            success = await db.run("UPDATE Scores SET highscore = ? WHERE id = ?", [newScore, userInfo[0].id]);
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
