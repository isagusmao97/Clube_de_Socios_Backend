// index.js
const knex = require("knex")(require("./knexfile").development);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const socioRoutes = require("./routes/socios");
const dependenteRoutes = require("./routes/dependentes");
const pagamentoRoutes = require("./routes/pagamentos");
const ocupacoesRouter = require("./routes/ocupacoes");

app.use("/socios", socioRoutes);
app.use("/dependentes", dependenteRoutes);
app.use("/pagamentos", pagamentoRoutes);
app.use("/ocupacoes", ocupacoesRouter);


app.get("/socios", async (req, res) => {
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


app.get('/dependentes', async (req, res) => {
  try {
    const dependentes = await knex('dependente')
      .join('socio', 'dependente.socio_id', '=', 'socio.id')
      .select(
        'dependente.id',
        'dependente.nome',
        'dependente.grau_parentesco',
        'socio.nome as nome_socio'
      );

    res.json(dependentes);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar dependentes' });
  }
});

app.post('/dependentes', async (req, res) => {
  const {
    socio_id,
    nome,
    data_nascimento,
    sexo,
    grau_parentesco,
    mes_ingresso,
    ano_ingresso
  } = req.body;

  try {
    // 1. Buscar sócio correspondente
    const socio = await knex('socio').where({ id: socio_id }).first();
    if (!socio) {
      return res.status(400).json({ erro: "Sócio não encontrado." });
    }

    // 2. Verificar se sócio já tem 9 dependentes
    const total = await knex('dependente').where({ socio_id }).count('id as total');
    if (parseInt(total[0].total) >= 9) {
      return res.status(400).json({ erro: "Limite de 9 dependentes atingido." });
    }

    // 3. Verificar se já existe um dependente com o mesmo nome para este sócio
    const nomeExistente = await knex('dependente')
      .where({ socio_id })
      .andWhereRaw('LOWER(nome) = ?', nome.toLowerCase())
      .first();
    if (nomeExistente) {
      return res.status(400).json({ erro: "Já existe um dependente com esse nome para este sócio." });
    }

    // 4. Verificar se a data de ingresso do dependente é antes da do sócio
    const dataSocio = new Date(socio.ano_ingresso, socio.mes_ingresso - 1);
    const dataDependente = new Date(ano_ingresso, mes_ingresso - 1);
    if (dataDependente < dataSocio) {
      return res.status(400).json({ erro: "Data de ingresso do dependente não pode ser anterior à do sócio." });
    }

    // 5. Inserir dependente
    await knex('dependente').insert({
      socio_id,
      nome,
      data_nascimento,
      sexo,
      grau_parentesco,
      mes_ingresso,
      ano_ingresso
    });

    res.status(201).json({ mensagem: "Dependente cadastrado com sucesso." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao cadastrar dependente." });
  }
});

function calcularValorParaPagamento(socio, dependentes, anoReferencia) {
  const valorMensal = 25;
  let totalMeses = 0;

  // Cálculo para o sócio
  if (anoReferencia === socio.ano_ingresso) {
    totalMeses += 12 - socio.mes_ingresso + 1;
  } else if (anoReferencia > socio.ano_ingresso) {
    totalMeses += 12;
  }

  // Cálculo para dependentes
  for (const d of dependentes) {
    if (anoReferencia === d.ano_ingresso) {
      totalMeses += 12 - d.mes_ingresso + 1;
    } else if (anoReferencia > d.ano_ingresso) {
      totalMeses += 12;
    }
  }

  return totalMeses * valorMensal;
}


app.post("/pagamentos", async (req, res) => {
  console.log("➡️ Dados recebidos:", req.body); // Verifique socio_id e ano
  try {
    const { socio_id, ano } = req.body;

    const socio = await knex("socio").where({ id: socio_id }).first();
    console.log("👤 Sócio encontrado:", socio);

    const dependentes = await knex("dependente").where({ socio_id });
    console.log("👥 Dependentes encontrados:", dependentes);

    if (!socio) {
      return res.status(400).json({ erro: "Sócio não encontrado." });
    }

    const valorTotal = calcularValorParaPagamento(socio, dependentes, ano);
    console.log("💸 Valor calculado:", valorTotal);

    await knex("pagamento").insert({
      socio_id,
      ano,
      valor_total: valorTotal,
      data_pagamento: new Date()
    });

    res.status(201).json({
      mensagem: "Pagamento registrado com sucesso.",
      valor_total: valorTotal
    });
  } catch (err) {
    console.error("❌ Erro ao registrar pagamento:", err);
    res.status(500).json({ erro: "Erro interno ao registrar pagamento." });
  }
});




app.get("/pagamentos", async (req, res) => {
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
      query.whereRaw("LOWER(socio.nome) LIKE ?", [`%${nome.toLowerCase()}%`]);
    }

    if (ano) {
      query.where("pagamento.ano", ano);
    }

    const resultados = await query;
    res.json(resultados);
  } catch (err) {
    console.error("Erro ao buscar pagamentos:", err.message);
    res.status(500).json({ erro: "Erro interno ao buscar pagamentos." });
  }
});


app.delete("/pagamentos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletado = await knex("pagamento").where({ id }).del();

    if (!deletado) {
      return res.status(404).json({ erro: "Pagamento não encontrado." });
    }

    res.json({ mensagem: "Pagamento excluído com sucesso." });
  } catch (err) {
    console.error("Erro ao excluir pagamento:", err.message);
    res.status(500).json({ erro: "Erro interno ao excluir pagamento." });
  }
});


app.get("/", (req, res) => res.send("API do Clube no ar!"));

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
