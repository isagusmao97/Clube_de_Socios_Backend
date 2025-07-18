// routes/pagamentos.js
const express = require("express");
const knex = require("knex")(require("../knexfile").development);
const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const { nome, ano } = req.query;

    let query = knex("pagamento_cota")
      .join("socio", "pagamento_cota.socio_id", "socio.id")
      .select(
        "pagamento_cota.id",
        "socio.nome as nome_socio",
        "pagamento_cota.ano",
        "pagamento_cota.valor_total",
        "pagamento_cota.data_pagamento"
      )
      .orderBy("pagamento_cota.data_pagamento", "desc");

    if (nome) {
      query.where("socio.nome", "ILIKE", `%${nome}%`);
    }

    if (ano) {
      query.where("pagamento_cota.ano", ano);
    }

    const resultados = await query;
    res.json(resultados);
  } catch (err) {
    console.error("Erro ao buscar pagamentos:", err.message);
    res.status(500).json({ erro: "Erro interno ao buscar pagamentos." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pagamento = await knex("pagamento_cota")
      .where({ id: req.params.id })
      .first();

    if (!pagamento) {
      return res.status(404).json({ erro: "Pagamento não encontrado." });
    }

    res.json(pagamento);
  } catch (err) {
    console.error("Erro ao buscar pagamento:", err.message);
    res.status(500).json({ erro: "Erro interno ao buscar pagamento." });
  }
});


router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { socio_id, ano, valor_total, data_pagamento } = req.body;

  try {
    const atualizado = await knex("pagamento_cota")
      .where({ id })
      .update({
        socio_id,
        ano,
        valor_total,
        data_pagamento
      });

    if (!atualizado) {
      return res.status(404).json({ erro: "Pagamento não encontrado." });
    }

    res.json({ mensagem: "Pagamento atualizado com sucesso." });
  } catch (err) {
    console.error("Erro ao atualizar pagamento:", err.message);
    res.status(500).json({ erro: "Erro interno ao atualizar pagamento." });
  }
});




module.exports = router;
