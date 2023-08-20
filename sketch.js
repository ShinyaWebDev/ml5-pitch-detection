// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Basic Pitch Detection
=== */

const model_url =
  "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";

let audioContext;
let mic;
let pitch;
let frequencyColor = 0;
let prevFrequencyColor = 0;
let img = document.getElementById("img");
let container = document.getElementById("container");

function setup() {
  createCanvas(windowWidth, windowHeight);
  document.getElementById("button").addEventListener("click", startAudio);
  document.getElementById("button2").addEventListener("click", startAudio);
  // audioContext = getAudioContext();
  // mic = new p5.AudioIn();
  // mic.start(startPitch);
}

function startAudio() {
  // Move all audio-related setup into the mousePressed function

  console.log("Starting audio...");
  audioContext = getAudioContext();
  audioContext.resume();
  mic = new p5.AudioIn();
  mic.start(startPitch);
}
//In the above code, the startAudio() function which starts the microphone and the listening process, is only called when the user clicks the button, satisfying the browser's autoplay policy.

function startPitch() {
  pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, modelLoaded);
}

function modelLoaded() {
  select("#status").html("Model Loaded");
  getPitch();
}

function moveImg(position) {
  img.style.bottom = position + "px";
}

function colorPicker(value) {
  container.style.backgroundColor = `rgb(${value * 0.7}, ${value * 0.7}, 100)`;
}

function getPitch() {
  pitch.getPitch(function (err, frequency) {
    if (frequency) {
      select("#result").html(Math.floor(frequency));
      currentFrequencyColor = Math.floor(frequency);

      moveImg(currentFrequencyColor);
      colorPicker(currentFrequencyColor);

      if (
        Math.abs(
          currentFrequencyColor !== 0 &&
            currentFrequencyColor - prevFrequencyColor
        ) > 2
      ) {
        system.spawn(mouseX, mouseY); // Call the system.spawn() function
      }

      frequencyColor = currentFrequencyColor;
      prevFrequencyColor = currentFrequencyColor;
    } else {
      select("#result").html("No pitch detected");
    }
    getPitch();
  });
}

function draw() {
  // background(Math.round(frequency));
  // background(255, 255 - frequencyColor * 0.42, frequencyColor * 0.42);
  background("white");
  system.avoidOverlap();
  system.update();
}

mouseClicked = () => system.spawn(mouseX, mouseY);

const particle = (x, y) => ({
  posx: x,
  posy: y,
  velx: 0,
  vely: 0,
  accx: 0,
  accy: 0,
  gravity: 0,
  radius: random(width / 100, width / 30),
  color: color(
    frequencyColor < 150 ? 1 : 255,
    random(255),
    frequencyColor < 150 ? 255 : 2
  ),
  show() {
    fill(this.color);
    ellipse(this.posx, this.posy, this.radius * 2);
  },
});

const system = {
  particles: [],

  spawn(x, y) {
    for (let i = 12; i--; ) {
      const a = random(TWO_PI);
      this.particles.push(
        particle(frequencyColor * 2 + cos(a), frequencyColor + sin(a))
      );
    }
  },

  avoidOverlap() {
    for (let i = this.particles.length; i--; ) {
      const current = this.particles[i];
      for (let j = i; j--; ) {
        const other = this.particles[j];
        const dx = current.posx - other.posx;
        const dy = current.posy - other.posy;
        const distance = sqrt(dx * dx + dy * dy);
        const sumRadius = current.radius + other.radius;
        if (distance < sumRadius) {
          let strength = 1 - distance / sumRadius;
          strength *= 0.25;
          current.accx += dx * strength;
          current.accy += dy * strength;
          other.accx -= dx * strength;
          other.accy -= dy * strength;
        }
      }
    }
  },

  update() {
    for (const b of this.particles) {
      b.gravity += 0.01;
      b.velx += b.accx;
      b.vely += b.accy;
      b.posx += b.velx;
      b.posy += b.vely + b.gravity;
      b.velx *= 0.5;
      b.vely *= 0.5;
      b.accx = 0;
      b.accy = 0;
      b.show();
    }
    this.particles = this.particles.filter((b) => {
      b.radius *= 0.995;
      return b.radius > 2 && b.posy - b.radius < height;
    });
  },
};
