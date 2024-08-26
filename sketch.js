const CANVAS = {
  w: 600,
  h: 600,
};
const SETUP_BLOQUE = {
  ancho: CANVAS.w / 10,
  alto: CANVAS.h / 10,
  maxCant: 10,
};
const SETUP_BOLITA = {
  radio: CANVAS.w/15,
  pos: { x: 50, y: 50 },
  velocidad: { x: 0, y: 1 },
  gravedad: 0.2,
};
const MAX_CANT_EDIFICIOS = 5;

let contador = 0;
let edificios = [];



function setup() {
  createCanvas(CANVAS.w, CANVAS.h);
  noStroke();
  //frameRate(20);

  laBolita = new Bolita();
  laPartida = new Partida();
}

function draw() {
  background("#05006e");

  if (laPartida.menu) {
    laPartida.actualizarMenu();
    return;
  }
  laBolita.dibujarBolita();

  contador++;

  //agrego un edificio cada tantos seg
  if (contador % 150 === 0 && edificios.length < MAX_CANT_EDIFICIOS) {
    const nuevoEdificio = new Edificio();
    nuevoEdificio.agregarBloque();
    edificios.push(nuevoEdificio);
  }

  if (edificios.length === 0) {
    return;
  }

  edificios.forEach((edificio) => {
    edificio.dibujarEdificio();
  });

  if (/*edificios.length > 0 && */ contador % 220 === 0) {
    const edificioRandom = random(edificios);

    if (edificioRandom.bloques.length > 10) {
      console.log("game over");
      push();
      fill("red");
      rectMode(CENTER);
      rect(CANVAS.w / 2, CANVAS.h / 2, CANVAS.w / 2, 60);
      fill("white");
      textSize(50);
      textAlign(CENTER, CENTER);
      text("game over", CANVAS.w / 2, CANVAS.h / 2);
      pop();
      noLoop();
    }
    edificioRandom.agregarBloque();
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    laBolita.vel.x = -1;
  } else if (keyCode === RIGHT_ARROW) {
    laBolita.vel.x = 1;
  } else if (keyCode === UP_ARROW) {
    laBolita.pos.y = laBolita.pos.y - 1;
  } else if (keyCode === DOWN_ARROW) {
    laBolita.pos.y = laBolita.pos.y - 1;
  }
}
class Bolita {
  constructor() {
    this.pos = {
      x: SETUP_BOLITA.pos.x,
      y: SETUP_BOLITA.pos.y,
    };
    this.vel = {
      x: SETUP_BOLITA.velocidad.x,
      y: SETUP_BOLITA.velocidad.y,
    };
  }

  dibujarBolita() {
    push();
    circle(this.pos.x, this.pos.y, SETUP_BOLITA.radio * 2);
    pop();

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.vel.y = this.vel.y + SETUP_BOLITA.gravedad;

    if (this.pos.x >= CANVAS.w - SETUP_BOLITA.radio) {
      this.pos.x = CANVAS.w - SETUP_BOLITA.radio;
      this.vel.x = -1;
    }
    if (this.pos.y >= CANVAS.h - SETUP_BOLITA.radio) {
      this.pos.y = CANVAS.h - SETUP_BOLITA.radio;
      this.vel.y *= -0.95;
    }
    if (this.pos.x <= SETUP_BOLITA.radio) {
      this.pos.x = SETUP_BOLITA.radio;
      this.vel.x = 1;
    }
    if (this.pos.y <= SETUP_BOLITA.radio) {
      this.pos.y = SETUP_BOLITA.radio;
      this.vel.y = 1;
    }

    if (edificios.length === 0) {
      return;
    }

    edificios.forEach((edificio, index) => {
      const ultimoBloque = edificio?.bloques?.at(-1);
      if (ultimoBloque === undefined || this.vel.y < 0) {
        return;
      }
      if (
        (this.pos.x <= ultimoBloque.posX + SETUP_BLOQUE.ancho &&
          this.pos.x >= ultimoBloque.posX &&
          this.pos.y >= ultimoBloque.posY - SETUP_BOLITA.radio &&
          this.pos.y <= ultimoBloque.posY) ||
        dist(this.pos.x, this.pos.y, ultimoBloque.posX, ultimoBloque.posY) <=
          SETUP_BOLITA.radio ||
        dist(
          this.pos.x,
          this.pos.y,
          ultimoBloque.posX + SETUP_BLOQUE.ancho,
          ultimoBloque.posY
        ) <= SETUP_BOLITA.radio
      ) {
        edificio.borrarBloque();
        this.vel.y *= -1.25;

        if (edificio.bloques.length === 0) {
          edificio.destruirEdificio(index);
        }
      }
    });
  }
}

