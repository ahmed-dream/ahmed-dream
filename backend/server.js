const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB bağlantısı
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
let db;

async function start() {
  await client.connect();
  db = client.db("piafi"); // veritabanı adı
  console.log("MongoDB bağlandı, backend hazır!");
}
start();

// 1️⃣ Çizim kaydet
app.post("/save", async (req, res) => {
  const { dataURL, tags } = req.body;
  const result = await db.collection("drawings").insertOne({
    dataURL,
    tags,
    createdAt: new Date()
  });
  res.json({ message: "Çizim kaydedildi!", id: result.insertedId });
});

// 2️⃣ Çizimleri listele
app.get("/drawings", async (req, res) => {
  const drawings = await db.collection("drawings").find().toArray();
  res.json(drawings);
});

// 2️⃣ Paylaşım linki ile tek çizim getir
app.get("/drawing/:id", async (req, res) => {
  const drawing = await db.collection("drawings").findOne({ _id: new ObjectId(req.params.id) });
  if (!drawing) return res.status(404).json({ error: "Çizim bulunamadı" });
  res.json(drawing);
});

// 3️⃣ Arama (etiketlere göre)
app.get("/search", async (req, res) => {
  const query = req.query.q;
  const results = await db.collection("drawings").find({ tags: query }).toArray();
  res.json(results);
});

app.listen(3000, () => console.log("Server çalışıyor: http://localhost:3000"));
