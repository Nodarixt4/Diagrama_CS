# Arquitetura implementada

## Atualizacao 0.2 - descoberta espacial

A camada de apresentacao anterior descrita a seguir foi substituida: nao ha mais GuidedTour, sidebar ou painel fixo. `App` coordena superficies sob demanda e `exploration.ts` separa percurso, descoberta e inspecao. `FlowCanvas` renderiza niveis de visibilidade e escolhas contextuais; `DetailPanel` e uma superficie flutuante com disclosures. O modelo operacional permanece intacto. `docs/SPATIAL_UX.md` e a referencia atual de interacao; os detalhes de fonte e funcoes de grafo abaixo continuam validos.

## Separacao de responsabilidades

`App.tsx` coordena foco, visao completa, superficies, busca e percurso. Estado local React e suficiente; nao existe store global ou backend. `FlowCanvas` converte o dominio em nos/arestas React Flow, sem implementar regras operacionais. `DetailPanel` apresenta somente o modelo e identifica conteudo complementar ausente. `exploration.ts` implementa transicoes puras de percurso e inspecao, sem conhecer coordenadas.

`FlowModel` contem entrada, nos, arestas e documentos permitidos. `FlowStep` distingue atividade, decisao, terminal, escalonamento, registro e referencia independente. `FlowLink` preserva condicao, origem, destino, IDs da fonte e sinalizacao de interpretacao. `layout.ts` e o unico lugar com posicoes: nao influencia a navegacao.

`graph.ts` oferece funcoes puras para busca normalizada, saidas, inicio, avanco, retorno e validacao. O historico armazena arrays de visitas e arestas, nao conjuntos; ciclos nao apagam ocorrencias anteriores. Avancar verifica se a alternativa pertence a etapa atual. Voltar remove exatamente uma transicao. Os conjuntos usados para destaque nao substituem esse historico.

## Fonte e reproducibilidade

O importador le chunks PNG tEXt, decodifica o XML mxfile e usa fast-xml-parser para preservar os 219 elementos e 57 arestas em `source.json`. O SHA-256 identifica a imagem utilizada. `catalog.json` reduz a fonte a textos e IDs para o bundle; estilos e imagens incorporadas nao sao enviados ao navegador. `index.ts` descreve a transposicao operacional, consolidacoes e interpretacoes. Importar uma nova imagem nao pode substituir revisao humana do grafo.

## Renderizacao e acessibilidade

React Flow fornece zoom, pan, handles e ferramentas opcionais; um renderer tipado aplica niveis de foco e variantes semanticas aos nos. A ultima aresta e desenhada progressivamente; as anteriores ficam atenuadas. Motion anima as superficies sob demanda. CSS e camera respeitam reduced-motion. Nao ha sidebar; detalhes flutuam e passam para a regiao inferior em telas menores. Controles possuem rotulos e foco visivel. Nao ha bibliotecas de layout automatico: coordenadas editaveis mantem ciclos explicitos sem alterar o dominio.

## Extensao

Outro processo pode implementar `FlowModel` e seu layout e ser passado a uma futura camada de selecao de processos. Nesta versao os componentes usam o modulo TOPdesk, intencionalmente sem criar um roteador ou registro prematuro. Documentos futuros devem ser cadastrados no modelo antes de referenciados. Nao ha APIs simuladas, permissoes ou editor oculto.