# Tirar duvidas - conteudo local

Esta funcionalidade substitui Explicar com IA. Nao ha provedor, chave, prompt, geracao aleatoria nem envio de mensagens. O servico generativo anterior foi removido. O nome historico CONTEXTUAL_AI.md redireciona para este documento.

`src/data/flows/atendimento-topdesk/faq.ts` armazena StepFAQ com ID estavel, stepId, question, answer, sourceType e sourceRefs. Campos opcionais category e documentationRefs permitem organizar assuntos e vincular POPs no futuro, sem integra-los agora. `questionsForStep` seleciona o catalogo e `answerForStep` rejeita IDs de outras etapas. As 39 etapas/referencias relevantes possuem 3 a 4 perguntas; os tres marcadores de inicio/fim nao recebem perguntas artificiais.

Cada resposta distingue explicitamente No fluxo, Boa pratica e/ou Informacao nao definida. O processo Aptum e a autoridade para sequencias e decisoes. As orientacoes de ITSM sao recomendacoes gerais compativeis com ITIL 4, nao regras locais nem citacoes oficiais do framework. O caminho negativo da validacao nao existe no original: a resposta explicita a lacuna e nao cria uma conexao ficticia.

Fontes consultadas em 2026-11-04:

- Fonte primaria operacional: PNG draw.io e extracao versionada, `docs/FLOW_MAPPING.md` e `documentation.ts`.
- https://www.atlassian.com/itsm/incident-management - registro, classificacao, continuidade e restauracao do servico.
- https://www.atlassian.com/itsm/knowledge-management - conhecimento revisado, reutilizacao e registro.
- https://www.atlassian.com/itsm/service-request-management - distincao entre incidente e requisicao e coleta de contexto.

As tres paginas sao fontes secundarias de ITSM, nao publicacoes oficiais de ITIL. Regras particulares descritas nesses artigos (por exemplo, permissoes de fechamento e aprovacoes) nao foram importadas como regras Aptum. Paginas PeopleCert/Axelos foram consultadas, mas nao forneceram conteudo oficial extraivel suficiente para fundamentar citacoes; nenhuma citacao especifica foi atribuida a elas. Os textos locais sao sinteses originais curtas, sem reproducao extensa.

`DoubtsPanel` mostra uma pergunta como mensagem e, apos 260ms, sua resposta cadastrada. Nao existe texto livre para evitar uma expectativa de conhecimento ilimitado. As outras perguntas permanecem disponiveis. O historico e isolado pela etapa e reiniciado ao fechar ou trocar de etapa; nao e persistido ou incluido no PDF. O temporizador e cancelado ao desmontar. Reduced-motion elimina a espera visual e o deslocamento. A conversa usa log acessivel e rolagem automatica.

Para editar: manter IDs, revisar fatos contra o grafo, indicar lacunas e cadastrar referencias em faqSources. Rodar os testes de cobertura, unicidade e selecao deterministica. Uma eventual integracao generativa futura exigira uma decisao separada de arquitetura e governanca; nao esta implementada nesta versao.