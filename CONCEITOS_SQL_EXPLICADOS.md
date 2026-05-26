# 📘 Conceitos Fundamentais de SQL Explicados

Este documento reúne explicações detalhadas, didáticas e práticas para os quatro principais conceitos e termos técnicos de banco de dados abordados em nossas dúvidas sobre o arquivo [MAPEAMENTO_SQL_PURO.md](file:///c:/projetos/filmesBD/MAPEAMENTO_SQL_PURO.md).

---

## 1. Parâmetros Nomeados (`:id`)

### O que são?
O símbolo de dois pontos seguido de um nome (como `:id`, `:email` ou `:senha`) representa um **parâmetro nomeado** (também chamado de *placeholder*, *bind variable* ou marcador de posição). Ele atua como uma **variável temporária** na consulta SQL.

### Como funciona na prática?
Em vez de construir consultas estáticas colando os valores diretamente na string do código (o que é perigoso e ineficiente), a consulta é escrita de forma genérica:

```sql
SELECT id, nome, email 
FROM usuarios 
WHERE id = :id;
```

Quando a aplicação executa essa consulta (por exemplo, quando o Sequelize faz `UsuarioModel.findByPk(42)`):
1. A estrutura da consulta (`SELECT ... WHERE id = :id`) é enviada ao banco de dados.
2. O valor real (`42`) é enviado separadamente em um objeto como `{ id: 42 }`.
3. O driver do banco de dados une as duas partes de forma segura antes de rodar a busca.

### Principais Benefícios:
*   **Segurança Máxima (Prevenção de SQL Injection):** Evita que dados de entrada do usuário sejam interpretados como comandos SQL maliciosos pelo banco. O valor de `:id` será tratado exclusivamente como um dado.
*   **Performance (Reuso de Planos de Execução):** O banco de dados compila e otimiza a consulta uma única vez na memória. Quando outros usuários fizerem a mesma busca com IDs diferentes, o banco reutiliza o mesmo plano de execução compilado, economizando processamento.

---

## 2. A Cláusula `RETURNING` (Exclusivo do PostgreSQL)

### O que é?
No SQL padrão, comandos que gravam informações (como `INSERT`, `UPDATE` e `DELETE`) apenas realizam a ação no disco e devolvem o status da operação (ex: *"1 linha inserida"*). 

A cláusula **`RETURNING`** do PostgreSQL permite que essas operações de escrita devolvam colunas e dados dos registros afetados na mesma hora, funcionando exatamente como um `SELECT` embutido.

### Exemplos Práticos:

*   **Ao criar um registro (`INSERT`):**
    Útil para recuperar o `id` gerado automaticamente pelo banco (auto-incremento ou UUID) ou datas padrões criadas no momento da inserção (`createdAt`).
    ```sql
    INSERT INTO usuarios (nome, email) 
    VALUES ('Lucas', 'lucas@email.com') 
    RETURNING id, "createdAt";
    ```

*   **Ao atualizar um registro (`UPDATE`):**
    Útil para recuperar a data da última modificação ou conferir se a atualização foi gravada corretamente.
    ```sql
    UPDATE usuarios 
    SET nome = 'Lucas Silva' 
    WHERE id = 5 
    RETURNING nome, "updatedAt";
    ```

*   **Ao deletar um registro (`DELETE`):**
    Útil para ler todos os dados da linha que acabou de ser apagada (para fins de auditoria ou backup).
    ```sql
    DELETE FROM usuarios 
    WHERE id = 5 
    RETURNING *;
    ```

### Principais Benefícios:
*   **Menos viagens ao banco (Roundtrips):** Não é necessário enviar duas requisições separadas (primeiro um `INSERT`, depois um `SELECT`). Uma única conexão resolve tudo.
*   **Segurança contra concorrência:** Garante de forma absoluta que o ID retornado pertence exatamente à linha que o seu comando acabou de criar, prevenindo problemas em aplicações com múltiplos acessos simultâneos.

---

## 3. `LEFT OUTER JOIN` (ou apenas `LEFT JOIN`)

### O que é?
O `LEFT OUTER JOIN` é um comando de junção de tabelas que garante que **todas as linhas da tabela principal (a da esquerda) sejam retornadas**, mesmo que não exista nenhuma correspondência na tabela secundária (a da direita).

*   **Tabela da Esquerda:** A que aparece **antes** da palavra-chave `LEFT JOIN`.
*   **Tabela da Direita:** A que aparece **depois** da palavra-chave `LEFT JOIN`.

```sql
FROM filmes AS f                       -- <- ESQUERDA (Principal)
LEFT OUTER JOIN avaliacoes AS a        -- <- DIREITA (Secundária)
  ON f.id = a."filmeId"
```

### Diferença Visual entre `INNER JOIN` e `LEFT JOIN`:

Imagine que temos o filme **"O Poderoso Chefão 4"**, que acabou de estrear e ainda **não tem nenhuma avaliação** no banco de dados.

*   **Usando `INNER JOIN`:** O filme **"O Poderoso Chefão 4" é excluído do resultado** porque o banco exige que a linha exista nas duas tabelas simultaneamente.
*   **Usando `LEFT JOIN` (Comportamento correto):** O filme **"O Poderoso Chefão 4" continua aparecendo na lista**. Os campos das colunas de avaliações (como a nota ou o comentário) virão preenchidos com **`NULL`** (vazio).

### Por que isso é vital em nosso projeto?
Quando um usuário visita a página de detalhes de um filme recém-cadastrado no site, a página precisa carregar a ficha técnica do filme normalmente. Graças ao `LEFT OUTER JOIN`, a ficha é exibida e o bloco de avaliações simplesmente aparece vazio (em vez de ocultar o filme ou estourar um erro na página).

> [!NOTE]
> `LEFT JOIN` e `LEFT OUTER JOIN` são sinônimos perfeitos no SQL. O termo `OUTER` é opcional.

---

## 4. `LIMIT` e `OFFSET` (Paginação de Resultados)

### O que são?
São parâmetros SQL utilizados em conjunto para criar sistemas de **paginação** de dados. Eles evitam sobrecarregar a memória do servidor e do navegador trazendo milhares de registros de uma só vez.

*   **`LIMIT`:** Define a quantidade máxima de registros que a consulta deve trazer (ou seja, o tamanho da página).
*   **`OFFSET`:** Define quantas linhas a consulta deve pular no início antes de começar a devolver os resultados.

### Exemplo Prático de Funcionamento:
Imagine uma listagem com **10 filmes por página** (`LIMIT = 10`):

*   **Página 1 (Filmes de 1 a 10):**
    Queremos os primeiros 10 filmes. Não precisamos pular nada.
    ```sql
    LIMIT 10 OFFSET 0;
    ```
*   **Página 2 (Filmes de 11 a 20):**
    Queremos os próximos 10. Pulamos os 10 primeiros da Página 1.
    ```sql
    LIMIT 10 OFFSET 10;
    ```
*   **Página 3 (Filmes de 21 a 30):**
    Queremos os próximos 10. Pulamos os 20 primeiros das Páginas 1 e 2.
    ```sql
    LIMIT 10 OFFSET 20;
    ```

### Fórmula de Cálculo no Backend:
O cálculo do deslocamento (`OFFSET`) é calculado programaticamente no Node.js a partir do número da página atual que o usuário clicou:

$$\text{OFFSET} = (\text{Página Atual} - 1) \times \text{Limite por Página}$$
