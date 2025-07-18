// routes/socios.js
const express = require("express");
const knex = require("knex")(require("../knexfile").development);
const router = express.Router();

// Rota de listagem com filtro por nome
router.get("/", async (req, res) => {
  try {
    const { nome } = req.query;

    let query = knex("socio").select("*").orderBy("nome");

    if (nome) {
      query.where("nome", "ILIKE", `%${nome}%`);
    }

    const socios = await query;
    res.json(socios);
  } catch (err) {
    console.error("Erro ao buscar sócios:", err.message);
    res.status(500).json({ erro: "Erro interno ao buscar sócios." });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const socio = await knex("socio").where({ id: req.params.id }).first();

    if (!socio) {
      return res.status(404).json({ erro: "Sócio não encontrado." });
    }

    res.json(socio);
  } catch (err) {
    console.error("Erro ao buscar sócio:", err);
    res.status(500).json({ erro: "Erro interno ao buscar sócio." });
  }
});


router.post("/", async (req, res) => {
  const data = req.body;
  try {
    const exists = await knex("socio").where("cpf", data.cpf).first();
    if (exists) return res.status(400).json({ error: "CPF já cadastrado." });
    await knex("socio").insert(data);
    res.status(201).json({ message: "Sócio criado!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { ocupacao_id, ...dados } = req.body;

    const dadosAtualizados = {
      ...dados,
      ocupacao_id: ocupacao_id || null // garante que o campo exista, mesmo se vazio
    };

    const atualizado = await knex("socio")
      .where({ id: req.params.id })
      .update(dadosAtualizados);

    if (atualizado) {
      res.json({ mensagem: "Sócio atualizado com sucesso." });
    } else {
      res.status(404).json({ erro: "Sócio não encontrado." });
    }
  } catch (err) {
    console.error("Erro ao atualizar sócio:", err);
    res.status(500).json({ erro: "Erro interno ao atualizar sócio." });
  }
});



router.delete("/:id", async (req, res) => {
  await knex("socio").where("id", req.params.id).del();
  res.status(204).send();
});

module.exports = router;
