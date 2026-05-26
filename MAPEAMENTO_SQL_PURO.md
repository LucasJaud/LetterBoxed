# 🔌 Mapeamento de Chamadas ORM para SQL Puro (PostgreSQL)

Este documento foi criado para fins acadêmicos e práticos da disciplina de **Banco de Dados**. Ele extrai todas as operações de persistência feitas pelo ORM (**Sequelize**) em nosso projeto e as traduz em suas respectivas consultas **SQL Puras**, usando a sintaxe nativa do **PostgreSQL**.

Essa correlação ajuda a compreender o que ocorre sob o capô (under the hood) de um ORM e serve para preencher relatórios onde a escrita de consultas SQL manuais é exigida.

---

## Índice
1. [Mapeamento da Entidade Usuário (UsuarioRepositorio)](#1-mapeamento-da-entidade-usuário-usuariorepositorio)
2. [Mapeamento da Entidade Filme (FilmeRepositorio)](#2-mapeamento-da-entidade-filme-filmerepositorio)
3. [Mapeamento da Entidade Avaliação (AvaliacaoRepositorio)](#3-mapeamento-da-entidade-avaliação-avaliacaorepositorio)
4. [Mapeamento da Carga de Dados (SeedService - Carga TMDB)](#4-mapeamento-da-carga-de-dados-seedservice---carga-tmdb)
5. [Resumo das Diferenças e Tradução Automática de Operações](#5-resumo-das-diferenças-e-tradução-automática-de-operações)

---

## 1. Mapeamento da Entidade Usuário (UsuarioRepositorio)

A classe `UsuarioRepositorio` realiza operações básicas de leitura, validação e inserção na tabela `usuarios`.

### 1.1. Buscar Usuário por ID (`findByPk`)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await UsuarioModel.findByPk(id);
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    SELECT id, nome, email, senha, "createdAt", "updatedAt"
    FROM usuarios
    WHERE id = :id;
    ```

### 1.2. Buscar Usuário por E-mail (`findOne`)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await UsuarioModel.findOne({ where: { email } });
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    SELECT id, nome, email, senha, "createdAt", "updatedAt"
    FROM usuarios
    WHERE email = :email
    LIMIT 1;
    ```

### 1.3. Registrar Novo Usuário (`create`)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await UsuarioModel.create({
        nome: usuario.nome,
        email: usuario.email,
        senha: usuario.senha -- Já criptografada pelo hook beforeCreate
    });
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    INSERT INTO usuarios (nome, email, senha, "createdAt", "updatedAt")
    VALUES (:nome, :email, :senha, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id, nome, email, senha, "createdAt", "updatedAt";
    ```
    *Nota: No Sequelize, o `INSERT` sempre retorna os campos gerados pelo banco (como `id`, `createdAt` e `updatedAt`) através do comando `RETURNING` do PostgreSQL.*

### 1.4. Atualizar Cadastro do Usuário (`update`)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await UsuarioModel.update({
        nome: usuario.nome,
        email: usuario.email,
        senha: usuario.senha
    }, {
        where: { id: usuario.id }
    });
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    UPDATE usuarios
    SET nome = :nome, email = :email, senha = :senha, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = :id;
    ```

---

## 2. Mapeamento da Entidade Filme (FilmeRepositorio)

A classe `FilmeRepositorio` manipula o catálogo e implementa recursos avançados como junções (`LEFT JOIN`) e buscas parametrizadas com paginação e filtros dinâmicos.

### 2.1. Buscar Filme por ID e Trazer suas Avaliações (`findByPk` com `include`)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await FilmeModel.findByPk(id, {
        include: [{ model: AvaliacaoModel, as: 'avaliacoes' }]
    });
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    SELECT 
        f.id AS "f_id", 
        f.titulo AS "f_titulo", 
        f.ano AS "f_ano", 
        f.genero AS "f_genero", 
        f.sinopse AS "f_sinopse", 
        f.diretor AS "f_diretor", 
        f.nota AS "f_nota", 
        f."notaPlataforma" AS "f_notaPlataforma", 
        f.poster AS "f_poster", 
        f.roteiristas AS "f_roteiristas", 
        f.tmdb_id AS "f_tmdb_id",
        f."createdAt" AS "f_createdAt", 
        f."updatedAt" AS "f_updatedAt",
        a.id AS "a_id", 
        a.nota AS "a_nota", 
        a.comentario AS "a_comentario", 
        a."usuarioId" AS "a_usuarioId", 
        a."filmeId" AS "a_filmeId",
        a."createdAt" AS "a_createdAt", 
        a."updatedAt" AS "a_updatedAt"
    FROM filmes AS f
    LEFT OUTER JOIN avaliacoes AS a ON f.id = a."filmeId"
    WHERE f.id = :id;
    ```
    *Nota: A cláusula `LEFT OUTER JOIN` garante que o filme seja retornado mesmo que não possua nenhuma avaliação vinculada. O Sequelize se encarrega de agrupar as linhas de avaliações repetidas no array de objetos `avaliacoes`.*

### 2.2. Inserir Filme (`create`)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await FilmeModel.create({
        titulo: filme.titulo,
        ano: filme.ano,
        genero: filme.genero,
        sinopse: filme.sinopse,
        diretor: filme.diretor,
        nota: filme.nota,
        notaPlataforma: filme.notaPlataforma,
        poster: filme.poster,
        roteiristas: filme.roteiristas,
        tmdb_id: filme.id
    });
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    INSERT INTO filmes (titulo, ano, genero, sinopse, diretor, nota, "notaPlataforma", poster, roteiristas, tmdb_id, "createdAt", "updatedAt")
    VALUES (:titulo, :ano, :genero, :sinopse, :diretor, :nota, :notaPlataforma, :poster, :roteiristas, :tmdb_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id;
    ```

### 2.3. Atualizar Dados do Filme (`update`)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await FilmeModel.update({
        titulo: filme.titulo,
        ano: filme.ano,
        genero: filme.genero,
        sinopse: filme.sinopse,
        diretor: filme.diretor,
        nota: filme.nota,
        notaPlataforma: filme.notaPlataforma,
        poster: filme.poster,
        roteiristas: filme.roteiristas
    }, {
        where: { id: filme.id }
    });
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    UPDATE filmes
    SET 
        titulo = :titulo, 
        ano = :ano, 
        genero = :genero, 
        sinopse = :sinopse, 
        diretor = :diretor, 
        nota = :nota, 
        "notaPlataforma" = :notaPlataforma, 
        poster = :poster, 
        roteiristas = :roteiristas, 
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = :id;
    ```

### 2.4. Buscar Filmes por Lista de IDs (`findAll` com operador `Op.in`)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await FilmeModel.findAll({
        where: { id: { [Op.in]: ids } }
    });
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    SELECT id, titulo, ano, genero, sinopse, diretor, nota, "notaPlataforma", poster, roteiristas, tmdb_id, "createdAt", "updatedAt"
    FROM filmes
    WHERE id IN (:id_1, :id_2, ..., :id_n);
    ```

