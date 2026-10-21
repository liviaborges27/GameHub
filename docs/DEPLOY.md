# Deploy do frontend na Vercel

O frontend deste repositorio usa Next.js 15 com React. A variavel publica e
`NEXT_PUBLIC_API_URL`, acessada por `process.env.NEXT_PUBLIC_API_URL`.
`import.meta.env.VITE_API_URL` e exclusivo do Vite e nao se aplica a este projeto.
Login, produtos e dashboard usam o cliente HTTP central em `front/src/fetch/api.ts`.

## Desenvolvimento local

Na raiz do repositorio, execute:

```powershell
Copy-Item .env.example front/.env.local
npm run dev
```

O frontend usa a porta 3000; a API usa a porta 3001 e o prefixo `/api`.
O exemplo aponta para `http://localhost:3001/api`. Reinicie o frontend apos
alterar as variaveis de ambiente. O Next.js le os arquivos `.env` em `front/`,
nao na raiz deste repositorio. `front/.env.local` ja e ignorado pelo Git.

## Configuracao da Vercel

1. Conecte o repositorio e selecione **Root Directory: `front`**.
2. Selecione **Framework Preset: Next.js**. O arquivo `front/vercel.json`
   define `npm ci` e `npm run build`. Deixe o Output Directory no padrao `.next`.
3. Em **Environment Variables**, cadastre
   `NEXT_PUBLIC_API_URL=https://seu-backend.exemplo.com/api` nos ambientes
   Production e Preview que voce utiliza. Troque o dominio pelo da API publicada.
4. Na hospedagem do backend, defina
   `FRONTEND_URL=https://seu-projeto.vercel.app`, sem barra final, e reinicie a API.
   Para autorizar tambem uma URL de Preview, separe as origens por virgula.
5. Faca um novo deploy apos definir ou alterar `NEXT_PUBLIC_API_URL`: seu valor
   e incorporado ao JavaScript durante o build. A API precisa estar publicada
   e acessivel via HTTPS; `localhost` no navegador aponta para o computador do visitante.
6. Teste login, listagem de produtos, dashboard e a atualizacao direta de
   `/products`, `/dashboard` e `/login`.

O `vercel.json` na raiz registra o framework. Como o Root Directory e `front`,
o arquivo efetivamente aplicado ao deploy e `front/vercel.json`.
O roteamento do Next.js atende as subrotas diretamente. Nao ha rewrite para
`/index.html`, pois este projeto nao produz uma SPA Vite com esse arquivo.
Este deploy publica o frontend; o backend Express precisa de hospedagem propria.

## Git e redeploy

Ha outras alteracoes locais no repositorio. Revise o diff e adicione somente os
arquivos deste preparo para deploy:

```powershell
git status
git diff
git add .env.example vercel.json front/vercel.json front/src/fetch/api.ts front/eslint.config.mjs front/package.json front/package-lock.json back/infra/config/environment.ts back/src/app.ts docs/DEPLOY.md
git diff --cached
git commit -m "Configura deploy do frontend Next.js na Vercel"
git push origin main
```

`front/package-lock.json` ja tinha alteracoes locais antes deste preparo:
se quiser separa-las, use `git add -p front/package-lock.json` em vez de adicionar
o arquivo inteiro. Revise tambem qualquer arquivo que ja estivesse no staging.

Com a integracao Git ativa, o push inicia um deploy. Para repetir manualmente,
abra **Deployments**, escolha o deploy correspondente e clique em **Redeploy**.
Publique tambem a alteracao de CORS no backend.

Referencias oficiais:
- https://nextjs.org/docs/pages/guides/environment-variables
- https://vercel.com/docs/builds/configure-a-build
- https://nextjs.org/docs/15/app/api-reference/config/eslint
