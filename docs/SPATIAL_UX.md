# Experiencia espacial - versao 0.2

Nota de versao: as descricoes abaixo preservam o historico da versao 0.2. Desde 0.4 o percurso renderiza somente ocorrencias ativas em serpentina, sem nos futuros montados. Desde 0.5 ha blur temporario no conteudo interno e camera por card. As especificacoes atuais estao em JOURNEY_REPORT.md e TRANSITIONS.md; o layout estatico continua exclusivo da visao geral.

## Apresentacao

A abertura mostra somente a entrada, a identidade Aptum e Explorar. O canvas ocupa a janela. Sidebar, cabecalho operacional, legenda, minimapa e painel permanentes foram removidos. As alternativas existem como botoes na etapa atual, derivados de `outgoing(flow, id)`. O fluxo operacional e seus IDs nao foram alterados nesta reformulacao.

`FlowCanvas` interpreta o grafo com tres niveis: focused (etapa inspecionada), contextual (descobertas anteriores), dormant (ainda nao descobertas). Nos dormentes permanecem montados para estabilidade espacial, mas sem pointer events, tabulacao ou exposicao de conteudo assistivo. A revelacao usa opacity e transform; nao aplica blur nos textos. Hover e foco de teclado recuperam contraste dos elementos contextuais.

## Estado e navegacao

`exploration.ts` concentra funcoes puras. `journey` conserva cada visita e cada transicao, incluindo repeticoes; sua ultima visita e a posicao operacional atual. `discovered` e um conjunto serializavel de IDs revelados. `focused` representa somente inspecao. O modo de visao geral e um estado de apresentacao separado em App.

- Seguir uma alternativa valida avanca o percurso e descobre o destino.
- Voltar remove uma unica transicao; nao apaga descobertas.
- Clicar, buscar ou inspecionar um no altera o foco, nunca o percurso.
- Fora da posicao operacional, a interface oferece Retomar meu percurso, sem inventar saltos no grafo.
- No historico, Retomar daqui seleciona uma ocorrencia especifica e trunca somente o caminho ativo. Descobertas de outras alternativas permanecem disponiveis.
- Entrar e sair da visao completa conserva foco e percurso.

## Movimento e layout

`layout.ts` define coordenadas permanentes por capitulos (entrada, triagem, preenchimento, investigacao, resolucao, escalonamento e referencias). A camera se desloca; o mapa nao se reorganiza ao avancar. `RevealedEdge` desenha a ultima conexao por stroke-dashoffset, com seta direcional; interpretacoes continuam tracejadas em repouso. Nao ha particulas, animacao infinita ou backdrop-filter por no.

A camera usa a inicializacao do viewport, nao a medicao dos elementos dormentes. Reduced-motion elimina deslocamentos animados e revelacoes. Zoom e minimapa sao opcionais; o minimapa aparece apenas na visao completa com controles habilitados. A atribuicao da biblioteca permanece disponivel.

## Informacao progressiva

Entender esta etapa abre uma unica superficie flutuante, sem reservar largura do canvas. Campos e descricoes existentes aparecem, enquanto fonte e notas ficam em disclosures. Busca e referencias compartilham a superficie Explorar. Historico, ajuda e controles so aparecem por solicitacao. Modos completos, atendimento e registro estao restritos a visao geral.

Tab e Enter permitem escolher caminhos e inspecionar etapas descobertas. `/` abre busca; Escape fecha superficies. O menu contem foco ciclico e permite retornar ao canvas. Em dispositivos menores, o detalhe e uma superficie inferior com rolagem propria. O canvas continua livre para pan e zoom.

## Limites

A visao completa e um mapa secundario de orientacao, nao uma certificacao do processo. As ambiguidades de `FLOW_MAPPING.md` continuam pendentes de homologacao. Nao ha persistencia entre recargas, criterios operacionais novos ou progresso individual. Fontes Google continuam com fallback local. A suite de navegador desta entrega foi executada interativamente; os testes persistidos cobrem dominio e estado de exploracao.