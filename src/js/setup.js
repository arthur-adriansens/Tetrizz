/** @format */

// global variables
const canvas = document.querySelector("canvas#game");
const nextBlockCanvas = document.querySelector("canvas#next_piece");
const storedBlockCanvas = document.querySelector("canvas#stored_piece");
const ctx = canvas.getContext("2d");
const nextBlockCtx = nextBlockCanvas.getContext("2d");
const storedBlockCtx = storedBlockCanvas.getContext("2d");
const cols = 10;
const rows = 16;
const scoresHTML = document.querySelector("#personal_scores");
const effectsIcon = document.querySelector("#effects");
const trackIcon = document.querySelector("#track");
const speedIcon = document.querySelector("#speedIcon");
const usernameHTML = document.querySelector("#username");
const throphy_logo = document.querySelector(".throphy");
const phoneIcon = document.querySelector("#phoneIcon");

const soundtrack = new Audio("./assets/music/Tetrizz Soundtrack.mp3");
const clearSound = new Audio("./assets/music/clear.mp3");
const endSound = new Audio("./assets/music/success.wav");
const rotateSound = new Audio("./assets/music/rotate.mp3");
const dropSound = new Audio("./assets/music/drop.mp3");
const soundOptions = [soundtrack, endSound, clearSound, rotateSound, dropSound];

const speedIcons = [
    "M20,4.052A12,12,0,0,0,3.612,21.572,4.993,4.993,0,0,0,7.12,23h9.767a4.84,4.84,0,0,0,3.354-1.288A12.053,12.053,0,0,0,20,4.052ZM18.868,20.259A2.862,2.862,0,0,1,16.887,21H7.12a3,3,0,0,1-2.11-.858,10,10,0,1,1,13.858.117ZM20,13a7.932,7.932,0,0,1-2.408,5.715,1,1,0,0,1-1.4-1.43c4.141-3.956.6-11.095-5.05-10.223a1,1,0,0,1-.286-1.981A8.026,8.026,0,0,1,20,13ZM7.806,17.284a1,1,0,0,1-1.4,1.432,7.973,7.973,0,0,1-2.327-6.859,1,1,0,0,1,1.981.286A5.966,5.966,0,0,0,7.806,17.284ZM14,13a2,2,0,1,1-3.932-.518L6.293,8.707A1,1,0,0,1,7.707,7.293l3.775,3.775A2.008,2.008,0,0,1,14,13Z",
    "M20,4.052A12,12,0,0,0,3.612,21.571,4.988,4.988,0,0,0,7.12,23h9.767a4.84,4.84,0,0,0,3.354-1.288A12.054,12.054,0,0,0,20,4.052ZM18.868,20.259A2.862,2.862,0,0,1,16.887,21H7.12a3.005,3.005,0,0,1-2.11-.858,10,10,0,1,1,13.858.117ZM8.82,6.683a1,1,0,0,1-.248,1.392,6.031,6.031,0,0,0-.766,9.21,1,1,0,1,1-1.4,1.43A8.042,8.042,0,0,1,7.427,6.435,1,1,0,0,1,8.82,6.683ZM20,13a7.932,7.932,0,0,1-2.408,5.715,1,1,0,0,1-1.4-1.43,6.031,6.031,0,0,0-.765-9.21,1,1,0,1,1,1.144-1.64A8.008,8.008,0,0,1,20,13Zm-6,0a2,2,0,1,1-3-1.732V6a1,1,0,0,1,2,0v5.268A2,2,0,0,1,14,13Z",
    "M20,4.052A12,12,0,0,0,3.612,21.572,4.993,4.993,0,0,0,7.12,23h9.767a4.84,4.84,0,0,0,3.354-1.288A12.053,12.053,0,0,0,20,4.052ZM18.868,20.259A2.862,2.862,0,0,1,16.887,21H7.12a3,3,0,0,1-2.11-.858,10,10,0,1,1,13.858.117Zm.2-7.269a1,1,0,0,1-1.132-.848A6.022,6.022,0,0,0,12,7c-5.268-.1-8.04,6.686-4.193,10.285a1,1,0,0,1-1.4,1.43C1.287,13.848,4.939,4.915,12,5a8.035,8.035,0,0,1,7.919,6.858A1,1,0,0,1,19.07,12.99Zm.3,3.244a1,1,0,0,1-1.318.514l-4.867-2.136a2,2,0,1,1,.8-1.832l4.867,2.136A1,1,0,0,1,19.369,16.234Z",
    "M23.9,11.437A12,12,0,0,0,4,4.052a12.055,12.055,0,0,0-.246,17.66A4.847,4.847,0,0,0,7.114,23H16.88a4.988,4.988,0,0,0,3.508-1.429A11.942,11.942,0,0,0,23.9,11.437ZM18.99,20.142A3.005,3.005,0,0,1,16.88,21H7.114a2.863,2.863,0,0,1-1.982-.741A10.045,10.045,0,0,1,5.337,5.543a10,10,0,0,1,13.653,14.6ZM20,13a7.927,7.927,0,0,1-2.409,5.715,1,1,0,1,1-1.4-1.43C20.039,13.684,17.268,6.9,12,7a6.024,6.024,0,0,0-5.939,5.142,1,1,0,0,1-1.98-.284C5.766,2.13,19.73,3.113,20,13Zm-6,0a2.013,2.013,0,0,1-3.184,1.612L5.949,16.748a1,1,0,1,1-.8-1.832l4.867-2.136A2,2,0,0,1,14,13Z",
];

