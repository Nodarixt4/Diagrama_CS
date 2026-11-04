# Percurso e relatorio

O grafo operacional permanece em `src/data/flows/atendimento-topdesk/index.ts`. O canvas principal nao utiliza suas coordenadas: `journeyLayout.ts` cria ocorrencias por indice e ID do no. Visitas repetidas sao cards distintos, ligados apenas a ocorrencia seguinte. O modelo de jornada continua armazenando IDs de nos e transicoes, sem duplicar regras operacionais.

Layout web: `webJourneyLayout` define cards 380 x 420 e espaco livre de 420 x 360px; tres colunas a partir de 1400px, duas a partir de 900px e uma abaixo disso. Linhas alternam sentido. A camera conserva escala de leitura e acompanha o card atual, reservando espaco para o painel de duvidas em notebooks. `pdfJourneyLayout` usa milimetros: cards 55 x 75, gaps 7 x 28, preservando seis cards por pagina A4. Apenas a funcao matematica de serpentina e compartilhada. Mudar a largura reorganiza o percurso, sem mudar suas decisoes. Decisoes web usam contorno em losango e paleta amarela sem rotacionar texto ou alterar os handles do canvas.

Voltar remove uma visita e sua transicao, preserva descobertas e reabre as alternativas anteriores. Retomar daqui corta o sufixo do percurso. Inspecao pelo historico usa o indice exato, inclusive quando o mesmo no foi visitado varias vezes.

`documentation.ts` contem descricao, objetivo, contexto e orientacao das 42 etapas/referencias. Esses textos sao interpretacoes didaticas persistidas, nao procedimentos oficiais. Critérios, SLA, autorizacoes e hierarquias ausentes nao foram inventados.

O terminal ativo habilita Exportar PDF, Revisar percurso e Iniciar novamente. Colaborador e chamado sao identificacoes opcionais. O gerador valida entrada, alinhamento de cada transicao e terminal antes de criar o documento. A biblioteca jsPDF e carregada sob demanda; nao ha captura raster do canvas ou envio ao servidor.

O PDF A4 possui somente dois blocos: identificacao/resumo compacto e diagrama visual. O diagrama usa seis cards vetoriais por pagina de serpentina, com escolhas, conexoes interpretadas e marcadores de continuidade. Nao inclui historico textual, observacoes ou area do avaliador depois do diagrama. O nome segue `APTUM_FLOW_Percurso_YYYY-MM-DD_HH-mm.pdf`. Um link nativo de download recebe um Blob PDF; o navegador controla o destino final.

Validacao: 21 testes cobrem integridade, ciclos, bifurcacoes, retorno, cobertura documental e PDF com mais de dez paginas. Build TypeScript/Vite aprovado. Canvas inspecionado em viewports 1920, 1536 e 390px, sem overflow horizontal do documento. Isso nao equivale a um teste fisico de escala Windows 125%.

No navegador integrado, a geracao do Blob application/pdf e a atribuicao do nome ao link foram verificadas. Esse ambiente nao emitiu o evento de download do Playwright; o salvamento final em disco deve ser confirmado em um navegador convencional. Nao foi declarado como validado.