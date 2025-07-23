// routes/pagamentos.js
const express = require("express");
const knex = require("knex")(require("../knexfile").development);
const router = express.Router();


function calcularValorParaPagamento(socio, dependentes, anoReferencia) {
  const valorMensal = 25;
  let totalMeses = 0;

  // Sócio titular
  if (anoReferencia === socio.ano_ingresso) {
    totalMeses += 12 - socio.mes_ingresso + 1;
  } else if (anoReferencia > socio.ano_ingresso) {
    totalMeses += 12;
  }

  // Dependentes
  for (const d of dependentes) {
    if (anoReferencia === d.ano_ingresso) {
      totalMeses += 12 - d.mes_ingresso + 1;
    } else if (anoReferencia > d.ano_ingresso) {
      totalMeses += 12;
    }
  }

  return totalMeses * valorMensal;
}



router.get("/", async (req, res) => {
  try {
    const { nome, ano } = req.query;

    let query = knex("pagamento")
      .join("socio", "pagamento.socio_id", "socio.id")
      .select(
        "pagamento.id",
        "socio.nome as nome_socio",
        "pagamento.ano",
        "pagamento.valor_total",
        "pagamento.data_pagamento"
      )
      .orderBy("pagamento.data_pagamento", "desc");

    if (nome) {
      query.where("socio.nome", "ILIKE", `%${nome}%`);
    }

    if (ano) {
      query.where("pagamento.ano", ano);
    }

    const resultados = await query;

    // Proteção extra: certifique-se que sempre retorna array
    if (!Array.isArray(resultados)) {
      return res.json([]);
    }

    res.json(resultados);
  } catch (err) {
    console.error("Erro ao buscar pagamentos:", err.message);
    res.status(500).json({ erro: "Erro interno ao buscar pagamentos." });
  }
});



router.get("/:id", async (req, res) => {
  try {
    const pagamento = await knex("pagamento")
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

router.post("/", async (req, res) => {
  try {
    const { socio_id, ano, data_pagamento } = req.body;

    const socio = await knex("socio").where({ id: socio_id }).first();
    if (!socio) {
      return res.status(400).json({ erro: "Sócio não encontrado." });
    }

    const dependentes = await knex("dependente").where({ socio_id });
    const valorTotal = calcularValorParaPagamento(socio, dependentes, ano);

    if (valorTotal == null || isNaN(valorTotal)) {
      return res.status(400).json({ erro: "Não foi possível calcular o valor do pagamento." });
    }

    await knex("pagamento").insert({
      socio_id,
      ano,
      valor_total: valorTotal,
      data_pagamento
    });

    res.status(201).json({ mensagem: "Pagamento registrado com sucesso.", valor_total: valorTotal });
  } catch (err) {
    console.error("Erro ao criar pagamento:", err.message);
    res.status(500).json({ erro: "Erro interno ao registrar pagamento." });
  }
});




router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { socio_id, ano, valor_total, data_pagamento } = req.body;

  try {
    const atualizado = await knex("pagamento")
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