### 2.5. Listar Filmes com Paginação e Filtros Dinâmicos (`findAndCountAll`)
O Sequelize utiliza `findAndCountAll` para retornar tanto o total de linhas (para a paginação) quanto as linhas da página atual. No SQL, isso é traduzido em duas consultas separadas para otimizar a contagem.

*   **Abstração ORM (JavaScript):**
    ```javascript
    await FilmeModel.findAndCountAll({
        where: {
            genero: { [Op.iLike]: `%${genero}%` },
            ano: ano,
            diretor: { [Op.like]: `%${diretor}%` },
            roteiristas: { [Op.like]: `%${roteirista}%` },
            titulo: { [Op.iLike]: `%${titulo}%` }
        },
        limit: parseInt(limite),
        offset: parseInt(offset),
        order: [['ano', 'DESC'], ['id', 'DESC']]
    });
    ```

*   **Consultas SQL Equivalentes (PostgreSQL):**

    **Consulta 1: Obter a Contagem Total (para cálculo das páginas)**
    ```sql
    SELECT COUNT(*) AS count
    FROM filmes
    WHERE 
        genero ILIKE :generoFilter AND
        ano = :anoFilter AND
        diretor LIKE :diretorFilter AND
        roteiristas LIKE :roteiristaFilter AND
        titulo ILIKE :tituloFilter;
    ```

    **Consulta 2: Obter os Dados da Página**
    ```sql
    SELECT id, titulo, ano, genero, sinopse, diretor, nota, "notaPlataforma", poster, roteiristas, tmdb_id, "createdAt", "updatedAt"
    FROM filmes
    WHERE 
        genero ILIKE :generoFilter AND
        ano = :anoFilter AND
        diretor LIKE :diretorFilter AND
        roteiristas LIKE :roteiristaFilter AND
        titulo ILIKE :tituloFilter
    ORDER BY ano DESC, id DESC
    LIMIT :limit
    OFFSET :offset;
    ```
    *Diferença Crucial de Caso:*
    *   `Op.iLike` $\rightarrow$ Traduzido como **`ILIKE`** (Case-Insensitive - ignora maiúsculas/minúsculas, específico do PostgreSQL).
    *   `Op.like` $\rightarrow$ Traduzido como **`LIKE`** (Case-Sensitive - diferencia maiúsculas/minúsculas).

