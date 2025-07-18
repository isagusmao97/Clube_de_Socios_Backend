# 📑 Projeto Clube de Sócios 
 Proposta de Projeto Final da Disciplina de Programação Web, que consiste em um sistema de gerenciamento de um Clube de Sócios. 

## 📌 Sobre
 Este projeto contém duas partes sendo um Front-end e um Back-end, no sistema é possível adicionar, editar, excluir e pesquisar por um sócio, um dependente e um pagamento relacionado ao sócio. 

## ⚙️ Instalação
 Para que esse projeto funcione é necessário que se tenha instalado o Node.js(versão 16 ou mais), e o Express. Também se faz necessário ter o PostgreSQL(ou outro banco compatível com o knex), e o Git. 

### Guia de Instalação do Projeto
1- Instalar dependencias do projeto

```bash
  npm install 
  
```

2- Criar o banco de dados configurando as migrations 

```bash
  npx knex migrate: latest 
  
```

3- Popular o banco com os dados do arquivo Seed

```bash
  npx knex seed: run
  
```

4- Configurar variáveis do ambiente no arquivo .env

```bash
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=seu_usuario
    DB_PASSWORD=sua_senha
    DB_NAME=nome_do_banco
    PORT=3000

  
```
5- Iniciar o servidor

```bash
   node index.js

  
```
O servidor estará rodando em http://localhost:3000.


## 🛠️ Rotas Disponíveis
- Listar sócios: [`GET /socios`](http://localhost:3000/socios)
- Buscar sócio por ID: [`GET /socios/:id`](http://localhost:3000/socios/1)
- Buscar sócios por nome: [`GET /socios?nome=Isabela`](http://localhost:3000/socios?nome=Isabela)

- Listar dependentes: [`GET /dependentes`](http://localhost:3000/dependentes)
- Buscar dependente por nome: [`GET /dependentes?nome=Lucas`](http://localhost:3000/dependentes?nome=Lucas)

- Listar pagamentos: [`GET /pagamentos`](http://localhost:3000/pagamentos)
- Buscar pagamentos por sócio: [`GET /pagamentos?nome=Samuel`](http://localhost:3000/pagamentos?nome=Samuel)

📌 Os valores usados acima são **exemplos**. Substitua pelo nome, ano ou ID que você usou no cadastro!

## 🔧 Stack utilizada

**Front-end:** HTML, CSS, JavaScript

**Back-end:** Node, Express

## ✨ Créditos

Isabela Gusmão Rocha e Patrícia Chagas Santos Silva