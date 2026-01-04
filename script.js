const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let celebrated = false;

// Resize
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(s => video.srcObject = s);

// MediaPipe
const holistic = new Holistic({
  locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${f}`
});

holistic.setOptions({
  refineFaceLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

holistic.onResults(res => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!res.faceLandmarks) return;

  const lm = res.faceLandmarks;

  const L = lm[33];
  const R = lm[263];
  const N = lm[1];

  const lx = L.x * canvas.width;
  const ly = L.y * canvas.height;
  const rx = R.x * canvas.width;
  const ry = R.y * canvas.height;
  const nx = N.x * canvas.width;
  const ny = N.y * canvas.height;

  const faceW = Math.hypot(rx - lx, ry - ly) * 2.4;
  const angle = Math.atan2(ry - ly, rx - lx);

  ctx.save();
  ctx.translate(nx, ny);
  ctx.rotate(angle);

  // 🐷 HEAD
  ctx.fillStyle = "#ffb6c1";
  ctx.beginPath();
  ctx.ellipse(0, 0, faceW * 0.6, faceW * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // 🐷 EARS
  ctx.fillStyle = "#ff9aaa";
  ctx.beginPath();
  ctx.ellipse(-faceW * 0.5, -faceW * 0.55, faceW * 0.25, faceW * 0.35, -0.5, 0, Math.PI * 2);
  ctx.ellipse(faceW * 0.5, -faceW * 0.55, faceW * 0.25, faceW * 0.35, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // 🐽 SNOUT
  ctx.fillStyle = "#ff7f9f";
  ctx.beginPath();
  ctx.ellipse(0, faceW * 0.15, faceW * 0.25, faceW * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // 🐽 NOSTRILS
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(-faceW * 0.08, faceW * 0.15, faceW * 0.04, 0, Math.PI * 2);
  ctx.arc(faceW * 0.08, faceW * 0.15, faceW * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // 👀 EYES
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(-faceW * 0.2, -faceW * 0.1, faceW * 0.05, 0, Math.PI * 2);
  ctx.arc(faceW * 0.2, -faceW * 0.1, faceW * 0.05, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 🎉 Celebration trigger (stable alignment)
  if (!celebrated && faceW > 180) {
    celebrated = true;
    blastConfetti();
    speak();
  }
});

// Camera loop
const camera = new Camera(video, {
  onFrame: async () => holistic.send({ image: video }),
  width: 640,
  height: 480
});
camera.start();

// 🎊 Confetti
function blastConfetti() {
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = `hsl(${Math.random() * 360},100%,60%)`;
    ctx.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      6, 6
    );
  }
}

// 🔊 Voice
function speak() {
  const msg = new SpeechSynthesisUtterance("You are pig, congratulations!");
  msg.rate = 0.9;
  msg.pitch = 1.2;
  speechSynthesis.speak(msg);
}