---

## 3. Mapeamento da Entidade Avaliação (AvaliacaoRepositorio)

A classe `AvaliacaoRepositorio` realiza operações associativas complexas de escrita e leitura agregada.

### 3.1. Buscar Avaliação por ID (`findByPk`)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await AvaliacaoModel.findByPk(id);
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    SELECT id, nota, comentario, "usuarioId", "filmeId", "createdAt", "updatedAt"
    FROM avaliacoes
    WHERE id = :id;
    ```

### 3.2. Buscar Avaliações de um Filme com Dados do Autor (`findAll` com `include` seletivo)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await AvaliacaoModel.findAll({
        where: { filmeId },
        include: [{ model: UsuarioModel, as: 'usuario', attributes: ['id', 'nome'] }]
    });
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    SELECT 
        a.id, 
        a.nota, 
        a.comentario, 
        a."usuarioId", 
        a."filmeId", 
        a."createdAt", 
        a."updatedAt",
        u.id AS "u_id", 
        u.nome AS "u_nome"
    FROM avaliacoes AS a
    LEFT OUTER JOIN usuarios AS u ON a."usuarioId" = u.id
    WHERE a."filmeId" = :filmeId;
    ```

### 3.3. Buscar Avaliações de um Usuário Ordenadas por Nota (`findAll` com `order`)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await AvaliacaoModel.findAll({
        where: { usuarioId },
        order: [['nota', 'DESC']]
    });
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    SELECT id, nota, comentario, "usuarioId", "filmeId", "createdAt", "updatedAt"
    FROM avaliacoes
    WHERE "usuarioId" = :usuarioId
    ORDER BY nota DESC;
    ```

### 3.4. Buscar Avaliação Única de Usuário para um Filme Específico (`findOne`)
Impede que o usuário crie avaliações duplicadas para o mesmo filme (Validação de unicidade lógica).
*   **Abstração ORM (JavaScript):**
    ```javascript
    await AvaliacaoModel.findOne({
        where: { filmeId, usuarioId }
    });
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    SELECT id, nota, comentario, "usuarioId", "filmeId", "createdAt", "updatedAt"
    FROM avaliacoes
    WHERE "filmeId" = :filmeId AND "usuarioId" = :usuarioId
    LIMIT 1;
    ```

### 3.5. Criar Nova Avaliação (`create`)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await AvaliacaoModel.create({
        filmeId: avaliacao.filmeId,
        usuarioId: avaliacao.usuarioId,
        nota: avaliacao.nota,
        comentario: avaliacao.comentario
    });
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    INSERT INTO avaliacoes (nota, comentario, "usuarioId", "filmeId", "createdAt", "updatedAt")
    VALUES (:nota, :comentario, :usuarioId, :filmeId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id;
    ```

### 3.6. Atualizar Avaliação Existente (`update`)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await AvaliacaoModel.update({
        nota: avaliacao.nota,
        comentario: avaliacao.comentario
    }, {
        where: { id: avaliacao.id }
    });
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    ```sql
    UPDATE avaliacoes
    SET nota = :nota, comentario = :comentario, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = :id;
    ```

---