class Bloque {
  constructor(_x, _y, _color) {
    this.ancho = SETUP_BLOQUE.ancho;
    this.alto = SETUP_BLOQUE.alto;

    this.posX = _x;
    this.posY = _y;

    this.colorValue = _color;
  }

  displayBloque() {
    push();
    fill(this.colorValue);

    rect(this.posX, this.posY, this.ancho, this.alto);
    pop();
  }
}

class Edificio {
  constructor() {
    this.color = random(0, 255);
    this.posX = random(0, CANVAS.w - SETUP_BLOQUE.ancho);
    this.bloques = [];
  }

  agregarBloque() {
    const _x = this.posX;
    const _y = CANVAS.h - (this.bloques.length + 1) * SETUP_BLOQUE.alto;
    const _color = this.color;

    const nuevoBloque = new Bloque(_x, _y, _color);
    this.bloques.push(nuevoBloque);
  }

  dibujarEdificio() {
    this.bloques.forEach((bloque) => {
      bloque.displayBloque();
    });
  }

  borrarBloque() {
    this.bloques.pop();
  }

  destruirEdificio(index) {
    edificios.splice(index, 1);
  }
}

class Partida {
  constructor() {
    this.menu = true;
    this.botones = [
      {
        name: "titulo",
        col: 'palevioletred',
        ancho: CANVAS.w / 1.25,
        alto: 55,
        pos: {
          x: CANVAS.w / 2,
          y: CANVAS.h / 3,
        },
      },
      {
        name: "jugar",
        col: 'mistyrose',
        ancho: CANVAS.w / 2,
        alto: 40,
        pos: {
          x: CANVAS.w / 2,
          y: CANVAS.h / 2,
        },
      },
      {
        name: "créditos",
        col: 'mistyrose',
        ancho: CANVAS.w / 2,
        alto: 40,
        pos: {
          x: CANVAS.w / 2,
          y: CANVAS.h / 2 + 80,
        },
        creditos: `juego realizado para ia1 cátedra bedoian, 2024
maca villa
`,
      },
    ];
  }

  actualizarMenu() {
    background("beige");

    this.botones.forEach((boton) => {
      push();
      fill(boton.col);
      rectMode(CENTER);
      rect(boton.pos.x, boton.pos.y, boton.ancho, boton.alto + 20);
      fill("black");
      textSize(boton.alto);
      textAlign(CENTER, CENTER);
      text(boton.name, boton.pos.x, boton.pos.y);
      pop();
    });

    if (!mouseIsPressed) return;

    this.botones.forEach((boton) => {
      if (
        mouseX > boton.pos.x - boton.ancho / 2 &&
        mouseX < boton.pos.x + boton.ancho / 2 &&
        mouseY < boton.pos.y + boton.alto / 2 &&
        mouseY > boton.pos.y - boton.alto / 2
      ) {
        if (boton.name === "titulo") {
          return;
        }
        if (boton.name === "jugar") {
          this.menu = false;
          return;
        }

        push();
        fill("mistyrose");
        rectMode(CENTER);
        rect(boton.pos.x, boton.pos.y, boton.ancho, boton.alto + 20);
        fill("black");
        textSize(boton.alto / 2);
        textAlign(CENTER, CENTER);
        background("beige");
        text(boton.creditos, boton.pos.x, boton.pos.y);
        pop();
      }
    });
  }
  //TODO: la encargada de hacer lo que hace el draw (sin menú)
  actualizarPartida() {}
}
