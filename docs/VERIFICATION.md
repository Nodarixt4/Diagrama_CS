# Verificacao

## Versao 0.5 - espaco, revelacao e duvidas

- Build TypeScript/Vite e 23 testes aprovados. Testes cobrem todas as etapas relevantes, perguntas unicas, referencias validas, selecao deterministica e impossibilidade de responder com pergunta de outra etapa.
- PDF longo continua passando o teste de mais de dez paginas. Posicoes PDF preservadas: segunda coluna x=62mm e segunda linha y=103mm; web usa passos de 590x600px.
- Navegador renderizado: percurso direto de seis visitas, serpentina com posicoes (0,0), (590,0), (1180,0), (1180,600), (590,600), (0,600).
- Revelacao observada logo apos avanco: opacity 0, blur 10px, translateY 16px e escala .97; escolhas temporariamente desabilitadas. Duplo clique programatico gerou somente uma nova visita.
- Voltar mostrou uma copia de saida inerte, removeu-a ao finalizar e recuperou as alternativas Sim/Nao. Visao geral preservou 42 nos e nao alterou o contador do percurso.
- Pergunta selecionada gerou uma mensagem e sua resposta exata. Mudanca para Ler solicitacao mostrou tres sugestoes distintas e conversa vazia, sem misturar a etapa anterior. Acao Explicar com IA ausente.
- Viewports 1920x1080, 1536x864 e 390x844 inspecionados. Em notebook, painel de 380px permaneceu separado do card ativo. Sem overflow horizontal do documento. Reduced-motion verificado com filter none e transform none no conteudo.
- Geracao web validada com Blob application/pdf de 16789 bytes para o percurso direto e nome padronizado. O clique do link foi interceptado para verificar o contrato; nao se afirma salvamento final em disco pelo navegador integrado.
- Avisos de React Flow durante hot reload de componentes desapareceram como falhas funcionais apos recarga. Build final e diagnosticos do editor sao a referencia para erros de codigo.

## Versao 0.3 - Tech Minimal e assistencia

- TypeScript e build aprovados; 15 testes automatizados de dominio, exploracao e contexto.
- Navegador: Sim em Criaremos -> Voltar -> Nao segue Ler; ciclo Informacoes -> Solicitar -> Informacoes -> Alt+SetaEsquerda recupera Solicitar.
- Retornos consecutivos ate o inicio removem o botao Voltar e restauram Comecar.
- Assistencia em Informacoes identifica quatro visitas, etapa atual e indisponibilidade; envio desabilitado, sugestao preenche a pergunta sem simular resposta.
- Viewport 390x844 sem transbordamento horizontal; painel com raio computado 22px e titulos IBM Plex Sans.
- Reduced-motion utilizado na verificacao de retorno; sem blur por no ou animacoes decorativas continuas. Nao foi realizado benchmark de FPS em hardware corporativo.
- Nenhum provedor externo foi chamado. O payload e verificado em teste unitario; uma integracao real ainda exige backend, autorizacao e validacao de seguranca.

## Versao 0.2 - reformulacao espacial

- Build TypeScript/Vite aprovado e 13 testes de dominio/exploracao aprovados.
- Abertura no navegador: exatamente um no revelado e dois botoes (Explorar e Comecar), sem sidebar nem detalhes abertos.
- Ciclo Inicio -> Criaremos? Nao -> Ler -> Informacoes? Nao -> Solicitar -> Informacoes: seis visitas, cinco nos distintos revelados.
- Visao completa: 42 elementos disponiveis; retorno ao mesmo contexto de exploracao.
- Busca por prioridade: foco em Planejamento sem alterar seis visitas; detalhes com Impacto/Urgencia/Prioridade e retorno ao percurso anterior.
- Viewport 390x844: percurso ate Atendimento concluido, canvas sem transbordamento horizontal. Com reduced-motion, no focado enquadrado dentro do viewport e nos dormentes invisiveis.
- Teclado: artigo contextual recebe foco e recupera contraste; Enter inspeciona sem adicionar visita; Retomar meu percurso restaura posicao operacional; / abre busca e Escape fecha apos a transicao de saida.
- Sem alteracoes em nodes/edges/catalog/source do modelo operacional.

Verificacoes de navegador executadas interativamente; nao ha suite E2E persistida. Avisos de hot reload durante edicao e aviso informativo do Motion sobre reduced-motion nao sao erros de dominio.

## Versao 0.1

Ambiente: Windows, Node.js 24.20.0, npm, navegador integrado do VS Code.

- `npm run build`: TypeScript estrito e Vite concluidos; chunks separados para grafo e animacoes.
- `npm test`: nove testes aprovados (integridade, decisoes, todas as transicoes, erros de cadastro, busca, ciclos e retorno).
- `npm audit`: zero vulnerabilidades na verificacao final das dependencias instaladas.
- Navegador: fluxo inicializado, percurso Inicio -> Criaremos? Nao -> Ler -> Informacoes? Nao -> Solicitar -> Informacoes, confirmando revisita e contador 06.
- Navegador: Voltar e retomar exploracao livre funcionais.
- Busca por prioridade: localizou Planejamento e abriu Impacto, Urgencia, Prioridade no painel.
- Viewport 390x844: sidebar abre e recolhe ao selecionar Estados; painel lista todos os seis estados; nenhuma rolagem horizontal do documento.
- Viewport desktop 1440x900: abertura, busca, canvas, painel e controles verificados.
- Nenhuma excecao JavaScript durante o percurso e a busca verificados.

Os testes de navegador foram executados interativamente nesta entrega, nao constituem uma suite E2E persistida. A inspecao estrutural nao equivale a homologacao do procedimento. Conexoes inferidas ainda precisam de aprovacao operacional; consulte FLOW_MAPPING.