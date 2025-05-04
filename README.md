# DeepFocus - Pomodoro Timer

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.en.md)

<div align="center">
  <img src="public/favicon.ico" alt="DeepFocus Logo" width="120" height="120" />
  <p><em>Maximize sua produtividade e foco</em></p>
</div>

## 📋 Sobre

DeepFocus é um aplicativo moderno de temporizador Pomodoro que ajuda você a se concentrar melhor em suas tarefas através de ciclos de trabalho e pausas temporizadas. Desenvolvido com tecnologias modernas como Next.js e Tailwind CSS, oferece uma experiência de usuário agradável com um design elegante e recursos personalizáveis.

A técnica Pomodoro é um método de gerenciamento de tempo que utiliza períodos alternados de trabalho focado e pausas para melhorar a produtividade mental e reduzir a fadiga.

## ✨ Características

- 🕰️ **Ciclos Personalizáveis**: Ajuste os tempos de foco, pausa curta e pausa longa conforme suas necessidades
- 🔄 **Transição Automática**: Opção para alternar automaticamente entre ciclos de foco e pausa
- 📱 **Modo Foco**: Interface minimalista para máxima concentração
- 🌓 **Design Moderno**: Interface escura elegante com gradientes e partículas animadas
- 🔔 **Notificações**: Alertas sonoros configuráveis ao final de cada ciclo
- 🌎 **Multilíngue**: Suporte completo para Português e Inglês
- ⌨️ **Atalhos de Teclado**: Controle rápido através de teclas de atalho
- 📊 **Rastreamento de Ciclos**: Visualize seu progresso nos ciclos de trabalho
- 🔍 **Modo Tela Cheia**: Elimine distrações e foque apenas no temporizador
- 💾 **Persistência**: Suas configurações são salvas automaticamente

## 🛠️ Tecnologias

- **[React 18](https://reactjs.org/)**: Biblioteca JavaScript para construção de interfaces
- **[Next.js 13.5](https://nextjs.org/)**: Framework React para aplicações web
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS para design rápido e responsivo
- **[Framer Motion](https://www.framer.com/motion/)**: Biblioteca para animações fluidas
- **[LocalStorage API](https://developer.mozilla.org/pt-BR/docs/Web/API/Window/localStorage)**: Para persistência de dados do usuário

## ⌨️ Atalhos de Teclado

| Tecla    | Função                          |
|----------|----------------------------------|
| Espaço   | Iniciar/Pausar o temporizador   |
| R        | Reiniciar o ciclo atual         |
| N        | Pular para o próximo ciclo      |
| S        | Abrir/Fechar configurações      |
| F        | Entrar/Sair do modo tela cheia  |
| M        | Ativar/Desativar modo foco      |
| H        | Abrir tutorial de onboarding    |
| ESC      | Fechar modais abertos           |

## 🚀 Começando

Estas instruções permitirão que você obtenha uma cópia do projeto em operação na sua máquina local para fins de desenvolvimento e teste.

### Pré-requisitos

- Node.js (versão 14.x ou superior)
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/deep-focus.git
cd deep-focus

# Instale as dependências
npm install
# ou
yarn install

# Inicie o servidor de desenvolvimento
npm run dev
# ou
yarn dev
```

Acesse `http://localhost:3000` no seu navegador para ver o aplicativo em execução.

### Construindo para produção

```bash
# Gere a build de produção
npm run build
# ou
yarn build

# Inicie o servidor de produção
npm start
# ou
yarn start
```

## 🧪 Testes

```bash
# Execute os testes
npm run test
# ou
yarn test
```

## 🧑‍💻 Autor

**Raul Lize** - [Github](https://github.com/Raullize) - [Portfolio](https://raul-lize-portfolio.vercel.app)

## 🙏 Agradecimentos

- Obrigado a todos que utilizam este aplicativo para melhorar sua produtividade
- Inspirado pela [Técnica Pomodoro](https://francescocirillo.com/pages/pomodoro-technique) criada por Francesco Cirillo 