import { flow } from './index';

export interface StepFAQ {
  id: string; stepId: string; question: string; answer: string;
  sourceType: 'operational-flow' | 'itil-guidance' | 'mixed';
  sourceRefs: string[]; category?: string; documentationRefs?: string[];
}
export interface FAQAnswerSection { kind: 'flow' | 'practice' | 'limit'; title: string; content: string }
const answerMarkers = [
  { marker: 'No fluxo:', kind: 'flow', title: 'O que acontece no fluxo' },
  { marker: 'Boa prática:', kind: 'practice', title: 'Como agir com qualidade' },
  { marker: 'Informação não definida:', kind: 'limit', title: 'O que precisa ser confirmado' },
] as const;
export function formatFAQAnswer(answer: string) {
  const markerPattern = /(No fluxo:|Boa prática:|Informação não definida:)/g;
  const matches = [...answer.matchAll(markerPattern)];
  const sections: FAQAnswerSection[] = [];
  if (!matches.length) return { summary: answer, sections };
  for (let index = 0; index < matches.length; index++) {
    const match = matches[index], definition = answerMarkers.find(item => item.marker === match[0])!;
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? answer.length;
    const content = answer.slice(start, end).trim();
    if (content) sections.push({ kind: definition.kind, title: definition.title, content });
  }
  const first = sections[0]?.content ?? answer;
  const sentences = first.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(sentence => sentence.trim()) ?? [first];
  let summary = '';
  for (const sentence of sentences) {
    summary = `${summary} ${sentence}`.trim();
    if (summary.length >= 36) break;
  }
  summary = summary.charAt(0).toUpperCase() + summary.slice(1);
  const firstSection = sections[0];
  const consumed = sentences.slice(0, sentences.findIndex((_, index) => sentences.slice(0, index + 1).join(' ').length >= 36) + 1).join(' ').length;
  const remainder = first.slice(consumed).trim();
  const complementarySections = sections.flatMap((section, index) => index === 0 ? remainder ? [{ ...section, content: remainder.charAt(0).toUpperCase() + remainder.slice(1) }] : [] : [{ ...section, content: section.content.charAt(0).toUpperCase() + section.content.slice(1) }]);
  return { summary, sections: firstSection ? complementarySections : sections };
}
export const faqSources = {
  flow: { title: 'Fluxograma Aptum e mapeamento de fidelidade', url: 'docs/FLOW_MAPPING.md' },
  incident: { title: 'Atlassian: gerenciamento de incidentes (fonte secundária de ITSM)', url: 'https://www.atlassian.com/itsm/incident-management' },
  knowledge: { title: 'Atlassian: gestão do conhecimento', url: 'https://www.atlassian.com/itsm/knowledge-management' },
  request: { title: 'Atlassian: requisições de serviço', url: 'https://www.atlassian.com/itsm/service-request-management' },
};
// Editorial content, not generated from node titles. Prefixes explicitly distinguish evidence and advice.
type Draft = [question: string, answer: string, source?: 'incident' | 'knowledge' | 'request'];
const drafts: Record<string, Draft[]> = {
  '224': [
    ['O que significa escolher Sim aqui?', 'No fluxo: Sim inicia o levantamento das necessidades para avaliar a criação. Não segue para a leitura da solicitação. Informação não definida: o desenho não formaliza como reconhecer cada situação.'],
    ['Este ramo dispensa todo registro?', 'No fluxo: existe um ramo de solução direta sem criar chamado. Boa prática: manter rastreabilidade favorece o acompanhamento. Isso não autoriza substituir o desenho por uma obrigação interna de registro não documentada.', 'incident'],
    ['Estou escolhendo N1 ou N2 nesta decisão?', 'No fluxo: ainda não. Primeiro são levantadas as necessidades e avaliada a complexidade para chamado; a avaliação para N2 vem depois.'],
  ],
  '227': [
    ['Que informações ajudam a compreender a necessidade?', 'Boa prática: esclarecer o serviço afetado, sintomas, alcance e resultado esperado ajuda o diagnóstico. Informação não definida: não existe questionário obrigatório da Aptum nesta etapa.', 'incident'],
    ['Devo começar pela solução ou pelo relato?', 'Boa prática: entender o relato antes de testar hipóteses reduz ações sem contexto. No fluxo, o levantamento antecede a avaliação da complexidade.', 'incident'],
    ['Levantar necessidades já cria o chamado?', 'No fluxo: não. A criação só aparece depois das decisões de complexidade, nos ramos Novo chamado N1 e N2.'],
  ],
  '229': [
    ['O que observar ao ler a solicitação?', 'Boa prática: entender o problema relatado e as ações já registradas ajuda a evitar repetição de testes. No fluxo, a próxima avaliação é sobre informações suficientes.', 'incident'],
    ['Posso presumir informações que não estão no relato?', 'Boa prática: distinguir fatos de hipóteses preserva a qualidade do registro. No fluxo, se faltarem informações, existe a ação de solicitá-las.', 'incident'],
    ['Por que a conexão seguinte é interpretada?', 'Informação não definida: a seta original não possui destino vinculado. O modelo a conecta à decisão de suficiência de informações, com essa interpretação explicitamente registrada.'],
  ],
  '234': [
    ['Qual complexidade exige abrir um chamado?', 'Informação não definida: o fluxograma não fornece limiar, pontuação ou exemplos homologados. No fluxo, Sim avalia N2; Não segue para solução direta.'],
    ['Uma demanda simples é sempre resolvida sem chamado?', 'No fluxo: há um ramo direto, mas o critério não é definido. Boa prática: simplicidade técnica não elimina automaticamente a necessidade de rastreabilidade ou de atender às regras locais.', 'incident'],
    ['Esta decisão define prioridade?', 'No fluxo: não. Impacto, Urgência e Prioridade aparecem no preenchimento, mais adiante. Complexidade não foi convertida em prioridade pelo simulador.'],
  ],
  '236': [
    ['Em que este Aplicar solução difere dos demais?', 'No fluxo: esta aplicação pertence ao ramo sem criação de chamado. As aplicações da base e da investigação externa convergem para Resolveu?.'],
    ['Há um procedimento técnico pronto para executar?', 'Informação não definida: o desenho só nomeia a atividade. Boa prática: utilizar orientação aplicável ao ambiente, respeitando procedimentos autorizados; o simulador não concede permissão técnica.', 'knowledge'],
    ['O que vem após a solução direta?', 'No fluxo: o terminal Atendimento concluído. A ligação é uma interpretação de uma seta sem origem vinculada, documentada no mapeamento.'],
  ],
  '242': [
    ['Como escolher entre N1 e N2?', 'No fluxo: Sim à complexidade para N2 cria N2; Não cria N1. Informação não definida: conhecimentos, recursos ou critérios que delimitam os níveis precisam ser confirmados com a organização.'],
    ['Complexidade para N2 significa urgência alta?', 'Boa prática: dificuldade técnica e necessidade de atendimento rápido são dimensões diferentes. Informação não definida: a Aptum não apresenta uma relação automática entre nível e prioridade neste diagrama.', 'incident'],
    ['Posso pular o preenchimento ao escolher N2?', 'No fluxo: não há esse atalho. N1 e N2 convergem para Realizar preenchimento.'],
  ],
  '245': [
    ['Por que registrar um chamado N2?', 'No fluxo: este registro é escolhido pela decisão de complexidade para N2. Boa prática: registrar facilita continuidade, comunicação e rastreabilidade entre responsáveis.', 'incident'],
    ['Criar N2 é igual a escalonar um chamado?', 'No fluxo: são caminhos distintos. Aqui nasce um novo chamado N2; no escalonamento, um atendimento já em curso passa por mudanças de grupo, operador e status.'],
    ['Quais dados vêm depois da criação N2?', 'No fluxo: Realizar preenchimento leva a Solicitante, Detalhes, Planejamento e Processamento, antes do campo de texto e Salvar.'],
  ],
  '247': [
    ['N1 é usado apenas para incidentes?', 'Informação não definida: o nível não determina o tipo da demanda. Boa prática: incidente trata interrupção ou degradação não planejada; requisição trata uma solicitação de serviço predefinida. A classificação depende do catálogo local.', 'request'],
    ['Por que manter histórico mesmo no primeiro nível?', 'Boa prática: o registro das ações e resultados facilita acompanhamento e eventual transferência, evitando recomeçar a investigação. No fluxo, N1 também passa pelo preenchimento.', 'incident'],
    ['O atendimento N1 pode chegar ao N2 depois?', 'No fluxo: sim. Após as etapas de atendimento há saídas de escalonamento quando a investigação não encontra solução ou na decisão Resolveu?.'],
  ],
  '250': [
    ['Por onde começa o preenchimento?', 'No fluxo: por Solicitante, seguido de Detalhes, Planejamento e Processamento. Depois aparecem o campo de texto e Salvar.'],
    ['Preencher bem ajuda o próximo operador?', 'Boa prática: dados claros sobre o solicitante, a demanda e o tratamento reduzem perda de contexto em transferências. Não há template obrigatório nesta fonte.', 'incident'],
    ['Todos esses campos são obrigatórios no TOPdesk?', 'Informação não definida: o desenho agrupa campos, mas não descreve validações ou configuração de obrigatoriedade do sistema.'],
  ],
  '252': [
    ['Que dado de solicitante aparece no desenho?', 'No fluxo: Nome/Cliente é o campo associado a Solicitante. Outros identificadores não foram acrescentados como exigência.'],
    ['Por que identificar quem fez a solicitação?', 'Boa prática: a identificação facilita esclarecimentos e comunicação sobre o atendimento. Registre somente dados necessários e adequados às regras locais.', 'incident'],
    ['Solicitante e operador são a mesma função?', 'No fluxo: não são campos equivalentes. Solicitante identifica a origem da demanda; Operador aparece no Processamento e na atribuição de responsabilidade.'],
  ],
  '256': [
    ['Como escrever uma breve descrição útil?', 'Boa prática: resumir o serviço afetado e o sintoma ou necessidade torna o chamado mais fácil de entender e localizar. Informação não definida: não existe padrão de título obrigatório no diagrama.', 'incident'],
    ['Qual a diferença entre categoria e subcategoria?', 'No fluxo: são campos distintos de classificação. Boa prática: a subcategoria detalha a classificação mais ampla. Informação não definida: as combinações oficiais dos 45 rótulos não estão explicitadas.', 'incident'],
    ['Como distinguir incidente de requisição?', 'Boa prática: incidente envolve interrupção ou redução não planejada da qualidade do serviço; requisição é uma solicitação predefinida, como acesso ou informação. Informação não definida: use o catálogo local para confirmar o tipo aplicável.', 'request'],
  ],
  '264': [
    ['Impacto e urgência significam a mesma coisa?', 'Boa prática: impacto descreve a extensão dos efeitos; urgência expressa a necessidade de agir em função do tempo. No fluxo, ambos aparecem separados de Prioridade.', 'incident'],
    ['Como calcular a prioridade?', 'Informação não definida: não existe matriz de cálculo nem valores de prazo no desenho. Boa prática: aplicar critérios de prioridade acordados pela organização, não uma fórmula inventada pelo treinamento.', 'incident'],
    ['Quais referências acompanham esse planejamento?', 'No fluxo: Impacto lista Pessoa, Departamento e Empresa; Urgência lista Disponível, Parcialmente disponível e Não disponível. Os rótulos foram preservados sem deduzir SLA.'],
  ],
  processing: [
    ['Grupo e operador têm finalidades diferentes?', 'No fluxo: Grupo de operadores identifica o agrupamento; Operador representa o responsável individual. Ambos aparecem também como ações separadas no escalonamento.'],
    ['O status indica quem é o responsável?', 'No fluxo: Status é um campo separado de Grupo e Operador. Boa prática: situação do atendimento e responsabilidade devem permanecer compreensíveis, sem presumir que um campo substitui outro.', 'incident'],
    ['O sistema escolhe o operador automaticamente?', 'Informação não definida: o desenho não descreve atribuição automática, permissões ou regras de distribuição.'],
  ],
  '279': [
    ['O que é útil registrar no texto?', 'Boa prática: relato, evidências relevantes, ações e resultados ajudam quem continuará o atendimento. Informação não definida: o diagrama não fixa um modelo obrigatório para esse campo.', 'incident'],
    ['Devo escrever uma hipótese como causa confirmada?', 'Boa prática: identificar hipóteses como hipóteses evita diagnósticos enganosos. Registre o que foi observado e o resultado dos testes separadamente.', 'incident'],
    ['O campo de texto é a última etapa do registro?', 'No fluxo: ainda é necessário Salvar. A continuidade então chega à consulta da base por meio dos pontos de teleporte do original.'],
  ],
  '281': [
    ['Salvar já conclui o atendimento?', 'No fluxo: não. Salvar consolida o preenchimento e conduz à consulta da base de conhecimento.'],
    ['Por que o caminho muda de região após salvar?', 'No fluxo: os conectores de teleporte unem o trecho de registro ao atendimento. No percurso web essa mesma relação aparece como transição contínua.'],
    ['Salvar garante que os dados estão corretos?', 'Boa prática: gravação não equivale à qualidade do conteúdo. Conferir os dados relevantes reduz ruído no diagnóstico. Informação não definida: as validações do TOPdesk não estão descritas.', 'incident'],
  ],
  '285': [
    ['Como reconhecer que faltam informações?', 'Boa prática: se não for possível compreender o serviço afetado, o sintoma ou a necessidade, esclarecimentos podem ser necessários. Informação não definida: não há checklist oficial de suficiência.', 'incident'],
    ['Qual caminho seguir quando falta contexto?', 'No fluxo: Não leva a Solicitar mais informações e retorna à avaliação. Sim leva a Consultar base de conhecimento.'],
    ['Posso voltar a esta decisão mais de uma vez?', 'No fluxo: sim. O retorno de Solicitar mais informações cria um ciclo; cada nova passagem aparece como visita independente no percurso.'],
  ],
  '292': [
    ['Como pedir esclarecimentos sem repetir tudo?', 'Boa prática: formular perguntas específicas sobre as lacunas do relato reduz idas e vindas. Consulte o histórico antes de solicitar dados já disponíveis.', 'request'],
    ['Qual prazo devo dar para resposta do cliente?', 'Informação não definida: não há prazo ou regra de ausência de resposta nesta etapa. Não se deve deduzir encerramento automático.'],
    ['Depois de receber a informação, vou direto à solução?', 'No fluxo: primeiro retorna a Informações o suficiente?. Apenas o ramo Sim segue à base de conhecimento.'],
  ],
  '287': [
    ['Por que consultar a base antes de investigar do zero?', 'Boa prática: conhecimento revisado e reutilizável reduz retrabalho e melhora a consistência. No fluxo, a consulta antecede a investigação externa.', 'knowledge'],
    ['O que fazer se não encontrar uma solução?', 'No fluxo: a decisão seguinte, Solução encontrada?, permite seguir por Não para Investigar soluções externas.'],
    ['Posso reutilizar a solução de outro chamado?', 'Boa prática: conferir sintomas, ambiente, versão e aplicabilidade antes de reutilizar uma solução. Um relato semelhante não comprova que a mesma ação é segura ou autorizada.', 'knowledge'],
    ['Quando registrar uma nova solução na base?', 'Boa prática: conhecimento confirmado pode ser organizado e revisado para reutilização. No fluxo, Documentar no chamado ocorre após Resolveu? Sim; publicar na base e sua aprovação não estão definidos.', 'knowledge'],
  ],
  '290': [
    ['Encontrar um artigo já significa resolver?', 'No fluxo: não. Sim leva a Aplicar solução e depois a Resolveu?. Encontrar, aplicar e confirmar resultado são momentos distintos.'],
    ['E se a solução encontrada não se aplicar ao ambiente?', 'Boa prática: verificar a aplicabilidade antes de executar. Informação não definida: o desenho não tem um ramo próprio para artigo inadequado; não trate a mera existência do artigo como sucesso.', 'knowledge'],
    ['Para onde vai o caminho Não desta decisão?', 'No fluxo: para Investigar soluções externas. Essa decisão avalia o resultado da consulta à base, não o resultado de uma aplicação.'],
  ],
  '299': [
    ['Devo aplicar qualquer procedimento encontrado na base?', 'Boa prática: confirmar contexto, validade e restrições da orientação antes de usar. Uma base de conhecimento não substitui autorizações e procedimentos locais.', 'knowledge'],
    ['Como verificar se a aplicação funcionou?', 'No fluxo: a próxima decisão é Resolveu?. Boa prática: comparar o resultado com o sintoma ou necessidade inicial e registrar evidências.', 'incident'],
    ['Qual caminho existe se a aplicação não resolver?', 'No fluxo: Resolveu? possui duas saídas Não, investigar e escalonar. Informação não definida: não há critério explícito para selecionar entre elas.'],
  ],
  '296': [
    ['Quais fontes externas estão representadas?', 'No fluxo: bases externas, internet ou terceiros. Informação não definida: não existe uma lista homologada de fornecedores ou sites.'],
    ['Posso compartilhar os dados do chamado em um fórum?', 'Boa prática: proteger informações sensíveis e usar somente dados adequados às regras locais. O diagrama citar internet não autoriza publicar dados do cliente.', 'knowledge'],
    ['Como evitar repetir testes durante a investigação?', 'Boa prática: registrar ações, resultados e hipóteses descartadas permite continuidade e facilita eventual escalonamento.', 'incident'],
  ],
  '315': [
    ['O que acontece se a investigação não encontrar solução?', 'No fluxo: Não leva ao escalonamento para N2. Não foi acrescentado um prazo para encerrar a investigação.'],
    ['Encontrar uma alternativa externa permite concluir?', 'No fluxo: não. Sim leva à aplicação e depois à decisão Resolveu?.'],
    ['Existe um tempo máximo de pesquisa?', 'Informação não definida: a decisão não contém duração, quantidade de tentativas ou regra de SLA. Esses limites dependem de documentação local.'],
  ],
  '317': [
    ['Qual a origem desta solução?', 'No fluxo: este Aplicar solução vem da decisão Encontrou solução? após a investigação externa, e não diretamente da base interna.'],
    ['Uma dica encontrada na internet é suficiente para executar?', 'Boa prática: avaliar confiabilidade, contexto e riscos e respeitar procedimentos autorizados. Informação não definida: o diagrama não concede aprovações para alterações técnicas.', 'knowledge'],
    ['Como manter o teste rastreável?', 'Boa prática: registrar a ação e o resultado observado ajuda a decisão Resolveu? e evita que o próximo operador repita tentativas sem contexto.', 'incident'],
  ],
  '303': [
    ['Por que há dois caminhos Não?', 'No fluxo: uma saída volta à investigação externa e outra escalona para N2. Informação não definida: o original não informa o critério de escolha; ambas foram preservadas.'],
    ['Se resolveu, posso mudar o status imediatamente?', 'No fluxo: antes de Resolvido há Documentar no chamado e Validar com cliente/solicitante.'],
    ['Como diferenciar resultado esperado e tentativa executada?', 'Boa prática: executar um procedimento não comprova restauração. Verifique se o sintoma ou necessidade foi atendido e registre o resultado.', 'incident'],
  ],
  '306': [
    ['O que devo registrar sobre a solução?', 'Boa prática: descrever sintomas relevantes, ações e resultado confirmado favorece rastreabilidade e reutilização. Informação não definida: a fonte não impõe um template.', 'knowledge'],
    ['Documentar aqui publica automaticamente na base?', 'No fluxo: a etapa é Documentar no chamado. Publicação, revisão ou aprovação de artigo de conhecimento não aparecem como ações automáticas.'],
    ['Por que documentar antes da validação?', 'No fluxo: a sequência registra o tratamento e então valida com o solicitante. Boa prática: isso disponibiliza contexto para a confirmação do resultado.', 'incident'],
  ],
  '309': [
    ['Por que validar com o solicitante?', 'Boa prática: uma ação técnica pode não atender à necessidade percebida pelo usuário. A confirmação reduz o risco de tratar como resolvido um atendimento ainda insuficiente.', 'incident'],
    ['E se o problema persistir na validação?', 'Informação não definida: o desenho não apresenta uma saída negativa desta etapa. Boa prática: registrar a divergência e confirmar o encaminhamento com o responsável pelo processo; não invente uma transição nem registre sucesso sem confirmação.', 'incident'],
    ['Posso concluir por falta de resposta?', 'Informação não definida: não existem prazo de confirmação ou regra de aceite automático. No fluxo, a saída representada leva a mudar o status para Resolvido.'],
  ],
  '311': [
    ['Resolvido e Encerrado são equivalentes aqui?', 'No fluxo: não. A ação manda alterar para Resolvido e chega ao fim. Encerrado aparece na referência auxiliar, sem transição automática representada.'],
    ['Quais caminhos chegam a este status?', 'No fluxo: a validação com o solicitante e o ramo Sim de Chamado resolvido? no acompanhamento convergem nesta etapa.'],
    ['Mudar o status comprova que o serviço voltou?', 'Boa prática: o status deve refletir o resultado do atendimento, não substituir sua verificação. No fluxo, a confirmação precede a alteração.', 'incident'],
  ],
  '320': [
    ['Quando o fluxo prevê escalonar para N2?', 'No fluxo: quando a investigação externa não encontra solução, ou por uma das saídas Não de Resolveu?. Informação não definida: não há regra de escalonamento por tempo.'],
    ['O que documentar antes da transferência?', 'Boa prática: relato, ambiente relevante, sintomas, testes, resultados e ações tentadas ajudam o próximo nível a continuar sem repetir trabalho. Isso não é um template obrigatório da Aptum.', 'incident'],
    ['Escalonar termina minha participação?', 'No fluxo: não encerra o percurso. Depois de mudar grupo, operador e status, há aviso ao operador e acompanhamento até a resolução.'],
  ],
  '322': [
    ['Qual grupo devo escolher para N2?', 'Informação não definida: a lista de grupos não estabelece responsabilidade por situação ou categoria. A escolha real exige a distribuição de responsabilidades homologada.'],
    ['Mudar o grupo já muda o operador?', 'No fluxo: são ações separadas. Após Mudar grupo de operadores vem Mudar operador. Nenhuma automação do TOPdesk é presumida.'],
    ['Por que preservar o contexto ao mudar de grupo?', 'Boa prática: o grupo destinatário precisa compreender a demanda e o trabalho anterior para continuar a investigação sem perda de informação.', 'incident'],
  ],
  '325': [
    ['Quem pode ser o novo operador?', 'Informação não definida: o desenho não especifica nomes, disponibilidade ou regras de autorização. Não se deduz um responsável individual da lista de grupos.'],
    ['A mudança de operador substitui o aviso?', 'No fluxo: não. Depois da mudança de status há uma atividade explícita de avisar o operador designado.'],
    ['Por que identificar um responsável individual?', 'Boa prática: clareza de responsabilidade favorece comunicação e continuidade. No fluxo, Operador e Grupo permanecem informações diferentes.', 'incident'],
  ],
  '341': [
    ['Qual status é indicado no escalonamento?', 'No fluxo: aguardando atendimento. Esse texto foi preservado, sem trocar por outro rótulo da lista auxiliar.'],
    ['Por que não encontro esse status na referência?', 'Informação não definida: há uma inconsistência entre a ação operacional e a lista auxiliar de seis estados. A configuração real deve ser confirmada; o treinamento não resolve a divergência por suposição.'],
    ['Esse status permite abandonar o acompanhamento?', 'No fluxo: não. A sequência avisa o operador designado e entra no acompanhamento.'],
  ],
  '327': [
    ['Que canal usar para avisar o operador?', 'Informação não definida: não há canal obrigatório ou modelo de mensagem. O diagrama exige a atividade de aviso, sem especificar ferramenta.'],
    ['Que contexto ajuda nesse aviso?', 'Boa prática: referência do chamado, motivo do encaminhamento e resumo das ações facilitam a continuidade, respeitando regras locais de informação.', 'incident'],
    ['Depois de avisar, o fluxo chega ao fim?', 'No fluxo: não. A próxima etapa é acompanhar e verificar se o chamado foi resolvido.'],
  ],
  '329': [
    ['O que significa acompanhar o chamado?', 'No fluxo: a nota original menciona apoiar, vigiar SLA, cobrar o operador e fazer a ponte com o solicitante. Essa participação continua após a transferência.'],
    ['Com que frequência devo cobrar o operador?', 'Informação não definida: a nota não informa frequência nem valores de SLA. Consulte os acordos aplicáveis; não transforme uma sugestão do treinamento em prazo interno.'],
    ['Como manter o solicitante informado?', 'Boa prática: comunicar atualizações relevantes e expectativas conhecidas favorece transparência. Não prometa prazo que não esteja confirmado.', 'incident'],
  ],
  '333': [
    ['O que acontece se ainda não foi resolvido?', 'No fluxo: Não volta a Acompanhar. Cada retorno é uma nova ocorrência, sem apagar as visitas anteriores.'],
    ['Se resolveu, volto à validação anterior?', 'No fluxo: o ramo Sim leva diretamente a Mudar status para Resolvido. Não existe conexão desta decisão até a etapa de validação.'],
    ['Posso usar tempo decorrido como prova de resolução?', 'Boa prática: tempo ou ausência de atualização não comprovam restauração. Informação não definida: não há resolução automática por prazo nesta decisão.', 'incident'],
  ],
  groups: [
    ['A lista de grupos é uma ordem de escalonamento?', 'No fluxo: não. É referência independente; não representa sequência de transferências.'],
    ['Cada categoria possui um grupo fixo nesta lista?', 'Informação não definida: o desenho não associa formalmente categorias a grupos.'],
    ['Como essa referência se relaciona ao chamado?', 'No fluxo: auxilia a consulta do campo Grupo de operadores e da ação de mudar grupo; não cria uma visita operacional por si só.'],
  ],
  impact: [
    ['O que Pessoa, Departamento e Empresa representam?', 'No fluxo: são os rótulos auxiliares de Impacto, relacionados ao planejamento do chamado.'],
    ['Impacto maior sempre gera uma prioridade específica?', 'Informação não definida: não há matriz ou correspondência numérica. Boa prática: considerar alcance e efeito no negócio conforme critérios acordados.', 'incident'],
    ['Impacto é o mesmo que dificuldade técnica?', 'Boa prática: impacto trata dos efeitos do incidente; dificuldade trata da execução do atendimento. Não substitua a avaliação de efeitos por complexidade técnica.', 'incident'],
  ],
  urgency: [
    ['Quais valores de urgência o original apresenta?', 'No fluxo: Disponível, Parcialmente disponível e Não disponível. O simulador conserva esses rótulos sem reinterpretar sua configuração.'],
    ['Não disponível significa SLA de quanto tempo?', 'Informação não definida: nenhum prazo é associado a esse valor no diagrama.'],
    ['Como relacionar urgência e prioridade?', 'Boa prática: a necessidade de agir em função do tempo contribui para a priorização junto aos efeitos no negócio. Informação não definida: a fórmula local não foi fornecida.', 'incident'],
  ],
  states: [
    ['Devo percorrer os seis estados na ordem da lista?', 'No fluxo: não. A referência não é uma sequência obrigatória de transições.'],
    ['O fluxo muda para Encerrado no final?', 'No fluxo: a ação operacional termina em Resolvido. Encerrado é somente um rótulo da referência.'],
    ['Por que aguardando atendimento aparece fora da lista?', 'Informação não definida: o texto da ação de escalonamento difere dos rótulos auxiliares. A divergência está preservada para confirmação operacional.'],
  ],
  categories: [
    ['Os 45 rótulos definem uma árvore oficial?', 'Informação não definida: o desenho não explicita toda a hierarquia entre categorias e subcategorias. A lista preserva os rótulos sem inventar vínculos.'],
    ['Por que categorizar uma solicitação?', 'Boa prática: classificação consistente ajuda a localizar registros e analisar padrões. Não há aqui uma política automática de encaminhamento por categoria.', 'incident'],
    ['Posso deduzir prioridade pela categoria?', 'Informação não definida: não existe regra categoria-prioridade. O planejamento apresenta Impacto, Urgência e Prioridade como campos próprios.'],
  ],
};
export const stepFAQs: StepFAQ[] = Object.entries(drafts).flatMap(([stepId, items]) => items.map(([question, answer, source], index) => ({
  id: `${stepId}-faq-${index + 1}`, stepId, question, answer,
  sourceType: source ? answer.includes('No fluxo:') || answer.includes('Informação não definida:') ? 'mixed' : 'itil-guidance' : 'operational-flow',
  sourceRefs: source ? ['flow', source] : ['flow'],
})));
export function questionsForStep(stepId: string) { return stepFAQs.filter(item => item.stepId === stepId); }
export function answerForStep(stepId: string, questionId: string) { return stepFAQs.find(item => item.stepId === stepId && item.id === questionId); }
export const relevantFAQSteps = flow.nodes.filter(step => step.type !== 'start' && step.type !== 'end');