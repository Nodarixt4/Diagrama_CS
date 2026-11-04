# Assistencia contextual

## Estado atual

Nao existe backend ou provedor configurado. `explanationService.available` e false; o painel declara indisponibilidade e nao faz chamadas de rede. Sugestoes apenas preenchem a pergunta, sem gerar respostas artificiais.

## Contrato de integracao

`src/features/assistance/service.ts` define ExplanationService. Um adaptador autorizado deve implementar `available` e `explain(request, signal)`. AssistancePanel aceita o servico por injecao; o front-end nao precisa conhecer o fornecedor. O adaptador padrao pode ser substituido pelo cliente de um endpoint backend de mesma origem. Nao use chaves VITE_*: qualquer valor desse tipo e publico no navegador.

O payload e construído por buildExplanationRequest: etapa selecionada, descricao existente, campos, notas de interpretacao, conexoes de entrada/saida com condicoes e marcacao de inferencia, visitas e transicoes ordenadas, posicao operacional atual, sinalizacao de inspecao, pergunta e referencias documentais validas. Nenhum dado de chamado real e coletado. A pergunta livre pode conter informacoes sensiveis: nao habilite envio sem autorizacao apropriada, politica de dados e controles de backend.

## Responsabilidades do backend futuro

- Guardar segredos exclusivamente no servidor; autenticar e autorizar usuarios e documentos.
- Validar tamanho, esquema, IDs e versao do grafo; reconstruir contexto canonico, sem confiar em conteudo enviado pelo cliente.
- Tratar pergunta e documentos como dados nao confiaveis, nunca como instrucoes de sistema.
- Consultar somente documentacao autorizada e devolver referencias verificaveis. O registro atual de documentos tem apenas IDs; acesso a conteudo e URLs precisa de implementacao posterior.
- Separar informacao documentada, interpretacao, exemplo hipotetico e limitacoes. Proibir inventar regras, prazos ou criterios internos como oficiais.
- Implementar consentimento/autorizacao de envio, limites de uso, timeout, sanitizacao de logs e politicas de retencao antes de conectar servicos externos.

Explanation separa `documented`, `interpretation`, `hypotheticalExample` e `limitations`. O painel renderiza texto simples com escape React, sem HTML remoto. Requisicoes sao canceladas ao fechar ou mudar contexto; respostas canceladas nao atualizam a tela. Ha estados de carregamento, falha e nova tentativa. A seguranca de um provedor real ainda nao foi implementada nem certificada.