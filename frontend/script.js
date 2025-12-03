// Menü aç/kapa
function toggleMenu() {
  document.getElementById("mobileNav").classList.toggle("show");
}

// Canvas ayarları
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

// Çizimi kaydet (backend'e)
function saveDrawing() {
  const dataURL = canvas.toDataURL("image/png");
  const blank = document.createElement("canvas");
  blank.width = canvas.width;
  blank.height = canvas.height;
  if (dataURL === blank.toDataURL()) {
    alert("Boş bir çizimi kaydedemezsin!");
    return;
  }

  const tags = prompt("Bu çizime bir etiket ekle (örn: çiçek, araba):");

  fetch("http://localhost:3000/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataURL, tags })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message + "\nPaylaşım linki: http://localhost:3000/drawing/" + data.id);
    window.location.href = "kaydedilenler.html";
  })
  .catch(err => console.error("Kaydetme hatası:", err));
}

// Çizim tahtasını temizle
function clearBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tempImage = null;
}

// Kaydedilenleri yükle (backend'den)
function loadSavedDrawings() {
  fetch("http://localhost:3000/drawings")
    .then(res => res.json())
    .then(saved => {
      const container = document.getElementById("savedDrawings");
      container.innerHTML = "";

      if (!saved || saved.length === 0) {
        container.innerHTML = "<p>Henüz kaydedilmiş çizim yok.</p>";
        return;
      }

      saved.forEach((item, i) => {
        const img = document.createElement("img");
        img.src = item.dataURL;
        img.alt = "Çizim " + (i+1);
        img.style.width = "180px";
        img.style.border = "2px solid #c77dff";
        img.style.borderRadius = "10px";
        img.style.margin = "10px";
        container.appendChild(img);
      });
    })
    .catch(err => console.error("Listeleme hatası:", err));
}

// Arama (backend üzerinden)
function searchDrawing() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) {
    alert("Lütfen bir arama kelimesi girin!");
    return;
  }

  fetch("http://localhost:3000/search?q=" + query)
    .then(res => res.json())
    .then(results => {
      const grid = document.getElementById("resultsGrid");
      grid.innerHTML = "";

      if (!results || results.length === 0) {
        grid.innerHTML = "<p>Sonuç bulunamadı.</p>";
        return;
      }

      results.forEach(item => {
        const img = document.createElement("img");
        img.src = item.dataURL;
        img.alt = "Arama sonucu";
        img.style.width = "180px";
        img.style.border = "2px solid #ff99cc";
        img.style.borderRadius = "10px";
        img.style.margin = "10px";
        grid.appendChild(img);
      });
    })
    .catch(err => console.error("Arama hatası:", err));
}
