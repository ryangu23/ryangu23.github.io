let video;
let poseNet;
let pose;

let nosedot;
let target;

let score;
let rend;

let time;
let elapsed;

let hs;

var promptInd = [[], []];

let x = 15;

let width = window.innerWidth;
let height = window.innerHeight;

function preload() {
  gif = createImg("opt_gif.gif", "tutorial_gif");
  gif.hide();
}

function setup() {
  createCanvas(width, height);
  background("black");
  video = createCapture(VIDEO);
  video.x = width;
  video.y = height;
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);
  
  textSize(30);
  textStyle(BOLD);
  
  nosedot = new entity(0, 0, 20, false);
  target = new entity(width/2, 100, 200, true);
  
  score = 0;
  time = int(second());
  elapsed = 0;
  
  hs = new highscore();
  
  promptInd = [[true, "A GREEN dot will follow your nose. Match this dot to the RED target to score points. Click to continue."], [true, "Press SPACEBAR at anytime to restart the game. Click to continue."], [true, "Click to continue.", "[GIF]"]];
}

function draw() {
  
  background("black");
  
  if (!video.loadedmetadata) {
    //turn on camera
    fill("red");
    drawText("This game requires camera access. You will not be recorded whatsoever.", 15, (width-video.width)/2, 5, video.width);
    return;
  }
  
  //tutorial
  for (let i = 0; i < promptInd.length; i++) {
    if (promptInd[i][0]) {
      fill("white");
      if (!promptInd[i][2] || promptInd[i][2] != "[GIF]") {
        drawText(promptInd[i][1], 15, (width-video.width)/2, 5, video.width);
      } else {
        drawText(promptInd[i][1], 15, (width-video.width)/2, gif.height + 5, video.width);
      }
      if (promptInd[i][2] && promptInd[i][2] == "[GIF]") {
        gif.position((width - video.width)/2, 5);
        gif.show()
      }
      return;
    }
  }
  
  game();
  
  console.log("score is: " + score);
  console.log("high score is: " + hs.highscore);
}

function keyPressed() {
  if (keyIsDown(32)) {
    clear();
    nosedot = new entity(0, 0, 20, false);
    target = new entity(width/2, 100, 200, true);
    
    score = 0;
    time = int(second());
    elapsed = 0;
    
    loop();
  }
}

class entity {
  constructor(x, y, s, enm) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.enm = enm;
  }
  
  update(x, y) {
    if (!this.enm) {
      fill("green");
      this.x = x + ((width-video.width)/2);
      this.y = y;
      ellipse(this.x, this.y, this.s);
    } else {
      fill("red");
      ellipse(this.x, this.y, this.s);
    }
  }
  
  scored() {
    this.x = random((width-video.width)/2, video.width + ((width-video.width)/2));
    this.y = random(0, video.height);
  }
  
  collide(obj) {
    return collideCircleCircle(this.x, this.y, this.s, obj.x, obj.y, obj.s);
  }
}

class highscore {
  constructor() {
    let z = int(getItem("hs"));
    if (!z) {
      this.highscore = 0;
    } else {
      this.highscore = z;
    }
  }
  
  update(score) {
    storeItem("hs", score);
    this.highscore = score;
  }
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
  }
}

function modelLoaded() {
  console.log('ready');
}

function getElapsed(time) {
  //figure out time function
}

function mousePressed() {
  //for tutorial prompts
  for (let i = 0; i < promptInd.length; i++) {
    if (promptInd[i] && promptInd[i][0]) {
      clear();
      promptInd[i][0] = false;
      
      if (promptInd[i][2] && promptInd[i][2] == "[GIF]") {
        gif.remove();
      }
      
      break;
    }
  }
}

function game() {
  background("pink");
  image(video, (width-video.width)/2, 5);
  
  if (pose) {
    nosedot.update(pose.nose.x, pose.nose.y);
    target.update();
  }
  
  if (target.collide(nosedot)) {
    clear();
    target.scored();
    score++;
  }
  
  if (score > hs.highscore) {
    hs.update(score);
  }
}

function drawText(txt, size, x, y) {
  //fill("white");
  textSize(size);
  text(txt, x, y + 50, video.x);
}
