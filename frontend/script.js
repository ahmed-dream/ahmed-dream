// Menü aç/kapa
function toggleMenu() {
  document.getElementById("mobileNav").classList.toggle("show");
}

const canvas = document.getElementById("drawingBoard");
const ctx = canvas.getContext("2d");
let drawing = false;
let tool = "pen";
let startX, startY;
let tempImage = null;

function setTool(selected) { tool = selected; }

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches) {
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    return { x, y };
  } else {
    return { x: e.offsetX, y: e.offsetY };
  }
}

function startDraw(e) {
  e.preventDefault();
  drawing = true;
  const pos = getPos(e);
  startX = pos.x;
  startY = pos.y;
  tempImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (tool === "pen" || tool === "eraser") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }
}

function draw(e) {
  if (!drawing) return;
  e.preventDefault();
  const pos = getPos(e);
  if (tool === "pen") {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  } else if (tool === "eraser") {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 15;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  } else if (tool === "rect" || tool === "circle") {
    ctx.putImageData(tempImage, 0, 0);
    const width = pos.x - startX;
    const height = pos.y - startY;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    if (tool === "rect") {
      ctx.strokeRect(startX, startY, width, height);
    } else {
      const radius = Math.sqrt(width * width + height * height);
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function stopDraw() { drawing = false; }

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseleave", stopDraw);
canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", stopDraw);

function saveDrawing() {
  const dataURL = canvas.toDataURL("image/png");
  const blank = document.createElement("canvas");
  blank.width = canvas.width;
  blank.height = canvas.height;
  if (dataURL === blank.toDataURL()) {
    alert("Boş bir çizimi kaydedemezsin!");
    return;
  }
  let saved = JSON.parse(localStorage.getItem("drawings")) || [];
  saved.push(dataURL);
  localStorage.setItem("drawings", JSON.stringify(saved));
  alert("Çizim başarıyla kaydedildi!");
}

function clearBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tempImage = null;
}

// Görsel arama (demo)
function searchDrawing() {
  const resultsDiv = document.getElementById("searchResults");
  const grid = document.getElementById("resultsGrid");

  resultsDiv.style.display = "block";
  grid.innerHTML = "";

  const demoImages = Array.from({ length: 6 }, () =>
