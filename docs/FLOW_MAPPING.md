# Correspondencia com o original

Fonte: `TOPdesk _ fluxo de atendimento a chamados .drawio.png`. Nenhuma imagem complementar estava presente. A imagem foi inspecionada e seus metadados draw.io extraidos integralmente: 219 elementos, 57 arestas. `source.json` conserva IDs completos, estilos, geometrias e ligacoes, inclusive elementos graficos sem significado sequencial. `catalog.json` contem o catalogo textual compacto. O SHA-256 esta nos dois arquivos.

## Atendimento

| Implementacao (sufixo original) | Correspondencia |
| --- | --- |
| 221 / 422 | Inicio |
| 224 | Criaremos o chamado? Sim 227, Nao 229 |
| 227 / 234 | Levantar necessidades / complexidade suficiente para chamado? |
| 236 / 237 / 424 | Aplicar solucao e fim sem criar chamado |
| 242 | Complexidade suficiente para N2? Sim 245, Nao 247 |
| 245 / 247 / 250 | Novo chamado N2 ou N1, depois preenchimento |
| 229 / 285 / 292 | Ler solicitacao, avaliar informacoes e pedir complemento (ciclo 292 -> 285) |
| 287 / 290 / 299 | Consultar base, encontrou? Sim aplicar |
| 296 / 315 / 317 | Investigar bases externas, encontrou? Sim aplicar, Nao escalonar |
| 303 | Resolveu? Sim documentar, Nao investigar ou escalonar |
| 306 / 309 / 311 / 312 / 423 | Documentar, validar, status Resolvido e fim |
| 320 / 322 / 325 / 341 / 327 | Escalonar N2, mudar grupo, operador, aguardando atendimento, avisar |
| 329 / 330 / 333 | Acompanhar e nota sobre SLA; resolvido? Sim 311, Nao 329 |

As condicoes Sim/Nao aparecem como textos soltos no XML; foram associadas pelas setas e posicoes do desenho. Em 303 o rotulo Nao foi qualificado pelo destino para evitar duas alternativas indistinguiveis, sem inventar criterio de escolha.

## Preenchimento

| No consolidado | Elementos preservados |
| --- | --- |
| 252 Solicitante | 254 Solicitante, 253 Nome/Cliente |
| 256 Detalhes | 258 Detalhes, 257 Breve descricao, 259 Tipo, 260 Categoria, 261 Subcategoria |
| 264 Planejamento | 266 Planejamento, 265 Impacto, 267 Urgencia, 269 Prioridade |
| processing | 273 Processamento, 272 Grupo, 274 Operador, 276 Status |
| 279 / 281 | Preencher campo de texto / Salvar |

As arestas 4, 9 e 339 e os pontos de teleporte 419/420 foram consolidados em Salvar -> Consultar base, conservando todos os IDs. Teleportes nao sao atividades adicionais. Campos internos foram agrupados para legibilidade, sem remover seus textos.

## Referencias

- 342-354: 13 grupos de operadores, inclusive Central, TI, RH e areas administrativas.
- 356-358: Pessoa, Departamento, Empresa (impacto).
- 359-361: Disponivel, Parcialmente disponivel, Nao disponivel (urgencia).
- 364-369: seis estados, de Registrado a Encerrado.
- 372-416: todos os 45 textos de categorias/subcategorias. A lista conserva os rotulos sem impor uma arvore nao declarada por conexoes.
- 355, 363, 370, 417 e 277: marcadores graficos de associacao a grupo, impacto, status, categorias e processamento, respectivamente. Nao tratados como atividades navegaveis.
- 362, 10 e 11: conectores sem source/target, mantidos na evidencia, nao convertidos em transicoes operacionais inventadas.
- 418 e 421: titulos de regioes, substituidos pelas visualizacoes da interface.

## Interpretacoes pendentes de aprovacao

1. Aresta 228 sai de Ler solicitacao, mas so possui targetPoint. A ligacao com Informacoes o suficiente? foi interpretada para integrar a decisao ao percurso; essa decisao nao tem entrada explicita no XML.
2. Aresta 235 termina no fim 237, mas tem apenas sourcePoint. Foi vinculada a Aplicar solucao 236 pela continuidade espacial.
3. Aresta 268 conecta Prioridade a Grupo. O modelo consolida a passagem Planejamento -> Processamento; campos Urgencia e Operador nao possuem cadeia sequencial explicita individual.
4. Arestas 300 e 301 ligam Resolveu? a Documentar, praticamente sobrepostas (uma vermelha). Consolidacao em uma saida Sim, preservando ambos os IDs. As rotas Nao para investigar e escalonar continuam distintas.
5. Acompanhamento orienta vigiar SLA e cobrar operador, conforme nota 330. Nenhum prazo foi criado.
6. O fluxo termina no status Resolvido. Encerrado e apenas referencia; nao se acrescentou encerramento automatico nem regra de validacao negativa ausente.

Estas interpretacoes aparecem na ajuda, no painel e/ou nas linhas tracejadas. O modelo nao deve ser declarado procedimento homologado antes de confirmacao pela equipe Aptum. Nao ha responsaveis por etapa, exemplos, POPs ou criterios de prioridade suficientes na fonte para preencher esses conteudos.