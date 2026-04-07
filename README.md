# App-controle-financeiro

## 📝 Descrição do Projeto: Finanças Seven
O **Finanças Seven** é um ecossistema de gestão financeira pessoal focado em **privacidade e performance**. Diferente de apps tradicionais que dependem de APIs lentas e conexão constante, este projeto utiliza uma arquitetura **Offline-First**.
### Diferenciais Técnicos:
 * **Arquitetura PWA:** Instalável em Android, iOS e Desktop, funcionando sem barra de navegação e com carregamento instantâneo via Service Workers.
 * **Edge Computing & Local Storage:** Os dados não residem em um servidor centralizado; eles são armazenados no navegador do usuário via **IndexedDB** (através da biblioteca Dexie), garantindo que o usuário tenha controle total e privacidade sobre seus gastos.
 * **Visualização de Dados Avançada:** Utiliza diagramas de **Sankey** para mapear o fluxo de caixa, permitindo identificar visualmente para onde cada centavo do salário está sendo drenado.
 * **Stack Moderna:** Construído com **Next.js 15**, **TypeScript**, **Tailwind CSS** e **Shadcn/UI**, otimizado para Core Web Vitals.
## 🚀 README.md (Pronto para o GitHub)
```markdown
# 💰 Finanças Seven - Controle Financeiro PWA

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![PWA](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge&logo=pwa)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

O **Finanças Seven** é uma aplicação de controle financeiro pessoal moderna, desenvolvida para ser rápida, privada e acessível de qualquer lugar, mesmo sem internet.

## ✨ Demonstração
O projeto está publicado na Vercel: [app-controle-financeiro-seven.vercel.app](https://app-controle-financeiro-seven.vercel.app)

## 🛠️ Tecnologias
- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados Local:** Dexie.js (Wrapper para IndexedDB)
- **Estilização:** Tailwind CSS + Shadcn/UI
- **Gráficos:** @nivo/sankey (Visualização de fluxo de caixa)
- **PWA:** Service Workers customizados para cache offline e instalação nativa.

## 🔋 Funcionalidades
- **Instalação Nativa (PWA):** Adicione à tela inicial do seu celular ou desktop.
- **Modo Offline:** Cadastre gastos no metrô ou em lugares sem sinal; os dados sincronizam com o banco local instantaneamente.
- **Gráfico de Sankey:** Visualize a origem das suas receitas e o destino detalhado de cada despesa.
- **Gestão de Categorias:** Personalize suas fontes de renda e tipos de gastos.
- **Privacidade Total:** Seus dados financeiros nunca saem do seu dispositivo.

## 📦 Como rodar o projeto localmente

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/financas-seven.git](https://github.com/seu-usuario/financas-seven.git)

```
 2. **Instale as dependências:**
   ```bash
   npm install
   
   ```
 3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   
   ```
 4. **Acesse no navegador:**
   http://localhost:3000
## 📱 Configuração PWA
Para garantir a instalabilidade no celular, certifique-se de que:
 * O arquivo manifest.json na pasta public está com os ícones PNG configurados.
 * O Service Worker está sendo registrado no layout.tsx.
 * O acesso está sendo feito via **HTTPS** (em produção).
## 📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.
Desenvolvido por **Eduardo Lopes** 🚀
```
