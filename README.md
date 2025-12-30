# Puxa Conversa Casal ❤️

Jogo de cartas digital para casais, focado em promover conexão, intimidade e diálogos profundos. Desenvolvido com React, TailwindCSS e Vite.

## 🚀 Funcionalidades

- **100 Perguntas Originais**: Divididas em categorias (Leve, Emocional, Picante, Futuro, Reflexão).
- **Modo Jogo**: Alternância automática de turnos (Jogador 1 / Jogador 2).
- **Favoritos**: Salve as perguntas que mais gostaram (persistem no navegador).
- **Design Romântico**: Interface elegante, animações suaves e modo dark temático.
- **PWA**: Pode ser instalado no celular como um aplicativo nativo.

## 🛠️ Tecnologias

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) (Animações)
- [Lucide React](https://lucide.dev/) (Ícones)

## 📦 Como Rodar Localmente

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Rode o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Acesse**:
   Abra `http://localhost:5173` no seu navegador.

## 🚢 Como Fazer Deploy na Vercel

1. Crie uma conta em [Vercel.com](https://vercel.com).
2. Instale o [Vercel CLI](https://vercel.com/docs/cli) ou conecte seu repositório GitHub.
3. **Deploy Automático (via GitHub)**:
   - Suba este código para um repositório no GitHub.
   - Na Vercel, clique em "Add New Project" e import o repositório.
   - A Vercel detectará automaticamente que é um projeto Vite.
   - Clique em "Deploy".

4. **Deploy Manual (via CLI)**:
   ```bash
   npm run build
   npx vercel
   ```

## 📝 Como Editar as Perguntas

O banco de perguntas fica no arquivo:
`src/data/questions.json`

O formato é:
```json
{
  "id": 101,
  "category": "leve", // Opções: leve, emocional, picante, futuro, reflexao
  "text": "Sua nova pergunta aqui"
}
```
Basta adicionar ou remover itens neste arquivo. O jogo carregará automaticamente.

## 📱 Instalar no Celular (PWA)

1. Acesse o site pelo navegador (Chrome/Safari).
2. Toque em "Compartilhar" (iOS) ou Menu (Android).
3. Escolha "Adicionar à Tela de Início".
