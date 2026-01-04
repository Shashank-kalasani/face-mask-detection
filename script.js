const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Resize canvas
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Start camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream);

// Initialize MediaPipe Holistic
const holistic = new Holistic({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
});

holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  refineFaceLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// Draw labels
function drawLabel(text, x, y, color) {
  ctx.fillStyle = color;
  ctx.font = "16px Arial";
  ctx.fillText(text, x, y);
}

// Results callback
holistic.onResults(results => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* ===== FACE OUTLINE ===== */
  if (results.faceLandmarks) {
    drawConnectors(
      ctx,
      results.faceLandmarks,
      FACEMESH_TESSELATION,
      { color: "#00FF00", lineWidth: 1 }
    );

    const forehead = results.faceLandmarks[10];
    drawLabel(
      "FACE",
      forehead.x * canvas.width,
      forehead.y * canvas.height - 10,
      "#00FF00"
    );
  }

  /* ===== LEFT HAND ===== */
  if (results.leftHandLandmarks) {
    drawConnectors(
      ctx,
      results.leftHandLandmarks,
      HAND_CONNECTIONS,
      { color: "#FF0000", lineWidth: 2 }
    );

    const wrist = results.leftHandLandmarks[0];
    drawLabel(
      "LEFT HAND",
      wrist.x * canvas.width,
      wrist.y * canvas.height - 10,
      "#FF0000"
    );
  }

  /* ===== RIGHT HAND ===== */
  if (results.rightHandLandmarks) {
    drawConnectors(
      ctx,
      results.rightHandLandmarks,
      HAND_CONNECTIONS,
      { color: "#0000FF", lineWidth: 2 }
    );

    const wrist = results.rightHandLandmarks[0];
    drawLabel(
      "RIGHT HAND",
      wrist.x * canvas.width,
      wrist.y * canvas.height - 10,
      "#0000FF"
    );
  }

  /* ===== BODY / POSE ===== */
  if (results.poseLandmarks) {
    drawConnectors(
      ctx,
      results.poseLandmarks,
      POSE_CONNECTIONS,
      { color: "#FFFF00", lineWidth: 2 }
    );

    const nose = results.poseLandmarks[0];
    drawLabel(
      "BODY",
      nose.x * canvas.width,
      nose.y * canvas.height - 20,
      "#FFFF00"
    );
  }
});

// Camera loop
const camera = new Camera(video, {
  onFrame: async () => {
    await holistic.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();
