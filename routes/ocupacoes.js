// routes/ocupacoes.js
const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../knexfile").development);

router.get("/", async (req, res) => {
  try {
    const ocupacoes = await knex("ocupacao").select("id", "titulo", "descricao", "categoria");
    res.json(ocupacoes);
  } catch (err) {
    console.error("Erro ao buscar ocupações:", err);
    res.status(500).json({ erro: "Erro interno ao buscar ocupações." });
  }
});

router.get("/", async (req, res) => {
  const ocupacoes = await knex("ocupacao").select("id", "titulo", "descricao", "categoria");
  res.json(ocupacoes);
});


module.exports = router;
