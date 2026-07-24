require("dotenv").config();

const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error("Supabase environment variables are missing.");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

app.use(express.json());
app.use(express.static("public"));

app.get("/api/welcome", function (request, response) {
  response.json({
    message: "Hello Rahul! Your cloud database is connected."
  });
});

app.get("/api/goals", async function (request, response) {
  const { data, error } = await supabase
    .from("goals")
    .select("id, text")
    .order("id", { ascending: false });

  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }

  response.json(data);
});

app.post("/api/goals", async function (request, response) {
  const goal = request.body.goal?.trim();

  if (!goal) {
    response.status(400).json({ error: "A goal is required." });
    return;
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({ text: goal })
    .select("id, text")
    .single();

  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }

  response.status(201).json(data);
});

app.delete("/api/goals/:id", async function (request, response) {
  const id = Number(request.params.id);

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id);

  if (error) {
    response.status(500).json({ error: error.message });
    return;
  }

  response.status(204).end();
});

app.listen(PORT, function () {
  console.log("Server running at http://localhost:" + PORT);
});