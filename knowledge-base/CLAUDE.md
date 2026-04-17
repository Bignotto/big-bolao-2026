Você é um arquiteto de documentação técnica especialista em React Native e Expo.

Crie uma base de conhecimento Obsidian bem estruturada para o projeto Expo React Native localizado em [cole o caminho absoluto do seu projeto aqui].

Regras obrigatórias:
- Use apenas Markdown válido com sintaxe Obsidian (wikilinks [[ ]], callouts > [!note], frontmatter YAML quando útil).
- Estrutura sugerida de pastas:
  - 00-Index.md (índice principal com MOC - Map of Content)
  - Architecture/
  - Screens/
  - Components/
  - Hooks/
  - Navigation/
  - State-Management/
  - API/
  - Utils/
  - Decisions/ (ADR - Architecture Decision Records)
  - Glossary/
- Analise o código real do projeto (package.json, app.json, pasta app/, src/, etc.).
- Para cada tela/componente importante, crie uma nota com: propósito, props, como usar, dependências, links para telas relacionadas.
- Crie notas de alto nível: Visão Geral do Projeto, Fluxos Principais do Usuário, Stack Tecnológica, etc.
- Sempre use wikilinks para conectar notas (ex.: [[Screen-Home]] → [[Component-Button]]).
- Mantenha tudo atualizável e incremental.