let colors = JSON.parse(window.localStorage.getItem("color")) || ["#84E3C8", "#A8E6CF", "#DCEDC1", "#FFD3B6", "#FFAAA5", "#FF8B94", "#FF7480"];
let board, game, piece, block_size, autoInterval, dropInterval, bgColor;
let speed = 40 - Number(speedIcon.dataset.state) * 10;
let auto_speed = 750;
let username = window.localStorage.getItem("username");
let startScreen = false;

// event listeners
throphy_logo.onload = () => {
    let block = Math.floor(Math.random() * (throphy_logo.children.length - 2)) + 1;
    throphy_logo.querySelector(`#block${block}`).style.visibility = "visible";
};

window.onload = () => {
    // load preferences in localstorage
    if (localStorage.getItem("sound_effects")) {
        let old_state = Number(effectsIcon.dataset.state);
        effectsIcon.dataset.state = localStorage.getItem("sound_effects");
        effectsIcon.src = effectsIcon.src.replace(`${old_state}.svg`, `${effectsIcon.dataset.state}.svg`);
        iconChangeVolume(effectsIcon);
    }

    if (localStorage.getItem("soundtrack")) {
        let old_state = Number(trackIcon.dataset.state);
        trackIcon.dataset.state = localStorage.getItem("soundtrack");
        trackIcon.src = trackIcon.src.replace(`${old_state}.svg`, `${trackIcon.dataset.state}.svg`);
    }

    if (localStorage.getItem("speed")) {
        let old_state = Number(speedIcon.dataset.state);
        speedIcon.dataset.state = localStorage.getItem("speed");
        speedIcon.src = speedIcon.src.replace(`${old_state}.svg`, `${speedIcon.dataset.state}.svg`);
        speed = 40 - Number(speedIcon.dataset.state) * 10;
    }

    if (localStorage.getItem("touch_screen")) {
        let old_state = Number(phoneIcon.dataset.state);
        phoneIcon.dataset.state = localStorage.getItem("touch_screen");
        phoneIcon.src = phoneIcon.src.replace(`${old_state}.svg`, `${phoneIcon.dataset.state}.svg`);

        if (phoneIcon.dataset.state == 1) {
            document.body.classList.add("touch_enabled");
        }
    }

    soundtrack.loop = true;
    soundtrack.volume = 0.5 * trackIcon.dataset.state;
    endSound.volume = 0.5 * trackIcon.dataset.state;
    bgColor = window.getComputedStyle(document.querySelector(".main_layout")).backgroundColor;

    change_dimensions();
    loadColorsPreview();
    local_scores();

    // set listeners
    window.addEventListener("resize", () => {
        change_dimensions(true);

        if (screen.availHeight > screen.availWidth) {
            document.body.classList.add("touch_enabled");
        } else {
            document.body.classList.remove("touch_enabled");
        }
    });

    let randomBgImage = Math.floor(Math.random() * bgLinks.length);
    storedBlockCanvas.style.backgroundImage = `url(assets/shoutout_${randomBgImage + 1}.png)`;

    storedBlockCanvas.onclick = () => {
        window.open(bgLinks[randomBgImage]);
    };

    document.addEventListener("visibilitychange", () => {
        if (!game) return;

        if (document.hidden) {
            game.togglePause(true);
        } else {
            game.togglePause(false);
        }
    });

    document.addEventListener("keydown", start_game);

    usernameHTML.addEventListener("input", () => {
        username = usernameHTML.value;
        window.localStorage.setItem("username", username);
    });

    document.querySelector("#reset").addEventListener("click", () => {
        local_scores(true);
    });

    document.querySelector("#optionsToggle").addEventListener("click", (e) => {
        let currentOpacity = document.documentElement.style.getPropertyValue("--settingsOpacity");
        document.documentElement.style.setProperty("--settingsOpacity", currentOpacity == 0 ? 1 : 0);
    });

    for (let element of document.querySelectorAll(".toggle")) {
        element.addEventListener("click", (e) => {
            if (element.id == "speedIcon") {
                toggleMusicIcon(e, false);
                let state = Number(speedIcon.dataset.state);
                localStorage.setItem("speed", state);
                speed = 40 - state * 10;
                return;
            }
            toggleMusicIcon(e);
        });
    }

    for (let element of document.querySelectorAll(".darktoggle")) {
        element.addEventListener("click", (e) => {
            document.body.classList.toggle("dark");

            localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
            bgColor = window.getComputedStyle(document.querySelector(".main_layout")).backgroundColor;
        });
    }

    const dropDownBtn = document.querySelector("#toggleDropDown");
    dropDownBtn.addEventListener("click", () => {
        dropDownBtn.parentElement.classList.toggle("toggled");
    });

    // touchscreen icons
    document.querySelectorAll("#touch_pause").forEach((x) => {
        x.onclick = () => {
            if (!game) {
                start_game();
                return;
            }
            game?.togglePause();
        };
    });

    document.querySelector("#touch_swap").onclick = () => {
        if (!game) {
            start_game();
            return;
        }
        game?.swap_block();
    };

    document.querySelector("#touch_rotate").onclick = () => {
        if (!game) {
            start_game();
            return;
        }
        piece?.rotate();
    };

    document.querySelector("#touch_drop").onclick = () => {
        if (!game) {
            start_game();
            return;
        }
        piece?.drop();
    };

    document.querySelector("#touch_left").onclick = () => {
        if (!game) {
            start_game();
            return;
        }
        piece?.move("x;-1");
    };

    document.querySelector("#touch_right").onclick = () => {
        if (!game) {
            start_game();
            return;
        }
        piece?.move("x;1");
    };

    document.querySelector("#touch_down").onpointerdown = () => {
        if (!game) {
            start_game();
            return;
        }
        keyDown();
    };

    document.querySelector(".editIcon").onclick = () => {
        usernameHTML.classList.toggle("hidden");
    };

    document.querySelector("#close_shoutout").onclick = () => {
        storedBlockCanvas.classList.remove("youtube_background");
        storedBlockCanvas.style.backgroundImage = null;
        document.querySelector("#close_shoutout").style.display = "none";
    };

    document.querySelector("#colorIcon").onclick = () => {
        document.querySelector(".color_options_wrapper").classList.toggle("hidden");
    };

    document.querySelector("#closeColorsIcon").onclick = () => {
        document.querySelector(".color_options_wrapper").classList.add("hidden");
    };

    document.querySelectorAll(".colors>div").forEach((div) => {
        div.onmouseover = () => {
            loadColorsPreview(div.querySelectorAll(".color"), div);
        };

        div.onclick = () => {
            loadColorsPreview(div.querySelectorAll(".color"), div, true);
        };
    });
};

