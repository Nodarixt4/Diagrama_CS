# Changelog

## 0.4.0 - 2026-11-04

- Percurso dinamico em serpentina com ocorrencias independentes, ciclos e conectores cronologicos.
- Cards 380x420, titulos 25px e controles de leitura ampliados; uma, duas ou tres colunas conforme viewport.
- Documentacao didatica persistida para todas as 42 etapas e referencias.
- Relatorio PDF vetorial A4 sob demanda com validacao do percurso, identificacao opcional, paginacao e historico textual.
- Inspecao e retomada da ocorrencia exata; seis novos testes, totalizando 21 aprovados.
- Detalhes arquiteturais e limites de verificacao em docs/JOURNEY_REPORT.md.

## 0.3.0 - 2026-11-04

- Design system Tech Minimal: IBM Plex Sans, JetBrains Mono, tokens, raios consistentes e conectores ciano com pontas abertas.
- Voltar logico sempre disponivel quando existe transicao anterior, inclusive durante inspecao e visao geral; atalho Alt+SetaEsquerda fora de campos de edicao.
- Assistencia contextual sob demanda, contrato independente de provedor e indisponibilidade explicita sem chamadas externas ou respostas simuladas.
- Testes adicionais de alternativa desfeita e montagem do contexto; 15 testes aprovados.

## 0.2.0 - 2026-11-04

- Substituicao da estrutura de dashboard por canvas espacial em tela cheia.
- Inicio isolado, descoberta progressiva, foco e contexto atenuado; nos dormentes sem interacao.
- Escolhas na propria etapa; conexoes reveladas, camera contextual e movimento reduzido.
- Busca, referencias, historico, notas e visao completa acessiveis sob demanda em Explorar.
- Inspecao separada do percurso: buscar ou revisar nao cria visitas operacionais.
- Retomada de uma ocorrencia especifica do historico, mantendo descobertas anteriores.
- Remocao da sidebar, painel fixo e barra de percurso anterior; 13 testes de dominio.

## 0.1.0 - 2026-11-04

- Primeira versao React/TypeScript do APTUM FLOW.
- Extracao reproduzivel do XML incorporado ao PNG e rastreabilidade de elementos.
- Modelo declarativo com atendimento, preenchimento e referencias auxiliares.
- Canvas React Flow, tres visualizacoes, minimapa, busca e painel contextual.
- Percurso guiado com decisoes, retornos, reinicio e resumo do historico.
- Identidade escura Aptum, responsividade e suporte a movimento reduzido.
- Validacao de integridade, testes de dominio e documentacao de ambiguidades.