/** @format */

const dbFile = "./.data/chat.db";
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db, daily_check;

// this function is ai-generated:
function getStartOfWeekAsString() {
    let now = new Date();
    let day = now.getDay();
    let diff = day === 0 ? -6 : 1; // adjust when day is Sunday
    let startOfWeek = new Date(now.setDate(now.getDate() - day + diff));
    startOfWeek.setHours(0, 0, 0, 0); // set time to 00:00:00
    let year = startOfWeek.getFullYear();
    let month = ("0" + (startOfWeek.getMonth() + 1)).slice(-2); // add leading zero if needed
    let date = ("0" + startOfWeek.getDate()).slice(-2); // add leading zero if needed
    let hours = ("0" + startOfWeek.getHours()).slice(-2); // add leading zero if needed
    let minutes = ("0" + startOfWeek.getMinutes()).slice(-2); // add leading zero if needed
    let seconds = ("0" + startOfWeek.getSeconds()).slice(-2); // add leading zero if needed
    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

async function remove_previous_week() {
    try {
        let date = new Date();
        let today = `${date.getDate()}-${date.getMonth()}/${date.getFullYear()}`;

        if (daily_check != today) {
            console.log(await db.run("DELETE FROM WeeklyScores WHERE week < datetime(?)", [getStartOfWeekAsString()]));
        }
    } catch (error) {
        console.log(error);
    }
}

dbWrapper
    .open({
        filename: dbFile,
        driver: sqlite3.Database,
    })
    .then(async (dBase) => {
        db = dBase;

        try {
            // check if scores table excists
            let exists = await db.all("PRAGMA table_info('Scores')");
            let exists2 = await db.all("PRAGMA table_info('WeeklyScores')");

            if (exists.length == 0) {
                await db.run("CREATE TABLE Scores (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, highscore INTEGER, ip VARCHAR(39));");
            }
            if (exists2.length == 0) {
                // const date = `${new Date().getDate()} ${new Date().getMonth()} ${new Date().getFullYear()}`;
                await db.run(
                    "CREATE TABLE WeeklyScores (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, highscore INTEGER, week TEXT DEFAULT (datetime('now')),ip VARCHAR(39));"
                );
            }

            // check if analytics table excists
            exists = await db.all("PRAGMA table_info('Analytics')");

            if (exists.length == 0) {
                await db.run("CREATE TABLE Analytics (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, value INTEGER);");
                await db.run("INSERT INTO Analytics (name, value) VALUES ('views', 0);");
            }

            // console.log(await module.exports.getScores());
            console.log(await db.all("SELECT * from Analytics;"));
            console.log(await db.all("SELECT week from WeeklyScores"));
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

            const scores_normal = await db.all("SELECT * from Scores ORDER BY highscore DESC LIMIT 10;");
            const scores_weekly = await db.all("SELECT * from WeeklyScores ORDER BY highscore DESC LIMIT 10;");

            return [scores_normal, scores_weekly];
        } catch (err) {
            console.error(err);
        }
    },

    // Post (add) a new score
    addScore: async (user, newScore, ip) => {
        let success = false;

        try {
            // check for previous records + check if bigger
            let userInfo = await module.exports.getScores(user);

            // add user
            if (!userInfo.length) {
                success = await db.run("INSERT INTO Scores (username, highscore, ip) VALUES (?, ?, ?);", [user, newScore, ip]);
                await db.run("INSERT INTO WeeklyScores (username, highscore, ip) VALUES (?, ?, ?);", [user, newScore, ip]);

                await remove_previous_week();
                return success.changes > 0;
            }

            // update the score
            if (!userInfo[0].ip) {
                await db.run("UPDATE Scores SET ip = ? WHERE id = ?", [ip, userInfo[0].id]);
                await db.run("UPDATE WeeklyScores SET ip = ? WHERE id = ?", [ip, userInfo[0].id]);
            }

            await db.run("UPDATE WeeklyScores SET highscore = ? WHERE id = ?", [newScore, userInfo[0].id]);

            if (userInfo[0].highscore >= newScore) return success;
            success = await db.run("UPDATE Scores SET highscore = ? WHERE id = ?", [newScore, userInfo[0].id]);

            // update weekly
            await remove_previous_week();

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
    addView: async () => {
        try {
            await db.run("UPDATE Analytics SET value = value + 1 WHERE name = 'views';");
        } catch (err) {
            console.error(err);
        }
    },
};