// functions
// start game
function start_game() {
    if (document.activeElement.id == "username") return;
    document.removeEventListener("keydown", start_game);
    game = new Game();

    document.querySelector(".center.column").classList.add("game_started");
    piece = new Piece();

    soundtrack.currentTime = 0;
    soundtrack.play();

    gtag("event", "new_game", {
        category: "game_event",
        discription: "New game started!",
    });
}
// canvas
function change_dimensions(redraw = false) {
    canvas.height = (document.querySelector("#game").clientHeight - 4) * 0.95;
    block_size = canvas.height / rows;
    canvas.width = block_size * cols;

    if (redraw) game?.redraw();
}

// icons
function toggleMusicIcon(click, changeVolume = true) {
    let icon = click.target;
    let old_state = Number(icon.dataset.state);

    icon.dataset.state = old_state == icon.dataset.max ? (changeVolume ? 0 : 1) : old_state + 1;
    icon.src = icon.src.replace(`${old_state}.svg`, `${icon.dataset.state}.svg`);
    changeVolume ? iconChangeVolume(icon) : 0;

    if (icon == phoneIcon) {
        localStorage.setItem("touch_screen", icon.dataset.state);
        document.body.classList.toggle("touch_enabled");
    }
}

function iconChangeVolume(icon) {
    let changes = Array.from(soundOptions);
    let effectsLevel = effectsIcon.dataset.state;
    let trackLevel = trackIcon.dataset.state;
    localStorage.setItem("sound_effects", effectsLevel);
    if (icon == trackIcon) {
        localStorage.setItem("soundtrack", trackLevel);
    }

    icon.src?.includes("effects") ? changes.splice(0, 2) : 0;
    icon.src?.includes("music") ? changes.splice(2) : 0;

    for (let change of changes) {
        let newVolume = soundOptions.indexOf(change) > 1 ? effectsLevel : trackLevel * 0.5;
        change.volume = newVolume;
    }
}