## 4. Mapeamento da Carga de Dados (SeedService - Carga TMDB)

Para popular o banco sem duplicar dados, o serviço realiza inserções massivas utilizando a estratégia de **Upsert** (Inserir se não existe, Atualizar se já existe).

### 4.1. Inserção em Lote com Substituição sob Conflito (`bulkCreate` com `updateOnDuplicate`)
*   **Abstração ORM (JavaScript):**
    ```javascript
    await FilmeModel.bulkCreate(registros, {
        updateOnDuplicate: ['titulo', 'ano', 'genero', 'sinopse', 'diretor', 'nota', 'poster', 'roteiristas', 'updatedAt'],
        conflictAttributes: ['tmdb_id']
    });
    ```
*   **Consulta SQL Equivalente (PostgreSQL):**
    Esta operação mapeia diretamente para o recurso avançado **`ON CONFLICT`** do PostgreSQL.
    ```sql
    INSERT INTO filmes (tmdb_id, titulo, ano, genero, sinopse, diretor, nota, "notaPlataforma", poster, roteiristas, "createdAt", "updatedAt")
    VALUES 
        (:tmdb_id_1, :titulo_1, :ano_1, :genero_1, :sinopse_1, :diretor_1, :nota_1, :notaPlataforma_1, :poster_1, :roteiristas_1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (:tmdb_id_2, :titulo_2, :ano_2, :genero_2, :sinopse_2, :diretor_2, :nota_2, :notaPlataforma_2, :poster_2, :roteiristas_2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        -- ... [outros registros do lote] ...
        (:tmdb_id_n, :titulo_n, :ano_n, :genero_n, :sinopse_n, :diretor_n, :nota_n, :notaPlataforma_n, :poster_n, :roteiristas_n, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (tmdb_id) DO UPDATE 
    SET 
        titulo = EXCLUDED.titulo,
        ano = EXCLUDED.ano,
        genero = EXCLUDED.genero,
        sinopse = EXCLUDED.sinopse,
        diretor = EXCLUDED.diretor,
        nota = EXCLUDED.nota,
        poster = EXCLUDED.poster,
        roteiristas = EXCLUDED.roteiristas,
        "updatedAt" = CURRENT_TIMESTAMP;
    ```
    *O que significa `EXCLUDED` no SQL do Postgres?*
    A tabela virtual `EXCLUDED` armazena os valores que você tentou inserir no lote, permitindo que você reatribua os novos valores sobre os registros que sofreram o conflito de chave única (`tmdb_id`).

---

## 5. Resumo das Diferenças e Tradução Automática de Operações

Quando você estuda Bancos de Dados, é fundamental notar que o ORM esconde complexidades estruturais. A tabela abaixo resume como os principais métodos do ORM mapeiam para instruções SQL puras:

| Operação ORM (Sequelize) | Instrução SQL Equivalente | Finalidade Acadêmica |
| :--- | :--- | :--- |
| `Model.create()` | `INSERT INTO ... RETURNING *` | DML: Inserção de dados na base. |
| `Model.findByPk()` | `SELECT ... WHERE id = ...` | DQL: Consulta de linha única por chave primária. |
| `Model.findOne()` | `SELECT ... LIMIT 1` | DQL: Procura o primeiro registro correspondente. |
| `Model.findAll()` | `SELECT ...` | DQL: Procura todas as linhas (com ou sem filtros). |
| `Model.update()` | `UPDATE ... SET ... WHERE` | DML: Modificação de registros existentes. |
| `Model.destroy()` | `DELETE FROM ... WHERE` | DML: Exclusão física de registros do disco. |
| `include: [...]` | `LEFT OUTER JOIN ... ON ...` | DQL: Junção de tabelas baseada em chaves estrangeiras. |
| `bulkCreate(..., { updateOnDuplicate })` | `INSERT ... ON CONFLICT (...) DO UPDATE` | DML: Carga em lote com controle de redundância (UPSERT). |
| `timestamps: true` | `createdAt` e `updatedAt` | Auditoria: Metadados temporais automatizados por triggers/código. |
| `onDelete: 'CASCADE'` | `REFERENCES ... ON DELETE CASCADE` | Integridade: Garante consistência apagando dependências automaticamente. |
