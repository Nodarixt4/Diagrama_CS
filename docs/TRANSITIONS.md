# Transicoes do percurso

`useJourneyTransition` centraliza o evento, serial, jornada anterior, preferencia de movimento reduzido e bloqueio sincrono por ref. O bloqueio impede duplicidade antes do proximo render; escolhas voltam em ate 700ms, sem bloquear inspecao ou Voltar. Voltar interrompe a transicao anterior e atualiza imediatamente a jornada logica.

Camera: 640ms. Conexao: 520ms, pathLength de zero a um, somente a aresta adicionada. Card: delay de 90ms e duracao de 600ms, opacity zero, blur 10px, y 16px e escala .97 ate o estado final. Cards anteriores atenuam em 600ms. Nao ha particulas ou animacoes infinitas. O transform do wrapper React Flow nunca e animado; Motion atua no elemento interno .node-content. Mudancas dos handles de linha/coluna notificam useUpdateNodeInternals para recalcular conexoes.

No retorno, uma copia visual inerte da ultima ocorrencia pode durar 240ms, com aria-hidden e pointer-events none, sem escolhas e sem arestas. Essa copia nao faz parte de state.journey, do contador, da navegacao ou do PDF. O estado logico nao aguarda a animacao. Novo retorno cancela o temporizador anterior.

Reduced-motion e observado por Motion e CSS; elimina blur, deslocamentos e espera visual, e a camera usa duracao zero. A visao geral nao recebe revelacoes de avanco. Layout web e PDF sao configuracoes independentes em journeyLayout.ts.