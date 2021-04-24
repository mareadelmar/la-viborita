let padonde;
let velocidadVibora = 10;
let dimensionesVibora = 10;
const INTERVALO = 80;
let dimensionesCanvas = 500;
let bestScores = [];

let input = document.querySelector("#player");
const gameScore = document.querySelector(".playing-score");
const gamePlayer = document.querySelector(".player-name");
const btnPlay = document.querySelector(".btn-play");
const title = document.querySelector(".nav-title");
const home = document.querySelector(".container-home");
const main = document.querySelector(".container-main");
const form = document.querySelector(".home");
const containerCanvas = document.querySelector(".container-canvas");
const scoreBtn = document.querySelector("#show-table");

const btnUp = document.querySelector(".arrow-up");
const btnLeft = document.querySelector(".arrow-rest:nth-child(1)");
const btnDown = document.querySelector(".arrow-rest:nth-child(2)");
const btnRight = document.querySelector(".arrow-rest:nth-child(3)");
const pincel = document.querySelector(".pincel");
const table = document.querySelector("#color-table");
let playerName;

// mediaquerys
const mq = window.matchMedia("(max-width: 768px)");
listeners();
function listeners() {
    document.addEventListener("DOMContentLoaded", () => {
        handleMQ(mq);
        getFStore();
    });

    mq.addEventListener("change", handleMQ);
    input.addEventListener("change", () => {
        playerName = getName();
    });

    table.addEventListener("click", changeColor);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        playerName = getName();
        play();
    });
    scoreBtn.addEventListener("click", showScoreTable);
    btnUp.addEventListener("click", () => {
        redireccionar("ArrowUp");
    });
    btnLeft.addEventListener("click", () => {
        redireccionar("ArrowLeft");
    });
    btnDown.addEventListener("click", () => {
        redireccionar("ArrowDown");
    });
    btnRight.addEventListener("click", () => {
        redireccionar("ArrowRight");
    });
}

let ctx;
function fix_dpi() {
    let canvas = document.querySelector("#canvas");
    ctx = canvas.getContext("2d");
    let dpi = window.devicePixelRatio;
    console.log(dpi);
    let style = {
        height() {
            return +getComputedStyle(canvas)
                .getPropertyValue("height")
                .slice(0, -2);
        },
        width() {
            return +getComputedStyle(canvas)
                .getPropertyValue("width")
                .slice(0, -2);
        },
    };
    canvas.setAttribute("width", style.width() * dpi);
    canvas.setAttribute("height", style.height() * dpi);
}

function handleMQ(e) {
    if (e.matches) {
        let canvas = document.querySelector("#canvas");
        ctx = canvas.getContext("2d");
        velocidadVibora = 10;
        dimensionesVibora = 10;
        dimensionesCanvas = 340;

        console.log(window.devicePixelRatio);
        canvas.setAttribute("width", 340);
        canvas.setAttribute("height", 340);
        return;
    } else {
        containerCanvas.style.width = "512px";
        containerCanvas.style.height = "512px";
        canvas.style.width = "500px";
        canvas.style.height = "500px";

        document.onkeydown = (e) => {
            if (e.target.tagName.toLowerCase() !== "input") {
                padonde = DIRECCION[e.key];
                const [x, y] = padonde;
                if (
                    -x !== controles.direccion.x &&
                    -y !== controles.direccion.y
                ) {
                    controles.direccion.x = x;
                    controles.direccion.y = y;
                }
            }
        };
        fix_dpi();
    }
}

const getName = () => {
    if (!input.value.trim()) {
        return "Desconocidx";
    } else {
        return input.value;
    }
};

let DIRECCION = {
    s: [0, 1],
    w: [0, -1],
    a: [-1, 0],
    d: [1, 0],
    W: [0, -1],
    S: [0, 1],
    A: [-1, 0],
    D: [1, 0],
    ArrowDown: [0, 1],
    ArrowUp: [0, -1],
    ArrowRight: [1, 0],
    ArrowLeft: [-1, 0],
};

let controles = {
    direccion: { x: 1, y: 0 },
    vibora: [{ x: 0, y: 0 }],
    presa: { x: 0, y: 50 },
    crecimiento: 0,
    play: true,
    score: 0,
    player: playerName,
};

const redireccionar = (key) => {
    padonde = DIRECCION[key];
    const [x, y] = padonde;

    if (-x !== controles.direccion.x && -y !== controles.direccion.y) {
        controles.direccion.x = x;
        controles.direccion.y = y;
    }
};

