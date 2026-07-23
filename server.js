const express = require("express");
const { DatabaseSync } = require("node:sqlite");

const app = express();
const PORT = process.env.PORT || 3000;

const db = new DatabaseSync("goals.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL
  )
`);

app.use(express.json());
app.use(express.static("public"));

app.get("/api/welcome", function (request, response) {
  response.json({
    message: "Hello Rahul! Your backend server is working."
  });
});

app.get("/api/goals", function (request, response) {
  const goals = db.prepare("SELECT id, text FROM goals").all();
  response.json(goals);
});

app.post("/api/goals", function (request, response) {
  const goal = request.body.goal?.trim();

  if (!goal) {
    response.status(400).json({ error: "A goal is required." });
    return;
  }

  const result = db
    .prepare("INSERT INTO goals (text) VALUES (?)")
    .run(goal);

  response.status(201).json({
    id: Number(result.lastInsertRowid),
    text: goal
  });
});

app.delete("/api/goals/:id", function (request, response) {
  const id = Number(request.params.id);

  db.prepare("DELETE FROM goals WHERE id = ?").run(id);
  response.status(204).end();
});

app.listen(PORT, function () {
  console.log("Server running at http://localhost:3000");
});