// scores
const local_scores = (clear = false) => {
    if (clear) {
        scoresHTML.innerHTML = "<li style='list-style: none;'><i>It seems like you haven't played yet!</i></li>";
        window.localStorage.removeItem("scores");
        window.localStorage.removeItem("levels");
        return;
    }

    let scores = window.localStorage.getItem("scores");
    if (!scores) return []; // if 0 or undefined

    let sortedScores = scores
        .split(",")
        .slice()
        .sort((a, b) => b - a);

    if (sortedScores.length >= 5) {
        sortedScores.splice(5);
    }

    window.localStorage.setItem("scores", sortedScores);

    scoresHTML.innerHTML = "";
    let levels = {};
    if (window.localStorage.getItem("levels")) {
        levels = JSON.parse(window.localStorage.getItem("levels"));
    }
    for (let score of sortedScores) {
        scoresHTML.innerHTML += `<li><b>level ${levels[score]}</b>: ${score}</li>`;
    }

    return sortedScores;
};

function new_score(newScore, level, final = false) {
    document.querySelector("#score").innerHTML = newScore;
    if (!final) return;

    // document.querySelector("#finalScore").innerHTML = newScore;

    if (!newScore || !level) return;

    let scores = local_scores();
    scores.push(newScore);

    let levels = {};
    if (window.localStorage.getItem("levels")) {
        levels = JSON.parse(window.localStorage.getItem("levels"));
    }

    levels[newScore] = level;

    window.localStorage.setItem("scores", scores);
    window.localStorage.setItem("levels", JSON.stringify(levels));

    local_scores();
    gtag("event", "game_end", {
        category: "game_event",
        discription: "Game ended and score uploaded!",
    });
}

function upload_highscore(score) {
    if (score == 0 || !username) return;

    const url = `${window.location.origin}/newScore`;
    const data = { user: username, score: score, weekly: false };

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => console.log("Response data:", data))
        .catch((error) => console.error("Error:", error));
}

// lower piece functions
function keyDown() {
    clearInterval(autoInterval);
    clearInterval(dropInterval);

    dropInterval = setInterval(() => {
        if (game.pause) return;

        if (game.stop) {
            clearInterval(dropInterval);
            return;
        }

        piece.move("y;1");
    }, speed);
}

function keyUp(e) {
    if (e.key == "ArrowDown") {
        clearInterval(dropInterval);
        dropInterval = undefined;
        lowerAutomaticaly();
    }
}

function lowerAutomaticaly() {
    // lower block every 750ms
    clearInterval(autoInterval);

    autoInterval = setInterval(() => {
        if (game.pause) return;

        if (game.stop) {
            clearInterval(autoInterval);
            return;
        }

        piece.move("y;1");
    }, auto_speed);
}

function loadColorsPreview(preference, parent, click = false) {
    let colors_result = preference ? [] : colors;

    if (preference) {
        for (let color of preference) {
            colors_result.push(color.style.backgroundColor);
        }
    }

    document.querySelectorAll(".color_preview g").forEach((group, i) => {
        group.style.fill = colors_result[i];
    });

    if (click && parent) {
        colors = colors_result;
        window.localStorage.setItem("color", JSON.stringify(colors));
        document.querySelector(".selected_color").classList.remove("selected_color");
        parent.classList.add("selected_color");
        game?.redraw();
    }
}
