# GameHub - Testes de regressão e validação

## Reproduzindo os bugs antes da correção

1. Inicialize o banco com `npm run init-db` em `back/`.
2. Inicie o backend e o frontend.
3. Faça login com a conta administrativa (`admin@gamehub.local` / `123456`).
4. Abra o catálogo e teste os cenários abaixo:
   - Digite `console` no campo de busca e observe quantas requisições `GET /products` são disparadas enquanto a digitação acontece.
   - Selecione uma categoria e confirme se o filtro não retorna apenas os itens daquela categoria.
   - Ordene por preço crescente e depois decrescente e confirme se o resultado não segue a ordem numérica correta.
   - Cadastre e exclua um produto e observe se a página reexecuta a listagem completa do catálogo em vez de atualizar apenas o estado local.
   - Abra o dashboard e verifique as consultas no terminal do backend; a implementação original faz várias consultas sequenciais e processa os dados em múltiplos passos.
5. Registre, em cada cenário, a quantidade de itens carregados, a quantidade de requisições e o tempo observado no navegador.

## Testes de regressão

- [ ] Pesquisa por nome e descrição com debounce.
- [ ] Filtro por categoria corretamente aplicado no backend.
- [ ] Ordenação por nome e por preço em ordem crescente/decrescente.
- [ ] Paginação com `limit`/`page` ou `offset` funcionando no backend e no frontend.
- [ ] Cadastro e exclusão sem refetch completo do catálogo.
- [ ] Dashboard retornando indicadores agregados em poucas consultas.
- [ ] Índices de `nome`, `categoria` e `preco` presentes após a execução do script de inicialização.
- [ ] Acesso administrativo bloqueado para aluno e permitido para administrador.

## Verificação após a correção

1. Com a mesma base e o mesmo navegador, repita os passos acima.
2. Confirme que a busca dispara apenas uma requisição após o atraso configurado (300-500 ms).
3. Confirme que o catálogo responde com lotes paginados, sem renderizar 60.000 itens em um único DOM.
4. Confirme que os produtos são exibidos em ordem correta por preço e por categoria.
5. Confirme que o dashboard retorna todos os indicadores em uma consulta agregada ou em poucas consultas otimizadas.
6. Registre em notas locais os tempos e as contagens; o objetivo é comparar o comportamento antes e depois da correção, sem inventar resultados.

## Cenários obrigatórios para a versão resolvida

1. `npm run init-db` deve recriar os índices de `name`, `category` e `price` no PostgreSQL.
2. O endpoint de listagem deve suportar paginação e não carregar todos os 60.000 produtos numa única resposta.
3. A listagem deve respeitar filtro combinado por categoria, busca e preço.
4. A ordenação por preço deve ser numérica, não lexical.
5. O dashboard deve ser calculado com agregações nativas do SQL.
6. O frontend deve renderizar somente a página atual e não o catálogo completo no mesmo momento.
