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

            // console.log(await module.exports.getScores());
        } catch (error) {
            console.error(error);
        }
    });

module.exports = {
    // Get scores from the database
    getScores: async (user, admin = false) => {
        try {
            if (admin) {
                return await db.all("SELECT * from Scores ORDER BY highscore DESC;");
            }

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

            // add user
            if (!userInfo.length) {
                success = await db.run("INSERT INTO Scores (username, highscore) VALUES (?, ?);", [user, newScore]);
                return success.changes > 0;
            }

            // update the score
            if (userInfo[0].highscore >= newScore) return success;

            success = await db.run("UPDATE Scores SET highscore = ? WHERE id = ?", [newScore, userInfo[0].id]);

            return success.changes > 0;
        } catch (err) {
            console.error(err);
        }
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
