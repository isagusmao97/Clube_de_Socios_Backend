// routes/dependentes.js
const express = require("express");
const knex = require("knex")(require("../knexfile").development);
const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const { nome, ano } = req.query;

    let query = knex("dependente")
      .join("socio", "dependente.socio_id", "socio.id")
      .select(
        "dependente.id",
        "dependente.nome",
        "dependente.grau_parentesco",
        "dependente.data_nascimento",
        "socio.nome as nome_socio"
      )
      .orderBy("dependente.nome");

    if (nome) {
      query.where("dependente.nome", "ILIKE", `%${nome}%`);
    }

    if (ano) {
      query.whereRaw("EXTRACT(YEAR FROM dependente.data_nascimento) = ?", [ano]);
    }

    const dependentes = await query;
    res.json(dependentes);
  } catch (err) {
    console.error("Erro ao buscar dependentes:", err.message);
    res.status(500).json({ erro: "Erro interno ao buscar dependentes." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const dependente = await knex("dependente")
      .where({ id: req.params.id })
      .first();

    if (!dependente) {
      return res.status(404).json({ erro: "Dependente não encontrado." });
    }

    res.json(dependente);
  } catch (err) {
    console.error("Erro ao buscar dependente:", err.message);
    res.status(500).json({ erro: "Erro interno ao buscar dependente." });
  }
});



router.post("/", async (req, res) => {
  const data = req.body;
  try {
    const socio = await knex("socio").where("id", data.socio_id).first();
    if (!socio) return res.status(400).json({ error: "Sócio não encontrado." });

    const count = await knex("dependente").where("socio_id", data.socio_id).count("id");
    if (parseInt(count[0].count) >= 9) return res.status(400).json({ error: "Máximo de 9 dependentes." });

    const sameName = await knex("dependente")
      .where({ socio_id: data.socio_id, nome: data.nome })
      .first();
    if (sameName) return res.status(400).json({ error: "Dependente com esse nome já cadastrado." });

    const socioAnoMes = socio.ano_ingresso * 100 + socio.mes_ingresso;
    const depAnoMes = parseInt(data.ano_ingresso) * 100 + parseInt(data.mes_ingresso);
    if (depAnoMes < socioAnoMes) return res.status(400).json({ error: "Ingresso anterior ao do sócio." });

    await knex("dependente").insert(data);
    res.status(201).json({ message: "Dependente criado!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar dados de um dependente
router.put("/:id", async (req, res) => {
  try {
    const { nome, data_nascimento, sexo, grau_parentesco, socio_id } = req.body;

    // Verifica se o dependente existe
    const existe = await knex("dependente").where({ id: req.params.id }).first();
    if (!existe) {
      return res.status(404).json({ erro: "Dependente não encontrado." });
    }

    // Atualiza os dados
    await knex("dependente")
      .where({ id: req.params.id })
      .update({
        nome,
        data_nascimento,
        sexo,
        grau_parentesco,
        socio_id
      });

    res.json({ mensagem: "Dependente atualizado com sucesso." });
  } catch (err) {
    console.error("Erro ao atualizar dependente:", err);
    res.status(500).json({ erro: "Erro interno ao atualizar dependente." });
  }
});



router.delete("/:id", async (req, res) => {
  await knex("dependente").where("id", req.params.id).del();
  res.status(204).send();
});




module.exports = router;
