# Editando o fluxo TOPdesk

1. Altere `src/data/flows/atendimento-topdesk/index.ts`. `nodes` descreve etapas; `edges` descreve transicoes; `references` descreve valores auxiliares. IDs sao estaveis e nao devem mudar com o titulo.
2. Para incluir uma etapa, adicione um `FlowStep`: id, title, type, section, sourceIds. Registre somente descricoes sustentadas pela documentacao interna. Campos opcionais incluem fields, note e documentationRefs.
3. Inclua uma aresta com id unico, source e target existentes. Decisoes exigem condicoes preenchidas e unicas. Para dois caminhos negativos com destinos diferentes, use rotulos explicitamente distintos e explique a ausencia de criterio, como em Resolveu?.
4. Posicione o novo ID em `src/features/flow/layout.ts`. A posicao nunca define a ordem do processo; a navegacao depende exclusivamente das arestas.
5. Para remover uma etapa, remova suas arestas e ajuste entrada, layout e atalhos da sidebar se aplicavel. Nao crie atalhos apenas para manter o desenho conectado.
6. Para documentos, cadastre um ID em `flow.documents` antes de adiciona-lo a documentationRefs. A exibicao de links reais precisa de um cadastro com URLs aprovadas; nao existem URLs ficticias nesta versao.
7. Execute `npm test` e `npm run build`. Revise o original e atualize FLOW_MAPPING e CHANGELOG. Teste cada saida alterada em Percorrer atendimento, incluindo retorno e reinicio.

Referencias independentes precisam de `independent: true`. Nao marque atividades inacessiveis como independentes para esconder um erro. Ciclos sao permitidos e nao precisam de tratamento especial no modelo.

`sourceIds` utiliza sufixos dos IDs draw.io, conferidos em `source.json`. Quando uma etapa for editorial e nao estiver na fonte, documente isso explicitamente. `inferred: true` torna a aresta tracejada e sinaliza interpretacao no painel.

Para substituir a imagem original, mantenha seu nome ou ajuste o importador, execute `npm run import:source` e compare o catalogo. Este comando regenera somente as evidencias; revise manualmente o modelo antes de publicar.