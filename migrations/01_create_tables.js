// script.js

const API = "http://localhost:3000";

function openSection(section) {
  const popup = document.getElementById("popup");
  const title = document.getElementById("popup-title");
  const content = document.getElementById("popup-content");

  title.textContent = section.charAt(0).toUpperCase() + section.slice(1);

  if (section === "socio") loadSocios(content);
  else if (section === "dependentes") loadDependentes(content);
  else if (section === "pagamentos") loadPagamentos(content);

  popup.style.display = "block";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

async function loadSocios(container) {
  try {
    const res = await fetch(`${API}/socios`);
    const socios = await res.json();
    container.innerHTML = `
      <h3>Lista de Sócios</h3>
      <button onclick="showSocioForm()">+ Novo Sócio</button>
      <ul>
        ${socios.map(s => `
          <li>
            <strong>${s.nome}</strong> - CPF: ${s.cpf}
            <button onclick="editSocio(${s.id})">Editar</button>
            <button onclick="deleteSocio(${s.id})">Excluir</button>
          </li>
        `).join('')}
      </ul>
    `;
  } catch (err) {
    container.innerHTML = "Erro ao carregar sócios.";
  }
}

async function showSocioForm(editing = false, socio = {}) {
  const content = document.getElementById("popup-content");
  const ocupacoes = await fetch(`${API}/ocupacoes`).then(r => r.json());

  content.innerHTML = `
    <h3>${editing ? "Editar Sócio" : "Novo Sócio"}</h3>
    <form onsubmit="${editing ? `updateSocio(event, ${socio.id})` : "createSocio(event)"}">
      <input name="nome" placeholder="Nome" required value="${socio.nome || ''}">
      <input name="cpf" placeholder="CPF" required value="${socio.cpf || ''}">
      <input name="numero_associacao" placeholder="Número de Associação" type="number" required value="${socio.numero_associacao || ''}">
      <input name="data_nascimento" placeholder="Data de Nascimento" type="date" required value="${socio.data_nascimento || ''}">
      <input name="sexo" placeholder="Sexo (M/F)" required value="${socio.sexo || ''}">
      <input name="endereco" placeholder="Endereço" required value="${socio.endereco || ''}">
      <input name="mes_ingresso" placeholder="Mês de Ingresso" type="number" required value="${socio.mes_ingresso || ''}">
      <input name="ano_ingresso" placeholder="Ano de Ingresso" type="number" required value="${socio.ano_ingresso || ''}">
      <select name="ocupacao_id" required>
        <option value="">Selecione a Ocupação</option>
        ${ocupacoes.map(o => `<option value="${o.id}" ${socio.ocupacao_id == o.id ? "selected" : ""}>${o.titulo}</option>`).join('')}
      </select>
      <button type="submit">Salvar</button>
    </form>
  `;
}

async function createSocio(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  await fetch(`${API}/socios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  openSection("socio");
}

async function editSocio(id) {
  const res = await fetch(`${API}/socios/${id}`);
  const socio = await res.json();
  showSocioForm(true, socio);
}

async function updateSocio(e, id) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  await fetch(`${API}/socios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  openSection("socio");
}

async function deleteSocio(id) {
  if (!confirm("Deseja excluir este sócio?")) return;
  await fetch(`${API}/socios/${id}`, { method: "DELETE" });
  openSection("socio");
}

await knex("ocupacao").insert([
  { titulo: "Professor", descricao: "Docente em instituições de ensino", categoria: "Educação" },
  { titulo: "Enfermeiro", descricao: "Profissional da saúde", categoria: "Saúde" },
  { titulo: "Engenheiro Civil", descricao: "Planeja e executa obras de construção", categoria: "Engenharia" },
  { titulo: "Auxiliar Administrativo", descricao: "Apoio em rotinas administrativas", categoria: "Administração" }
]);


async function loadDependentes(container) {
  try {
    const res = await fetch(`${API}/dependentes`);
    const dependentes = await res.json();
    container.innerHTML = `
      <h3>Dependentes</h3>
      <button onclick="showDependenteForm()">+ Novo Dependente</button>
      <ul>
        ${dependentes.map(d => `
          <li>
            <strong>${d.nome}</strong> - Sócio ID: ${d.socio_id}
            <button onclick="deleteDependente(${d.id})">Excluir</button>
          </li>
        `).join('')}
      </ul>
    `;
  } catch (err) {
    container.innerHTML = "Erro ao carregar dependentes.";
  }
}

function showDependenteForm() {
  const content = document.getElementById("popup-content");
  content.innerHTML = `
    <h3>Novo Dependente</h3>
    <form onsubmit="createDependente(event)">
      <input name="socio_id" placeholder="ID do Sócio" type="number" required>
      <input name="nome" placeholder="Nome" required>
      <input name="data_nascimento" placeholder="Data de Nascimento" type="date" required>
      <input name="sexo" placeholder="Sexo (M/F)" required>
      <input name="grau_parentesco" placeholder="Parentesco" required>
      <input name="mes_ingresso" placeholder="Mês de Ingresso" type="number" required>
      <input name="ano_ingresso" placeholder="Ano de Ingresso" type="number" required>
      <button type="submit">Salvar</button>
    </form>
  `;
}

async function createDependente(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  await fetch(`${API}/dependentes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  openSection("dependentes");
}

async function deleteDependente(id) {
  if (!confirm("Deseja excluir este dependente?")) return;
  await fetch(`${API}/dependentes/${id}`, { method: "DELETE" });
  openSection("dependentes");
}

async function loadPagamentos(container) {
  try {
    const res = await fetch(`${API}/pagamentos`);
    const pagamentos = await res.json();
    container.innerHTML = `
      <h3>Pagamentos Realizados</h3>
      <ul>
        ${pagamentos.map(p => `
          <li>
            <strong>${p.nome_socio}</strong> (${p.ocupacao}) - Ano: ${p.ano}, Valor: R$ ${parseFloat(p.valor_total).toFixed(2)}
          </li>
        `).join('')}
      </ul>
    `;
  } catch (err) {
    container.innerHTML = "Erro ao carregar pagamentos.";
  }
}

exports.up = function(knex) {
  return knex.schema
    .createTable('ocupacao', function(table) {
      table.increments('id').primary();
      table.string('titulo').notNullable();
      table.string('descricao');
      table.string('categoria');
    })
    .createTable('socio', function(table) {
      table.increments('id').primary();
      table.string('nome').notNullable();
      table.string('cpf').notNullable().unique();
      table.integer('numero_associacao').notNullable();
      table.date('data_nascimento').notNullable();
      table.string('sexo').notNullable();
      table.string('endereco').notNullable();
      table.integer('mes_ingresso').notNullable();
      table.integer('ano_ingresso').notNullable();
      table.integer('ocupacao_id').unsigned().references('id').inTable('ocupacao').onDelete('CASCADE');
    })
    .createTable('dependente', function(table) {
      table.increments('id').primary();
      table.integer('socio_id').unsigned().notNullable().references('id').inTable('socio').onDelete('CASCADE');
      table.string('nome').notNullable();
      table.date('data_nascimento').notNullable();
      table.string('sexo').notNullable();
      table.string('grau_parentesco').notNullable();
      table.integer('mes_ingresso').notNullable();
      table.integer('ano_ingresso').notNullable();
    })
    .createTable('pagamento', function(table) {
      table.increments('id').primary();
      table.integer('socio_id').unsigned().notNullable().references('id').inTable('socio').onDelete('CASCADE');
      table.integer('ano').notNullable();
      table.decimal('valor_total', 10, 2).notNullable();
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('pagamento')
    .dropTableIfExists('dependente')
    .dropTableIfExists('socio')
    .dropTableIfExists('ocupacao');
};
