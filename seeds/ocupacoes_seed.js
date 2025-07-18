exports.seed = async function(knex) {
  // Limpa a tabela antes (opcional)
  await knex("ocupacao").del();

  // Insere os registros
  await knex("ocupacao").insert([
    {
      titulo: "Professor",
      descricao: "Docente em instituições de ensino",
      categoria: "Educação"
    },
    {
      titulo: "Enfermeiro",
      descricao: "Profissional da saúde",
      categoria: "Saúde"
    },
    {
      titulo: "Engenheiro Civil",
      descricao: "Planeja e executa obras",
      categoria: "Engenharia"
    },
    {
      titulo: "Analista de Sistemas",
      descricao: "Desenvolve e mantém sistemas computacionais",
      categoria: "Tecnologia"
    },
    {
      titulo: "Advogado",
      descricao: "Atua na defesa de interesses jurídicos",
      categoria: "Direito"
    },
    {
      titulo: "Psicólogo",
      descricao: "Realiza atendimentos e diagnósticos psicológicos",
      categoria: "Saúde"
    },
    {
      titulo: "Técnico em Segurança do Trabalho",
      descricao: "Garante práticas seguras no ambiente laboral",
      categoria: "Segurança do Trabalho"
    },
    {
      titulo: "Motorista",
      descricao: "Conduz veículos para transporte de pessoas ou cargas",
      categoria: "Transporte"
    },
    {
      titulo: "Cozinheiro",
      descricao: "Prepara refeições em restaurantes ou instituições",
      categoria: "Alimentação"
    },
    {
      titulo: "Assistente Administrativo",
      descricao: "Apoia rotinas de escritório e gestão documental",
      categoria: "Administração"
    }

  ]);
};
