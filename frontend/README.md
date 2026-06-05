# Studio Lash — Frontend

Aplicativo mobile desenvolvido com **React Native + Expo** para gerenciamento de agendamentos de um estúdio de lash design. Roda em iOS, Android e Web a partir de uma única base de código.

---

## Sumário

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Configuração](#configuração)
- [Executando o projeto](#executando-o-projeto)
- [Build para produção](#build-para-produção)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Telas](#telas)
- [Navegação](#navegação)
- [Autenticação](#autenticação)
- [Integração com a API](#integração-com-a-api)
- [Componentes](#componentes)
- [Tema e estilos](#tema-e-estilos)

---

## Tecnologias

| Pacote | Versão |
|---|---|
| React | 19.2.0 |
| React Native | 0.83.2 |
| Expo SDK | ~55.0.8 |
| React Navigation (Native Stack) | ^7.x |
| AsyncStorage | 2.2.0 |
| react-native-keyboard-controller | 1.20.7 |
| react-native-reanimated | ^4.3.0 |
| react-native-vector-icons | ^10.3.0 |
| Expo Google Fonts (Bodoni Moda) | ^0.4.2 |

---

## Pré-requisitos

- [Node.js 18+](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Para iOS: macOS com Xcode instalado
- Para Android: Android Studio com emulador configurado (ou dispositivo físico com Expo Go)

---

## Configuração

A URL da API é lida via variável de ambiente `EXPO_PUBLIC_API_URL`. Os valores padrão estão em `eas.json`:

| Perfil | URL padrão |
|---|---|
| `development` | `http://localhost:5034/api` |
| `preview` / `production` | `https://studio-lash-api.fly.dev/api` |

Para sobrescrever localmente, crie um arquivo `.env.local` na raiz do projeto `frontend/`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:5034/api
```

> Use o IP da sua máquina (não `localhost`) ao testar em dispositivo físico.

---

## Executando o projeto

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento Expo
npm start

# Rodar no Android
npm run android

# Rodar no iOS
npm run ios

# Rodar no navegador
npm run web
```

Após `npm start`, escaneie o QR code com o aplicativo **Expo Go** (disponível na App Store e Google Play).

---

## Build para produção

O projeto usa **EAS Build** (Expo Application Services):

```bash
# Build para Android (APK/AAB)
eas build --platform android

# Build para iOS
eas build --platform ios

# Build para ambas as plataformas
eas build --platform all
```

Perfis disponíveis: `development`, `preview`, `production` (definidos em `eas.json`).

---

## Estrutura do projeto

```
frontend/
├── assets/                  # Ícones, splash screen e imagens
├── src/
│   ├── components/          # Componentes reutilizáveis (Button, Input, BottomMenu…)
│   ├── contexts/            # AuthContext — estado global de autenticação
│   ├── navigation/          # Configuração do React Navigation
│   ├── screens/             # Telas do aplicativo
│   ├── services/            # Camada de chamadas à API (api.js)
│   ├── theme/               # Paleta de cores (colors.js)
│   └── utils/               # Validadores de formulário
├── App.js                   # Componente raiz
├── index.js                 # Entry point
├── app.json                 # Configuração Expo (nome, ícones, bundle ID)
└── eas.json                 # Perfis de build EAS e variáveis de ambiente
```

---

## Telas

| Tela | Descrição |
|---|---|
| **Login** | Autenticação com e-mail e senha |
| **Dashboard** | Visão geral: seletor de data, agendamentos do dia e resumo semanal |
| **Agendamentos** | Lista completa com filtros por status (Agendado, Realizado, Cancelado) |
| **Detalhe do Agendamento** | Visualização e edição de um agendamento; ações de concluir e cancelar |
| **Clientes** | Listagem com busca e agrupamento por letra; criação, edição e remoção de clientes |
| **Perfil do Cliente** | Estatísticas (visitas, ticket médio), histórico de agendamentos e agendamento rápido |
| **Serviços** | Catálogo de serviços com preço e duração; criação, edição e remoção |

---

## Navegação

O projeto usa **React Navigation v7** com `NativeStackNavigator`. A stack exibida muda conforme o estado de autenticação:

```
App
├── Stack não autenticada
│   └── Login
└── Stack autenticada
    ├── Dashboard
    ├── Agendamentos
    ├── AgendamentoDetail
    ├── Clientes
    ├── ClientProfile
    └── Services
```

A troca de stack é controlada pelo `AuthContext`: quando `usuario` é `null`, exibe Login; caso contrário, exibe as telas principais.

---

## Autenticação

O fluxo de autenticação é gerenciado pelo `AuthContext` (`src/contexts/AuthContext.js`):

1. Na inicialização, o app verifica se há um token salvo no **AsyncStorage**
2. Se houver, valida o token chamando `GET /Auth/me`
3. Em caso de sucesso, popula o estado `usuario` e redireciona para o Dashboard
4. `signIn(email, senha)` — chama `POST /Auth/login`, salva token e dados do usuário
5. `signOut()` — limpa AsyncStorage e reseta o estado
6. Qualquer resposta `401` da API dispara `signOut()` automaticamente

Dados persistidos no AsyncStorage:

| Chave | Conteúdo |
|---|---|
| `token` | JWT string |
| `usuario` | JSON com `id`, `nome`, `email`, `role` |

---

## Integração com a API

O arquivo `src/services/api.js` exporta um wrapper sobre o `fetch` nativo com:

- **Injeção automática** do header `Authorization: Bearer {token}`
- **Tratamento de 401** — dispara logout automático
- **Normalização de erros** — retorna mensagens legíveis de erros de validação do backend

Métodos disponíveis: `api.get(path)`, `api.post(path, body)`, `api.put(path, body)`, `api.patch(path, body)`, `api.delete(path)`

A base URL é configurada via `EXPO_PUBLIC_API_URL` (ver seção [Configuração](#configuração)).

---

## Componentes

| Componente | Descrição |
|---|---|
| `Button` | Botão primário (fundo preto) |
| `LitleButton` | Botão secundário pequeno (rose gold) |
| `Input` | Campo de texto com label e exibição de erro |
| `AutocompleteInput` | Campo com dropdown de busca/autocomplete |
| `FieldError` | Exibe mensagem de erro de validação |
| `BottomMenu` | Barra de navegação inferior com ícones |

---

## Tema e estilos

A paleta de cores está centralizada em `src/theme/colors.js`:

| Token | Cor | Uso |
|---|---|---|
| `background` | `#F5F1EC` | Fundo geral (bege claro) |
| `roseGold` | `#B76E79` | Cor primária de destaque |
| `roseGoldLight` | `#D8A7AE` | Variante clara do rose gold |
| `black` | `#111111` | Botões e textos principais |
| `text` | `#1F1F1F` | Texto padrão |
| `mutedText` | `#777777` | Texto secundário |
| `border` | `#E5E0DC` | Bordas e divisores |
| `beige` | `#EFE7DF` | Fundo de cards |

A fonte principal é **Bodoni Moda** (via `@expo-google-fonts/bodoni-moda`), carregada pelo `expo-font` na inicialização do app.