let looper = () => {
    let cola = {};
    Object.assign(cola, controles.vibora[controles.vibora.length - 1]);
    const viboraInicial = controles.vibora[0];

    let atrapado =
        viboraInicial.x === controles.presa.x &&
        viboraInicial.y === controles.presa.y;

    let dx = controles.direccion.x;
    let dy = controles.direccion.y;

    let largoVibora = controles.vibora.length - 1;

    if (controles.play) {
        if (detectarChoque()) {
            console.log(controles.vibora);
            controles.play = false;
            console.log(controles.score, controles.player);
            let playerData = scoreData(controles.score, controles.player);
            getScoreTable(playerData);
            gameOver();
        }

        if (atrapado) {
            controles.crecimiento += 5;
            controles.score += 120;
            gameScore.textContent = controles.score;
            redibujarPresa();
        }

        if (controles.crecimiento > 0) {
            controles.vibora.push(cola);
            controles.crecimiento -= 1;
        }

        for (let idx = largoVibora; idx > -1; idx--) {
            let viboraInicial = controles.vibora[idx];
            if (idx === 0) {
                viboraInicial.x += dx;
                viboraInicial.y += dy;
            } else {
                viboraInicial.x = controles.vibora[idx - 1].x;
                viboraInicial.y = controles.vibora[idx - 1].y;
            }
        }

        requestAnimationFrame(dibujar);
        setTimeout(looper, INTERVALO);
    }
};

let color = "rgb(98, 0, 234)";
function changeColor(e) {
    const pickColor = e.target.style.backgroundColor;
    color = pickColor;
}

const detectarChoque = () => {
    let cabeza = controles.vibora[0];

    if (
        cabeza.x < 0 ||
        cabeza.x >= dimensionesCanvas / velocidadVibora ||
        cabeza.y >= dimensionesCanvas / velocidadVibora ||
        cabeza.y < 0
    ) {
        return true;
    }

    for (let idx = 1; idx < controles.vibora.length; idx++) {
        const ref = controles.vibora[idx];
        if (ref.x === cabeza.x && ref.y === cabeza.y) {
            return true;
        }
    }
};

const dibujar = () => {
    ctx.clearRect(0, 0, dimensionesCanvas, dimensionesCanvas);

    for (let idx = 0; idx < controles.vibora.length; idx++) {
        const { x, y } = controles.vibora[idx];
        dibujarBichis(color, x, y);
    }

    const presa = controles.presa;
    dibujarBichis("red", presa.x, presa.y);
};

const dibujarBichis = (color, x, y) => {
    ctx.fillStyle = color;

    ctx.fillRect(
        x * velocidadVibora,
        y * velocidadVibora,
        dimensionesVibora,
        dimensionesVibora
    );
};

const random = () => {
    let valoresDireccion = Object.values(DIRECCION);

    return {
        x: parseInt((Math.random() * dimensionesCanvas) / velocidadVibora),
        y: parseInt((Math.random() * dimensionesCanvas) / velocidadVibora),
        d: valoresDireccion[parseInt(Math.random() * 11)],
    };
};

const randomPosition = () => {
    let position = random();
    if (position.x < 10 && position.y < 10) {
        position.d = [1, 0];
        console.log("posicion d cambiada 1");
        return position;
    }
    if (position.x > dimensionesCanvas - 10 && position.y < 10) {
        position.d = [0, 1];
        console.log("posicion d cambiada 2");
        return position;
    }
    if (
        position.x > dimensionesCanvas - 10 &&
        position.y > dimensionesCanvas - 10
    ) {
        position.d = [-1, 0];
        console.log("posicion d cambiada 3");
        return position;
    }
    if (position.x < 10 && position.y > dimensionesCanvas - 10) {
        position.d = [0, -1];
        console.log("posicion d cambiada 4");
        return position;
    }
    return position;
};

const redibujarPresa = () => {
    let nuevaPosicion = random();
    let cabeza = controles.vibora[0];

    verificarPosiciones(nuevaPosicion);
    let presa = controles.presa;
    presa.x = nuevaPosicion.x;
    presa.y = nuevaPosicion.y;
};

function verificarPosiciones(posicion) {
    // verificamos que la presa no caiga en el cuerpo de la viborita --> NO FUNCIONA
    for (let i = 0; i < controles.vibora.length; i++) {
        let ref = controles.vibora[i];
        if (ref.y === posicion.y && ref.x === posicion.x) {
            redibujarPresa();
            console.log("redibujar");
        } else {
            return;
        }
    }
}

