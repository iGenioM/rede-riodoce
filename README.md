# CEASA Digital — Protótipo de Marketplace Agrícola

Protótipo funcional (Next.js 16 + React 19 + TypeScript + Tailwind v4) de um marketplace estilo "CEASA online" que conecta produtores de assentamentos rurais a compradores da região. 100% front-end, com dados mockados e persistência local — **sem backend real**, conforme escopo do MVP.

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000 — a rota inicial (`/`) redireciona para o onboarding/login. Escolha **Comprador** ou **Produtor** para entrar (não há senha real, é só um mock de autenticação).

Para gerar o build de produção:

```bash
npm run build
npm run start
```

> Este projeto usa **Next.js 16 com App Router e Turbopack**. Se for pedir ajuda a uma IA de código (Cursor, Claude Code, etc.), aponte-a para `node_modules/next/dist/docs/` antes de editar — várias APIs (params assíncronos, `proxy` no lugar de `middleware`, etc.) mudaram desde versões anteriores do Next.

## Stack

- **Next.js 16** (App Router, Turbopack, Server/Client Components)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** (tokens de tema em `src/app/globals.css`)
- **Zustand** com `persist` (localStorage) para todo o estado — carrinho, pedidos, produtos, avaliações, chat, notificações e sessão
- **React Leaflet + OpenStreetMap** para o mapa interativo (sem necessidade de chave de API)
- **PWA offline-first** artesanal: `public/manifest.json` + `public/sw.js` (service worker cache-first para assets, network-first com fallback para navegação)
- **lucide-react** para ícones

Não há NestJS nem qualquer backend: todos os dados (produtores, produtos, pedidos, avaliações, conversas) são mockados em `src/lib/mockData.ts` e manipulados inteiramente no cliente, com persistência em `localStorage` via Zustand — simulando "sincronização" entre telas sem precisar de servidor.

## Estrutura

```
src/
  app/                  # rotas (App Router)
    login/               → autenticação mock (escolhe Comprador ou Produtor)
    home, busca, mapa,
    produtores/[id],
    produto/[id],
    carrinho, checkout,
    pedidos, pedidos/[id],
    perfil, notificacoes,
    chat, chat/[id]       → fluxo do COMPRADOR
    painel/                → fluxo do PRODUTOR (dashboard, produtos, pedidos,
                              área de atuação, avaliações, perfil)
  components/            # componentes de UI e de domínio reutilizáveis
  lib/
    types.ts             # tipos centrais do domínio
    mockData.ts           # seed de produtores, produtos, pedidos, avaliações…
    geo.ts                # cálculo de distância (Haversine)
    store/                # stores Zustand (um por domínio)
  providers/             # registro do service worker + hidratação da sessão
public/
  manifest.json, sw.js, icons/   # PWA
```

## Funcionalidades implementadas

### Alternância de perfil
O mesmo usuário pode alternar a qualquer momento entre **Comprador** e **Produtor** (botão no header do painel do produtor, no perfil do comprador, ou reentrando pelo login). O produtor "dono" da conta no protótipo é o *Sítio Boa Esperança* — dá pra testar os dois fluxos lado a lado sem precisar de duas contas.

### Fluxo do Comprador
- Home com categorias, banners, mais vendidos e produtores próximos
- Busca com filtros (categoria, orgânico, ordenação por preço/distância/vendas)
- **Ofertas por produto**: o mesmo produto (ex. Alface Crespa) pode ser vendido por vários produtores diferentes. O card mostra "N ofertas" e "a partir de R$X"; ao abrir, uma tela compara todas as ofertas (preço, distância, nota do produtor) lado a lado antes de escolher qual produtor comprar
- Mapa interativo com todos os produtores e distância calculada a partir do endereço do comprador
- Página do produtor (produtos, avaliações, certificações, distância, chat/WhatsApp)
- Carrinho multi-produtor (compra de vários produtores na mesma sessão, com frete calculado por distância para cada um)
- Checkout que **divide o pedido por produtor** automaticamente
- Histórico de pedidos com linha do tempo de status e avaliação pós-entrega
- Chat com os produtores e notificações

### Fluxo do Produtor
- Dashboard com métricas (pedidos pendentes, produtos ativos, nota média, faturamento)
- CRUD completo de produtos (nome, categoria, preço, unidade, estoque, orgânico, "foto")
- Gestão de pedidos recebidos: aceitar, recusar (com motivo), avançar status (preparando → a caminho → entregue), definir previsão de entrega
- Raio de atuação geográfica ajustável, visualizado no mapa
- Avaliações recebidas com resposta pública
- Perfil editável (nome da propriedade, bio, WhatsApp)

### Fotos profissionais (geradas por IA)
- Todos os 36 produtos e as fotos de produtores/compradores usam fotos profissionais geradas via IA (Higgsfield), em vez de emoji
- As fotos são carregadas de uma URL externa (CDN). Se a foto falhar (ex.: sem internet e sem cache), o app cai automaticamente pro placeholder de gradiente + emoji — a UI nunca quebra
- O service worker faz cache-first dessas fotos também, então depois da primeira visita elas continuam aparecendo offline

### PWA offline-first
- Instalável (manifest + ícones maskable/any)
- Service worker com cache-first para assets estáticos e fotos, e network-first com fallback offline para navegação
- Mesmo sem cache de uma foto específica, o placeholder de gradiente + emoji garante que a interface nunca fica quebrada offline

## Observações sobre o protótipo

- Todos os dados ficam salvos apenas no `localStorage` do navegador (por store: carrinho, pedidos, produtos, avaliações, chat, notificações e sessão). Limpar os dados do site reseta o protótipo para o estado inicial.
- Endereço do comprador e localização dos produtores usam coordenadas reais do Sul de Minas Gerais (Lavras e cidades vizinhas), então as distâncias calculadas no mapa são geograficamente coerentes.
- Pagamento no checkout é apenas seleção de forma de pagamento (Pix/Cartão/Dinheiro) — não há processamento real.
- **Compradores são estabelecimentos (CNPJ)**, não pessoas físicas: o protótipo já vem com 3 estabelecimentos de exemplo (Hortifruti Sabor da Terra — logado por padrão —, Mercado Bom Preço e Verdurão Central), cada um com razão social, CNPJ, pessoa de contato e foto. Do lado do produtor, os pedidos recebidos mostram claramente qual CNPJ fez a compra.
- Ao criar um produto novo pelo painel do produtor com o mesmo nome de um produto já existente (ex. outro "Tomate Salada"), ele automaticamente vira mais uma "oferta" daquele produto, agrupado junto com os demais.
