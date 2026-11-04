# APTUM FLOW

Atualizacao 0.5: percurso web com espaco negativo ampliado e revelacao coordenada de camera, conexao e card. Tirar duvidas usa perguntas e respostas locais, sem IA generativa ou API. Consulte `docs/CONTEXTUAL_AI.md` e `docs/JOURNEY_REPORT.md`. O PDF permanece compacto e independente do layout web. As fontes atuais sao IBM Plex Sans e JetBrains Mono (Google Fonts, fallback local).

Plataforma local de aprendizagem do atendimento TOPdesk da Central de Servicos Aptum. React 19, TypeScript estrito, Vite, React Flow, Motion e Lucide. Sem backend, autenticacao ou integracao com sistemas internos.

## Executar

Requer Node.js 22.18+ (validado com 24.20) e npm. Instale com `npm install` e execute `npm run dev`. No PowerShell com scripts bloqueados, use `npm.cmd install` e `npm.cmd run dev`. O endereco local e exibido pelo Vite.

- `npm run build`: TypeScript e build em `dist/`.
- `npm run preview`: servir o build local.
- `npm test`: testes do grafo, decisoes, busca e historico.
- `npm run import:source`: extrair novamente os metadados do PNG original. Nao altera automaticamente as decisoes de modelagem.
- `npm audit`: auditoria das dependencias.

## Experiencia

Canvas espacial em tela cheia: somente o inicio aparece na abertura. As etapas e conexoes sao descobertas conforme o percurso, com escolhas contextuais e foco de camera. Explorar oferece busca, referencias, historico e visao completa sob demanda. Os recortes completo, atendimento e registro ficam na visao geral; zoom e minimapa sao opcionais. Detalhes surgem somente ao solicitar Entender esta etapa.

Buscar e inspecionar nao alteram o percurso operacional. Retomar meu percurso devolve ao ponto atual; Retomar daqui no historico permite seguir outra alternativa a partir de uma visita especifica. Ciclos e descobertas anteriores sao preservados. Veja `docs/SPATIAL_UX.md` para os estados e decisoes de interacao.

O fluxo completo deve ser usado para navegar entre atendimento e registro. Recortes nao inventam atalhos. As linhas tracejadas identificam interpretacoes do original. Consulte as notas de fidelidade antes de utilizar como material operacional aprovado.

## Organizacao

- `src/data/flows/atendimento-topdesk/`: catalogo, fonte original e modelo declarativo.
- `src/features/flow/`: tipos, layout independente, validacao, canvas e painel.
- `src/features/guided-tour/`: controles do percurso.
- `src/app/`: composicao do workspace.
- `src/styles/`: tokens, temas semanticos e responsividade.
- `src/tests/`: testes automatizados.
- `scripts/import-source.mjs`: extracao reproduzivel do PNG.

Consulte `docs/EDITING_FLOWS.md` para editar o processo e `docs/FLOW_MAPPING.md` para a correspondencia e ambiguidades.

## Limites desta versao

A fidelidade textual vem do XML incorporado ao PNG. Algumas setas exigem interpretacao documentada e validacao da equipe Aptum. Nao ha procedimentos complementares inventados, calculo de prioridade, integracoes, editor ou persistencia de progresso. O logotipo e uma assinatura tipografica provisoria, nao um arquivo oficial. As fontes web DM Sans e Space Grotesk usam Google Fonts, com fallback local quando indisponiveis. Os testes automatizados cobrem o dominio; a interface e verificada separadamente no navegador.

O repositorio ja possui Git. Nenhum commit e criado automaticamente. Mantenha o PNG original, `source.json`, `catalog.json` e o lockfile versionados para revisoes rastreaveis.