/*
si se hace un nuevo puntaje alto se dispara el modal de la tabla de puntaje, hay que buscar una opción de sweetAlert:
- método Swal.update({ ...options }): Updates popup options.
- parámetro didDestroy: ciclo de vida del popup. sirve para agregarle al popup de gameover (que display none a main y block a home)
*/

function showScoreTable() {
    console.log("mostrar scores", bestScores);
    orderScores(bestScores);

    Swal.fire({
        title: "Mejores puntajes:",
        html: `
        <div id="scores-table">
            <table class="flex">
                <thead>
                    <tr>
                        <td>nombre</td>
                        <td>score</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${bestScores[0].player}</td>
                        <td>${bestScores[0].score}</td>
                    </tr>
                    <tr>
                        <td>${bestScores[1].player}</td>
                        <td>${bestScores[1].score}</td>
                    </tr>
                    <tr>
                        <td>${bestScores[2].player}</td>
                        <td>${bestScores[2].score}</td>
                    </tr>
                    <tr>
                        <td>${bestScores[3].player}</td>
                        <td>${bestScores[3].score}</td>
                    </tr>
                    <tr>
                        <td>${bestScores[4].player}</td>
                        <td>${bestScores[4].score}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        `,
        showClass: {
            popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
            popup: "animate__animated animate__fadeOutUp",
        },
        confirmButtonText: "SALIR",
    });
}

const orderScores = (array) => {
    array = array.sort((a, b) => a.score - b.score).reverse();
    console.log(array);
    return array;
};

const getScoreTable = (s) => {
    let result = bestScores.every((i) => i.score > s.score);
    console.log(result);
    if (!result) {
        bestScores = [...bestScores, s];

        saveFStore(s);
        orderScores(bestScores);
        console.log(bestScores);
        // for (let i = 0; i < 4; i++) {
        //     if (s >= i) {
        //         console.log("puntaje alto!");
        //         gameOver("¡Puntaje alto!");
        //     } else {
        //         gameOver(" ");
        //     }
        // }
    }
};

const getFStore = () => {
    const db = firebase.firestore();
    db.collection("best-scores")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(doc.id, doc.data());
                bestScores.push(doc.data());
                console.log(bestScores);
            });
        })
        .catch((err) => console.error(err));
};

const saveFStore = (score) => {
    const db = firebase.firestore();
    db.collection("best-scores")
        .add(score)
        .then(() => {
            console.log("guardado");
            //showScoreTable();
        })
        .catch((err) => {
            console.log(err);
        });
};

const scoreData = (score, player) => {
    return {
        score,
        player,
        id: Date.now(),
    };
};

function play() {
    iniciarJuego();
    looper();
}

function iniciarJuego() {
    controles.play = true;

    controles = {
        direccion: { x: 1, y: 0 },
        vibora: [{ x: 0, y: 0 }],
        presa: { x: 0, y: 20 },
        crecimiento: 0,
        play: true,
        score: 0,
        player: playerName,
    };

    let posicionesRandom = randomPosition();
    console.log(posicionesRandom);

    let viboraInicial = controles.vibora[0];

    viboraInicial.x = posicionesRandom.x;
    viboraInicial.y = posicionesRandom.y;
    controles.direccion.x = posicionesRandom.d[0];
    controles.direccion.y = posicionesRandom.d[1];

    let posicionPresa = random();
    let presa = controles.presa;
    presa.x = posicionPresa.x;
    presa.y = posicionPresa.y;

    gameScore.textContent = controles.score;
    gamePlayer.textContent = playerName;
    home.style.display = "none";
    main.style.display = "block";
}

const gameOver = (mensaje) => {
    // modal:
    Swal.fire({
        title: mensaje,
        text: `Score de ${controles.player}: ${controles.score}`,
        imageUrl: "img/game-over.png",
        imageWidth: 200,
        imageHeight: 200,
        imageAlt: "Custom image",
        allowOutsideClick: false,
        buttonsStyling: false,
        confirmButtonText: "JUGAR DE NUEVO",
        showCancelButton: true,
        cancelButtonText: "VOLVER A INICIO",
        stopKeydownPropagation: false,

        // didDestroy: () => {
        //     main.style.display = "none";
        //     playerName = "";
        //     form.reset();
        //     home.style.display = "block";
        // },
    }).then((result) => {
        if (result.isConfirmed) {
            controles.play = true;
            home.style.display = "none";
            main.style.display = "block";
            iniciarJuego();
            looper();
        } else if (result.isDismissed) {
            controles.play = false;
            main.style.display = "none";
            //controles.player = "";
            playerName = "";
            form.reset();
            home.style.display = "block";
        }
    });
};
