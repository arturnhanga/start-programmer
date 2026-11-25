/* ==========================================================================
   Start Programmer — Lógica, Conteúdos e Persistência Local
   Ficheiro único de JavaScript (sem frameworks, sem backend)
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   1. CONFIGURAÇÃO, CHAVES OFICIAIS E ESTADO LOCAL (localStorage)
   -------------------------------------------------------------------------- */

const STORAGE_KEY = 'start_programmer_state_v1';

/**
 * As 8 chaves oficiais de acesso Premium.
 * Cada chave desbloqueia exclusivamente a funcionalidade correspondente.
 */
const OFFICIAL_KEYS = [
  { key: 'vadopppp1', featureId: 'logic_full', title: 'Curso completo de lógica 1', priceKz: 'Gratuito', alwaysFree: true },
  { key: 'vadopppp2', featureId: 'visualg_full', title: 'Curso completo de VisualG 2', priceKz: '2.000 Kz' },
  { key: 'vadopppp3', featureId: 'exercises_pack', title: 'Exercícios especiais 3', priceKz: '2.000 Kz' },
  { key: 'vadopppp4', featureId: 'challenges_pack', title: 'Desafios especiais 4', priceKz: '2.000 Kz' },
  { key: 'vadopppp5', featureId: 'tests_advanced', title: 'Testes avançados 5', priceKz: '2.000 Kz' },
  { key: 'vadopppp6', featureId: 'projects_pack', title: 'Projetos práticos 6', priceKz: '2.000 Kz' },
  { key: 'vadopppp7', featureId: 'library_pack', title: 'Biblioteca de materiais 7', priceKz: '2.000 Kz' },
  { key: 'vadopppp8', featureId: 'areas_full', title: 'Áreas da programação 8', priceKz: '2.000 Kz' }
];

const DEMO_USER_IDS = ['u_ana', 'u_joao', 'u_carla'];

function createInitialState() {
  return {
    student: {
      id: 'u_local',
      name: 'Estudante',
      goal: 'Aprender programação desde o zero',
      readingLarge: false,
      presentationMode: false,
      chosenArea: '',
      status: 'ativo'
    },
    points: 0,
    completedLessons: [],
    lastLessonId: 'log-01',
    favorites: [],
    history: [],
    testResults: [],
    solvedChallenges: [],
    verifiedCodes: [],
    unlockedFeatures: [],
    blockedKeys: [],
    keyActivations: [],
    users: [],
    adminPinHash: ''
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw);
    const base = createInitialState();
    const cleanUsers = Array.isArray(parsed.users)
      ? parsed.users.filter((u) => u && !DEMO_USER_IDS.includes(u.id))
      : [];
    const cleanActivations = Array.isArray(parsed.keyActivations)
      ? parsed.keyActivations.filter((a) => a && !DEMO_USER_IDS.includes(a.userId))
      : [];
    return {
      ...base,
      ...parsed,
      student: { ...base.student, ...(parsed.student || {}) },
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
      testResults: Array.isArray(parsed.testResults) ? parsed.testResults : [],
      solvedChallenges: Array.isArray(parsed.solvedChallenges) ? parsed.solvedChallenges : [],
      verifiedCodes: Array.isArray(parsed.verifiedCodes) ? parsed.verifiedCodes : [],
      unlockedFeatures: Array.isArray(parsed.unlockedFeatures)
        ? parsed.unlockedFeatures.map((f) => (f === 'portugol_full' ? 'visualg_full' : f))
        : [],
      blockedKeys: Array.isArray(parsed.blockedKeys) ? parsed.blockedKeys : [],
      keyActivations: cleanActivations,
      users: cleanUsers
    };
  } catch {
    return createInitialState();
  }
}

let state = loadState();
let currentView = 'home';
let learnPhaseFilter = 'all';
let learnSearchQuery = '';
let learnOnlyFavorites = false;
let activeLessonId = state.lastLessonId || 'log-01';
let practiceTab = 'exercises';
let activeQuizState = null;
let adminSessionUnlocked = false;
let activeVerifyIndex = 0;
let verifyDraftCode = '';
let verifyCheckResult = null;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    showToast('Não foi possível guardar no armazenamento local.', 'error');
  }
}

/* --------------------------------------------------------------------------
   2. CONTEÚDOS EDUCATIVOS (FASE 1, FASE 2, FASE 3)
   -------------------------------------------------------------------------- */

const LESSONS = [
  // ================= FASE 1 — LÓGICA DE PROGRAMAÇÃO (15 AULAS) =================
  {
    id: 'log-01',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Fundamentos',
    title: '1. O que é programação',
    summary: 'Programar é dar instruções claras e ordenadas para que o computador resolva um problema.',
    free: true,
    keyFeature: null,
    explanation: [
      'Um computador é rápido, mas não pensa sozinho: ele apenas executa exatamente o que lhe mandamos fazer.',
      'Programar significa escrever essas ordens numa linguagem que o computador consiga interpretar, passo a passo.'
    ],
    keypoint: 'Regra de ouro: se uma instrução for ambígua, o computador não consegue adivinhar o que querias dizer.',
    codeTitle: 'Exemplo do dia a dia',
    code: '1. Ligar a chaleira\n2. Colocar água\n3. Esperar ferver\n4. Servir o chá',
    practice: {
      type: 'mc',
      question: 'Qual é a melhor definição de programação?',
      options: [
        'Dar instruções claras e ordenadas ao computador',
        'Apenas montar peças físicas de um computador',
        'Decorar códigos aleatórios sem sequência'
      ],
      answer: 0,
      explanation: 'Programar é escrever instruções lógicas e ordenadas para resolver problemas.'
    }
  },
  {
    id: 'log-02',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Fundamentos',
    title: '2. O que é um algoritmo',
    summary: 'Um algoritmo é uma sequência finita de passos organizados para atingir um objetivo.',
    free: true,
    keyFeature: null,
    explanation: [
      'Antes de escrever código, o programador pensa no algoritmo: o plano lógico com início, meio e fim.',
      'Uma receita de bolo ou os passos para somar dois números são exemplos simples de algoritmos.'
    ],
    keypoint: 'Todo algoritmo tem entrada, processamento e saída.',
    codeTitle: 'Algoritmo: Somar duas notas',
    code: 'Passo 1: Receber nota1 e nota2\nPasso 2: Calcular soma = nota1 + nota2\nPasso 3: Mostrar o resultado da soma',
    practice: {
      type: 'tf',
      question: 'Verdadeiro ou Falso: Um algoritmo pode ter passos infinitos e nunca terminar.',
      options: ['Verdadeiro', 'Falso'],
      answer: 1,
      explanation: 'Falso. Um algoritmo bem construído é finito e chega a uma conclusão.'
    }
  },
  {
    id: 'log-03',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Fundamentos',
    title: '3. Lógica computacional',
    summary: 'Dividir problemas grandes em partes pequenas e previsíveis.',
    free: true,
    keyFeature: null,
    explanation: [
      'A lógica computacional baseia-se em três pilares: decomposição (dividir o problema), reconhecimento de padrões e sequência lógica.',
      'Em vez de tentar resolver tudo de uma vez, resolves uma etapa simples de cada vez.'
    ],
    keypoint: 'Ordem importa: trocar a ordem dos passos muda o resultado final.',
    codeTitle: 'Ordem lógica correta',
    code: 'Entrada: Preço = 1000, Desconto = 200\nProcessamento: Total = Preço - Desconto\nSaída: Mostrar Total (800)',
    practice: {
      type: 'logic',
      question: 'Se executarmos: A = 5; B = A + 3; A = 10. Qual é o valor final de B?',
      options: ['8', '13', '10'],
      answer: 0,
      explanation: 'Quando B foi calculado, A valia 5 (5 + 3 = 8). Alterar A depois não muda o valor já guardado em B.'
    }
  },
  {
    id: 'log-04',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Dados',
    title: '4. Variáveis',
    summary: 'Espaços na memória com um nome para guardar valores que podem mudar.',
    free: true,
    keyFeature: null,
    explanation: [
      'Imagina uma caixa etiquetada chamada "idade". Podes guardar o número 18 lá dentro e mais tarde trocar para 19.',
      'Dá sempre nomes claros às variáveis, como salario ou nomeAluno, em vez de letras soltas como x ou y.'
    ],
    keypoint: 'Uma variável guarda apenas o valor mais recente que recebeu.',
    codeTitle: 'Uso de variáveis',
    code: 'pontos <- 10\npontos <- 25\n// Agora pontos vale 25',
    practice: {
      type: 'fill',
      question: 'Completa a instrução para guardar o valor 50 na variável saldo:',
      promptTemplate: '______ <- 50',
      accepted: ['saldo'],
      hint: 'Escreve apenas o nome da variável.',
      explanation: 'O nome da variável fica à esquerda da atribuição: saldo <- 50.'
    }
  },
  {
    id: 'log-05',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Dados',
    title: '5. Constantes',
    summary: 'Valores fixos que não mudam durante toda a execução do programa.',
    free: true,
    keyFeature: null,
    explanation: [
      'Ao contrário das variáveis, uma constante mantém o mesmo valor do início ao fim, como o número PI (3.14) ou a taxa de IVA.',
      'Usar constantes evita alterações acidentais em regras importantes do programa.'
    ],
    keypoint: 'Se um valor nunca deve mudar, declara-o como constante.',
    codeTitle: 'Exemplo de constante',
    code: 'constante PI = 3.14159\nconstante DIAS_SEMANA = 7',
    practice: {
      type: 'mc',
      question: 'Qual destes valores deve ser uma constante?',
      options: [
        'A pontuação atual de um jogador',
        'O número de meses de um ano (12)',
        'O nome digitado pelo utilizador'
      ],
      answer: 1,
      explanation: 'Um ano tem sempre 12 meses, logo é um valor fixo (constante).'
    }
  },
  {
    id: 'log-06',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Dados',
    title: '6. Tipos de dados',
    summary: 'Classificação dos valores: inteiros, reais, texto (caractere) e lógicos.',
    free: true,
    keyFeature: null,
    explanation: [
      'O computador precisa de saber o tipo de dado para saber o que pode fazer com ele: não faz sentido multiplicar duas palavras.',
      'Os quatro tipos básicos são: Inteiro (ex: 10), Real (ex: 12.5), Caractere/Texto (ex: "Luanda") e Lógico (verdadeiro ou falso).'
    ],
    keypoint: 'Textos ficam sempre entre aspas; números e valores lógicos não levam aspas.',
    codeTitle: 'Os 4 tipos essenciais',
    code: 'idade: inteiro = 20\naltura: real = 1.75\ncidade: caractere = "Benguela"\naprovado: logico = verdadeiro',
    practice: {
      type: 'mc',
      question: 'Qual é o tipo de dado correto para o valor 19.95?',
      options: ['Inteiro', 'Real', 'Lógico'],
      answer: 1,
      explanation: 'Números com vírgula/ponto decimal pertencem ao tipo Real.'
    }
  },
  {
    id: 'log-07',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Operadores',
    title: '7. Operadores aritméticos',
    summary: 'Símbolos para fazer contas: soma (+), subtração (-), multiplicação (*), divisão (/) e resto (%).',
    free: true,
    keyFeature: null,
    explanation: [
      'Os operadores aritméticos permitem calcular totais, médias e descontos. A multiplicação usa * e a divisão usa /.',
      'Tal como na matemática, * e / são calculados antes de + e -, salvo se usares parênteses ( ).'
    ],
    keypoint: 'Usa parênteses para deixar a prioridade das contas explícita: (n1 + n2) / 2.',
    codeTitle: 'Cálculo de média',
    code: 'media <- (14 + 16) / 2\n// Resultado: 15\nresto <- 10 % 3\n// Resultado: 1 (sobra da divisão inteira)',
    practice: {
      type: 'logic',
      question: 'Qual é o resultado da expressão: 4 + 2 * 3?',
      options: ['18', '10', '12'],
      answer: 1,
      explanation: 'A multiplicação é feita primeiro: 2 * 3 = 6; depois 4 + 6 = 10.'
    }
  },
  {
    id: 'log-08',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Operadores',
    title: '8. Operadores relacionais',
    summary: 'Comparam dois valores e devolvem sempre verdadeiro ou falso.',
    free: true,
    keyFeature: null,
    explanation: [
      'Usamos operadores relacionais para fazer perguntas ao computador: maior (>), menor (<), maior ou igual (>=), menor ou igual (<=), igual (=) e diferente (<>).',
      'O resultado de uma comparação é sempre um valor lógico: verdadeiro ou falso.'
    ],
    keypoint: 'Comparar 10 >= 10 resulta em verdadeiro.',
    codeTitle: 'Comparações',
    code: 'nota <- 14\nnota >= 10   // verdadeiro\nnota = 20    // falso\nnota <> 0    // verdadeiro',
    practice: {
      type: 'tf',
      question: 'Verdadeiro ou Falso: A expressão (15 < 15) resulta em verdadeiro.',
      options: ['Verdadeiro', 'Falso'],
      answer: 1,
      explanation: 'Falso. 15 não é menor do que 15 (é igual).'
    }
  },
  {
    id: 'log-09',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Operadores',
    title: '9. Operadores lógicos',
    summary: 'Combinam condições usando E (todas verdadeiras), OU (pelo menos uma) e NÃO (inverte).',
    free: true,
    keyFeature: null,
    explanation: [
      'Muitas decisões dependem de mais de uma regra ao mesmo tempo. Com E, todas as condições têm de ser verdadeiras.',
      'Com OU, basta uma condição ser verdadeira. O operador NÃO inverte o resultado.'
    ],
    keypoint: 'Ex: (idade >= 18) E (temBilhete = verdadeiro).',
    codeTitle: 'Combinação de condições',
    code: 'chuva <- verdadeiro\nguardaChuva <- falso\nsairSemMolhar <- (NAO chuva) OU guardaChuva // falso',
    practice: {
      type: 'mc',
      question: 'Com o operador E, quando é que (A E B) é verdadeiro?',
      options: [
        'Apenas quando A e B são ambos verdadeiros',
        'Quando pelo menos um deles é verdadeiro',
        'Quando ambos são falsos'
      ],
      answer: 0,
      explanation: 'O operador E exige que todas as condições envolvidas sejam verdadeiras.'
    }
  },
  {
    id: 'log-10',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Interação',
    title: '10. Entrada e saída de dados',
    summary: 'Ler informações do utilizador (entrada) e mostrar resultados no ecrã (saída).',
    free: true,
    keyFeature: null,
    explanation: [
      'Um programa interativo precisa de comunicar com quem o usa. A entrada lê dados do teclado; a saída apresenta mensagens ou resultados.',
      'Em pseudocódigo, usamos instruções como leia() para entrada e escreva() para saída.'
    ],
    keypoint: 'Mostra sempre uma pergunta clara antes de pedir um dado ao utilizador.',
    codeTitle: 'Fluxo Entrada -> Saída',
    code: 'escreva("Qual é o teu nome?")\nleia(nome)\nescreva("Olá, ", nome)',
    practice: {
      type: 'fill',
      question: 'Qual comando usamos para mostrar uma mensagem no ecrã em pseudocódigo?',
      promptTemplate: '______("Bem-vindo!")',
      accepted: ['escreva'],
      hint: 'Começa por e... (7 letras).',
      explanation: 'O comando escreva() envia texto ou valores para o ecrã (saída).'
    }
  },
  {
    id: 'log-11',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Controlo',
    title: '11. Estruturas condicionais',
    summary: 'Permitem que o programa tome decisões diferentes consoante uma condição.',
    free: true,
    keyFeature: null,
    explanation: [
      'A estrutura SE ... ENTÃO ... SENÃO escolhe um caminho se a condição for verdadeira e outro se for falsa.',
      'É assim que um sistema decide se um aluno foi aprovado ou reprovado.'
    ],
    keypoint: 'Apenas um dos ramos (ENTÃO ou SENÃO) é executado de cada vez.',
    codeTitle: 'Decisão simples',
    code: 'se nota >= 10 entao\n   escreva("Aprovado")\nsenao\n   escreva("Em recuperação")\nfimse',
    practice: {
      type: 'logic',
      question: 'Se nota = 9 no código acima, o que aparece no ecrã?',
      options: ['Aprovado', 'Em recuperação', 'Nada'],
      answer: 1,
      explanation: 'Como 9 >= 10 é falso, executa o bloco senao e escreve "Em recuperação".'
    }
  },
  {
    id: 'log-12',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Controlo',
    title: '12. Estruturas de repetição',
    summary: 'Repetir um bloco de código várias vezes usando PARA, ENQUANTO ou REPITA.',
    free: true,
    keyFeature: null,
    explanation: [
      'Quando precisas de contar de 1 até 100 ou processar 50 alunos, não escreves a linha 50 vezes: usas um ciclo (laço de repetição).',
      'Usa PARA quando sabes quantas repetições queres; usa ENQUANTO quando dependes de uma condição.'
    ],
    keypoint: 'Garante sempre que a condição de paragem será atingida para evitar ciclos infinitos.',
    codeTitle: 'Ciclo PARA de 1 até 5',
    code: 'para i de 1 ate 5 faca\n   escreva("Passo ", i)\nfimpara',
    practice: {
      type: 'mc',
      question: 'Qual estrutura é ideal quando sabes exatamente que queres repetir 10 vezes?',
      options: ['para', 'se', 'senao'],
      answer: 0,
      explanation: 'O ciclo "para" é ideal quando o número de repetições é conhecido.'
    }
  },
  {
    id: 'log-13',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Estruturas',
    title: '13. Vetores',
    summary: 'Listas ordenadas que guardam vários valores do mesmo tipo numa só variável.',
    free: true,
    keyFeature: null,
    explanation: [
      'Em vez de criar nota1, nota2, nota3... podes criar um vetor notas[1..5] para guardar todas juntas.',
      'Cada posição do vetor é acedida pelo seu índice numérico.'
    ],
    keypoint: 'Um vetor tem uma dimensão (uma linha de gavetas numeradas).',
    codeTitle: 'Vetor de 3 notas',
    code: 'notas: vetor[1..3] de real\nnotas[1] <- 14\nnotas[2] <- 17\nnotas[3] <- 15',
    practice: {
      type: 'logic',
      question: 'No vetor acima, qual é o valor de notas[2]?',
      options: ['14', '17', '15'],
      answer: 1,
      explanation: 'O índice 2 aponta diretamente para a segunda posição, onde está guardado 17.'
    }
  },
  {
    id: 'log-14',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Estruturas',
    title: '14. Matrizes',
    summary: 'Tabelas com linhas e colunas para organizar dados em duas dimensões.',
    free: true,
    keyFeature: null,
    explanation: [
      'Uma matriz é como uma folha de cálculo: precisas de dois índices, [linha, coluna], para encontrar cada valor.',
      'São muito usadas em tabuleiros de jogos, horários escolares e tabelas de preços.'
    ],
    keypoint: 'Primeiro indica-se a linha, depois a coluna: tabela[linha, coluna].',
    codeTitle: 'Matriz 2x2',
    code: 'grelha: vetor[1..2, 1..2] de inteiro\ngrelha[1, 1] <- 10\ngrelha[2, 1] <- 30',
    practice: {
      type: 'tf',
      question: 'Verdadeiro ou Falso: Para aceder a um elemento numa matriz precisamos de dois índices.',
      options: ['Verdadeiro', 'Falso'],
      answer: 0,
      explanation: 'Verdadeiro. Uma matriz tem duas dimensões: linha e coluna.'
    }
  },
  {
    id: 'log-15',
    phase: 'fase1',
    phaseLabel: 'Fase 1 · Lógica',
    module: 'Modularização',
    title: '15. Funções e procedimentos',
    summary: 'Blocos de código reutilizáveis para organizar e evitar repetição.',
    free: true,
    keyFeature: null,
    explanation: [
      'Um procedimento executa uma tarefa sem devolver um valor. Uma função executa uma tarefa e devolve um resultado (retorne).',
      'Dividir o programa em funções torna o código limpo e fácil de corrigir.'
    ],
    keypoint: 'Função devolve valor; procedimento apenas executa ações.',
    codeTitle: 'Função de soma',
    code: 'funcao somar(a, b: inteiro): inteiro\ninicio\n   retorne a + b\nfimfuncao',
    practice: {
      type: 'mc',
      question: 'Qual é a diferença principal entre função e procedimento?',
      options: [
        'A função devolve um valor; o procedimento não devolve',
        'O procedimento só funciona com números reais',
        'Não existe nenhuma diferença'
      ],
      answer: 0,
      explanation: 'Funções retornam um resultado para quem as chamou; procedimentos apenas executam ações.'
    }
  },

  // ================= FASE 2 — VISUALG (5 AULAS PROGRESSIVAS + SIMULADOR) =================
  {
    id: 'ptg-01',
    phase: 'fase2',
    phaseLabel: 'Fase 2 · VisualG',
    module: 'Estrutura Básica',
    title: '1. Primeiro algoritmo em VisualG',
    summary: 'Aprende a estrutura oficial de um programa em VisualG com algoritmo, var e inicio.',
    free: true,
    keyFeature: null,
    explanation: [
      'O VisualG permite escrever algoritmos em português antes de passares para linguagens como Python ou JavaScript.',
      'Todo algoritmo começa com o nome, declara variáveis em var (se precisar) e executa comandos entre inicio e fimalgoritmo.'
    ],
    keypoint: 'Experimenta alterar o texto abaixo no Simulador VisualG e clica em Executar.',
    codeTitle: 'Olá Start Programmer',
    code: 'algoritmo "Saudacao"\ninicio\n   escreval("Olá! Bem-vindo ao Start Programmer.")\n   escreval("Estou a aprender VisualG!")\nfimalgoritmo',
    hasSimulator: true,
    practice: {
      type: 'fill',
      question: 'Completa a palavra que encerra o bloco principal em VisualG:',
      promptTemplate: 'inicio\n   escreval("Teste")\n______________',
      accepted: ['fimalgoritmo'],
      hint: 'Junta "fim" com "algoritmo".',
      explanation: 'Todo programa em VisualG termina com a palavra-chave fimalgoritmo.'
    }
  },
  {
    id: 'ptg-02',
    phase: 'fase2',
    phaseLabel: 'Fase 2 · VisualG',
    module: 'Variáveis e I/O',
    title: '2. Variáveis, Leia e Escreva',
    summary: 'Declara variáveis no bloco var e faz cálculos reais em VisualG.',
    free: true,
    keyFeature: null,
    explanation: [
      'No bloco var indicamos o nome da variável e o seu tipo após dois pontos, por exemplo: idade: inteiro.',
      'Usa <- para atribuir valores e escreval() para mostrar texto e variáveis separados por vírgula.'
    ],
    keypoint: 'Podes usar escreva() na mesma linha ou escreval() para saltar para a linha seguinte.',
    codeTitle: 'Calculadora de Dobro',
    code: 'algoritmo "Dobro"\nvar\n   numero, dobro: inteiro\ninicio\n   numero <- 12\n   dobro <- numero * 2\n   escreval("Número: ", numero)\n   escreval("Dobro: ", dobro)\nfimalgoritmo',
    hasSimulator: true,
    practice: {
      type: 'logic',
      question: 'Se alterares "numero <- 12" para "numero <- 15" no simulador, qual será o valor de dobro?',
      options: ['25', '30', '17'],
      answer: 1,
      explanation: '15 * 2 resulta em 30.'
    }
  },
  {
    id: 'ptg-03',
    phase: 'fase2',
    phaseLabel: 'Fase 2 · VisualG',
    module: 'Decisão',
    title: '3. Condicionais em VisualG',
    summary: 'Implementa decisões com se, entao, senao e fimse no simulador.',
    free: false,
    keyFeature: 'visualg_full',
    explanation: [
      'As condições em VisualG avaliam expressões lógicas e escolhem qual bloco executar.',
      'Testa alterar o valor da nota no simulador para ver os dois caminhos em ação.'
    ],
    keypoint: 'Nunca te esqueças de fechar a estrutura com fimse.',
    codeTitle: 'Verificação de Nota',
    code: 'algoritmo "VerificarNota"\nvar\n   nota: inteiro\ninicio\n   nota <- 14\n   se nota >= 10 entao\n      escreval("Resultado: Aprovado com ", nota)\n   senao\n      escreval("Resultado: Reprovado com ", nota)\n   fimse\nfimalgoritmo',
    hasSimulator: true,
    practice: {
      type: 'mc',
      question: 'Qual instrução fecha corretamente um bloco "se" em VisualG?',
      options: ['fimse', 'fimalgoritmo', 'pare'],
      answer: 0,
      explanation: 'Cada bloco "se" aberto deve ser fechado com "fimse".'
    }
  },
  {
    id: 'ptg-04',
    phase: 'fase2',
    phaseLabel: 'Fase 2 · VisualG',
    module: 'Repetições',
    title: '4. Ciclos com Para e Enquanto',
    summary: 'Cria tabuadas e contagens automáticas em poucas linhas.',
    free: false,
    keyFeature: 'visualg_full',
    explanation: [
      'O ciclo para i de 1 ate 5 faca repete as instruções automaticamente aumentando o valor de i a cada volta.',
      'É perfeito para listas numeradas, somatórios e tabuadas.'
    ],
    keypoint: 'Experimenta mudar o número base da tabuada no código abaixo.',
    codeTitle: 'Tabuada do 5',
    code: 'algoritmo "Tabuada"\nvar\n   i, base, res: inteiro\ninicio\n   base <- 5\n   para i de 1 ate 5 faca\n      res <- base * i\n      escreval(base, " x ", i, " = ", res)\n   fimpara\nfimalgoritmo',
    hasSimulator: true,
    practice: {
      type: 'logic',
      question: 'Quantas linhas de resultado imprime "para i de 1 ate 5 faca"?',
      options: ['4 linhas', '5 linhas', '6 linhas'],
      answer: 1,
      explanation: 'O contador passa por 1, 2, 3, 4 e 5 — exatamente 5 repetições.'
    }
  },
  {
    id: 'ptg-05',
    phase: 'fase2',
    phaseLabel: 'Fase 2 · VisualG',
    module: 'Projeto Guiado',
    title: '5. Desafio Final de VisualG',
    summary: 'Combina variáveis, operações e decisões para calcular uma média escolar completa.',
    free: false,
    keyFeature: 'visualg_full',
    explanation: [
      'Agora vais juntar tudo o que aprendeste: declarar variáveis reais, calcular a média de três notas e decidir a situação do aluno.',
      'Executa no simulador e testa com diferentes valores.'
    ],
    keypoint: 'A prática constante consolida o raciocínio antes de escolheres uma linguagem profissional.',
    codeTitle: 'Média Escolar',
    code: 'algoritmo "MediaFinal"\nvar\n   n1, n2, n3, media: real\ninicio\n   n1 <- 12\n   n2 <- 15\n   n3 <- 18\n   media <- (n1 + n2 + n3) / 3\n   escreval("Média: ", media)\n   se media >= 10 entao\n      escreval("Estado: Aprovado")\n   senao\n      escreval("Estado: Reprovado")\n   fimse\nfimalgoritmo',
    hasSimulator: true,
    practice: {
      type: 'tf',
      question: 'Verdadeiro ou Falso: Sem parênteses em n1 + n2 + n3 / 3, apenas n3 seria dividido por 3.',
      options: ['Verdadeiro', 'Falso'],
      answer: 0,
      explanation: 'Verdadeiro. A divisão tem prioridade sobre a soma, por isso os parênteses são obrigatórios.'
    }
  }
];

/**
 * Fase 3 — As 6 áreas da programação
 */
const PROGRAMMING_AREAS = [
  {
    id: 'web',
    name: 'Desenvolvimento Web',
    whatItDoes: 'Cria sites, lojas online, portais e aplicações que correm diretamente no navegador.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'APIs REST'],
    canBuild: 'Landing pages, plataformas educativas, sistemas de gestão e lojas digitais.'
  },
  {
    id: 'mobile',
    name: 'Desenvolvimento Mobile',
    whatItDoes: 'Constrói aplicações nativas e multiplataforma para telemóveis Android e iOS.',
    technologies: ['Kotlin', 'Swift', 'Flutter', 'Dart', 'React Native'],
    canBuild: 'Apps de entregas, carteiras digitais, rastreadores de hábitos e redes sociais.'
  },
  {
    id: 'software',
    name: 'Desenvolvimento de Software',
    whatItDoes: 'Desenvolve programas de desktop, sistemas empresariais robustos e serviços de retaguarda.',
    technologies: ['Java', 'C#', 'Python', 'C++', 'Bases de Dados SQL'],
    canBuild: 'Sistemas de faturação, software bancário, ferramentas de escritório e servidores.'
  },
  {
    id: 'ai',
    name: 'Inteligência Artificial',
    whatItDoes: 'Ensina máquinas a reconhecer padrões, compreender linguagem e apoiar decisões.',
    technologies: ['Python', 'Machine Learning', 'Redes Neuronais', 'Visão Computacional'],
    canBuild: 'Sistemas de recomendação, tradutores automáticos, detetores de fraude e assistentes.'
  },
  {
    id: 'data',
    name: 'Ciência de Dados',
    whatItDoes: 'Analisa grandes volumes de dados para extrair tendências, previsões e relatórios claros.',
    technologies: ['Python', 'SQL', 'Estatística', 'Pandas', 'Visualização de Dados'],
    canBuild: 'Painéis financeiros, previsões de vendas e estudos de comportamento.'
  },
  {
    id: 'cyber',
    name: 'Cibersegurança',
    whatItDoes: 'Protege redes, servidores e aplicações contra invasões, fugas de dados e ataques.',
    technologies: ['Redes TCP/IP', 'Linux', 'Criptografia', 'Testes de Intrusão', 'Python'],
    canBuild: 'Auditorias de segurança, sistemas de monitorização e defesa de infraestruturas.'
  }
];

/* --------------------------------------------------------------------------
   3. EXERCÍCIOS, DESAFIOS, TESTES, PROJETOS E BIBLIOTECA
   -------------------------------------------------------------------------- */

const EXERCISE_PACKS = [
  {
    id: 'pack-free',
    title: 'Pacote Inicial: Primeiros Passos',
    description: 'Pratica variáveis, tipos de dados e sequência lógica básica.',
    free: true,
    keyFeature: null,
    questions: [
      {
        type: 'mc',
        question: 'Qual opção representa corretamente um dado do tipo Caractere (Texto)?',
        options: ['"Angola"', '25', 'verdadeiro'],
        answer: 0,
        explanation: 'Textos em programação são sempre delimitados por aspas.'
      },
      {
        type: 'tf',
        question: 'Verdadeiro ou Falso: Uma variável pode guardar vários valores ao mesmo tempo sem usar vetores.',
        options: ['Verdadeiro', 'Falso'],
        answer: 1,
        explanation: 'Falso. Uma variável simples guarda apenas um valor de cada vez.'
      },
      {
        type: 'fill',
        question: 'Completa a declaração para guardar o número inteiro 2026:',
        promptTemplate: 'ano <- ______',
        accepted: ['2026'],
        hint: 'Escreve apenas o número.',
        explanation: 'Atribuímos o número diretamente sem aspas: ano <- 2026.'
      }
    ]
  },
  {
    id: 'pack-prem-1',
    title: 'Pacote Especial: Operadores e Decisões',
    description: 'Exercícios mistos de operadores lógicos, relacionais e estruturas condicionais.',
    free: false,
    keyFeature: 'exercises_pack',
    questions: [
      {
        type: 'logic',
        question: 'Se x = 8 e y = 4, qual é o resultado de (x > 5) E (y = 10)?',
        options: ['verdadeiro', 'falso'],
        answer: 1,
        explanation: 'y = 10 é falso. No operador E, basta uma parte falsa para tudo ser falso.'
      },
      {
        type: 'mc',
        question: 'Qual é o resto da divisão inteira 17 % 5?',
        options: ['3', '2', '1'],
        answer: 1,
        explanation: '5 cabe 3 vezes em 17 (15), sobrando 2.'
      },
      {
        type: 'fill',
        question: 'Completa a condição para verificar se idade é maior ou igual a 18:',
        promptTemplate: 'se idade ______ 18 entao',
        accepted: ['>='],
        hint: 'Usa dois símbolos juntos.',
        explanation: 'O operador relacional maior ou igual representa-se por >=.'
      }
    ]
  },
  {
    id: 'pack-prem-2',
    title: 'Pacote Especial: Ciclos e Vetores',
    description: 'Treina repetições controladas e acesso por índices em vetores.',
    free: false,
    keyFeature: 'exercises_pack',
    questions: [
      {
        type: 'logic',
        question: 'Num ciclo "para i de 2 ate 6 faca", qual é o último valor de i?',
        options: ['5', '6', '7'],
        answer: 1,
        explanation: 'O intervalo vai de 2 até 6 inclusive, terminando em 6.'
      },
      {
        type: 'tf',
        question: 'Verdadeiro ou Falso: Um vetor pode misturar textos e números reais na mesma declaração em VisualG clássico.',
        options: ['Verdadeiro', 'Falso'],
        answer: 1,
        explanation: 'Falso. Em VisualG, um vetor agrupa elementos do mesmo tipo.'
      }
    ]
  }
];

const CHALLENGES = [
  {
    id: 'chal-free',
    title: 'Desafio Inicial: Troca de Valores',
    description: 'Descobre como trocar os valores de duas variáveis A e B sem perder nenhum dado.',
    free: true,
    keyFeature: null,
    scenario: 'Tens A = 10 e B = 20. Se fizeres diretamente A <- B, perdes o valor 10. Como resolver?',
    options: [
      'Usar uma terceira variável auxiliar: aux <- A; A <- B; B <- aux',
      'Escrever A <- B e depois B <- A',
      'Apagar as variáveis e começar de novo'
    ],
    answer: 0,
    explanation: 'A variável auxiliar guarda temporariamente o valor de A antes de ser substituído por B.'
  },
  {
    id: 'chal-prem-1',
    title: 'Desafio Especial: Cofre Lógico',
    description: 'Analisa três condições em cadeia para descobrir o código que abre o cofre.',
    free: false,
    keyFeature: 'challenges_pack',
    scenario: 'Regras: (N é par) E (N > 10) E (N < 16) E (N % 3 = 0). Qual é o único número N válido?',
    options: ['12', '14', '15'],
    answer: 0,
    explanation: 'Entre 11 e 15, apenas 12 e 14 são pares. Destes, apenas 12 é divisível por 3 (12 % 3 = 0).'
  },
  {
    id: 'chal-prem-2',
    title: 'Desafio Especial: Rastreio de Ciclo',
    description: 'Calcula o acumulador final após executar um ciclo de repetição.',
    free: false,
    keyFeature: 'challenges_pack',
    scenario: 'soma <- 0; para i de 1 ate 4 faca: se (i % 2 = 0) entao soma <- soma + i. Quanto vale soma no fim?',
    options: ['4', '6', '10'],
    answer: 1,
    explanation: 'Apenas os pares entre 1 e 4 são somados: 2 + 4 = 6.'
  }
];

const TESTS = [
  {
    id: 'test-logic',
    title: 'Teste do Módulo: Lógica Básica',
    description: 'Avaliação gratuita sobre fundamentos, variáveis e tipos de dados.',
    free: true,
    keyFeature: null,
    questions: [
      {
        type: 'mc',
        question: 'Qual é a sequência correta de processamento de um programa?',
        options: ['Entrada -> Processamento -> Saída', 'Saída -> Entrada -> Erro', 'Processamento -> Saída -> Entrada'],
        answer: 0,
        explanation: 'Primeiro recebemos os dados (entrada), tratamo-los (processamento) e mostramos o resultado (saída).'
      },
      {
        type: 'tf',
        question: 'Verdadeiro ou Falso: Constantes permitem alterar o valor no meio do algoritmo.',
        options: ['Verdadeiro', 'Falso'],
        answer: 1,
        explanation: 'Falso. Constantes mantêm o mesmo valor durante toda a execução.'
      },
      {
        type: 'mc',
        question: 'Qual tipo de dado guarda apenas verdadeiro ou falso?',
        options: ['Inteiro', 'Lógico', 'Caractere'],
        answer: 1,
        explanation: 'O tipo lógico (booleano) armazena exclusivamente verdadeiro ou falso.'
      }
    ]
  },
  {
    id: 'test-adv-1',
    title: 'Teste Avançado: Lógica & VisualG Completo',
    description: 'Avaliação completa com operadores, condicionais, ciclos, vetores e funções.',
    free: false,
    keyFeature: 'tests_advanced',
    questions: [
      {
        type: 'logic',
        question: 'Se A = verdadeiro e B = falso, qual o valor de (NAO B) E A?',
        options: ['verdadeiro', 'falso'],
        answer: 0,
        explanation: 'NAO B vira verdadeiro. Verdadeiro E Verdadeiro resulta em verdadeiro.'
      },
      {
        type: 'mc',
        question: 'Numa matriz M[1..3, 1..4], quantos elementos cabem no total?',
        options: ['7', '12', '4'],
        answer: 1,
        explanation: '3 linhas multiplicadas por 4 colunas = 12 posições.'
      },
      {
        type: 'fill',
        question: 'Completa a palavra usada dentro de uma função para devolver o resultado:',
        promptTemplate: '______ a + b',
        accepted: ['retorne'],
        hint: 'Verbo retornar na 3.ª pessoa (7 letras).',
        explanation: 'A instrução retorne envia o resultado calculado de volta para quem chamou a função.'
      },
      {
        type: 'tf',
        question: 'Verdadeiro ou Falso: A instrução leia(x) em VisualG serve para mostrar o valor de x no ecrã.',
        options: ['Verdadeiro', 'Falso'],
        answer: 1,
        explanation: 'Falso. leia() serve para receber dados de entrada; escreva() mostra no ecrã.'
      }
    ]
  }
];

const PROJECTS = [
  {
    id: 'proj-free',
    title: 'Projeto 1: Calculadora de Média Escolar',
    level: 'Iniciante · Gratuito',
    free: true,
    keyFeature: null,
    goal: 'Construir um algoritmo em VisualG que recebe 2 notas, calcula a média e indica se o aluno passou.',
    steps: [
      'Declarar as variáveis n1, n2 e media do tipo real.',
      'Calcular media <- (n1 + n2) / 2.',
      'Usar se media >= 10 entao para mostrar "Aprovado" ou "Reprovado".'
    ],
    code: 'algoritmo "CalculadoraMedia"\nvar\n   n1, n2, media: real\ninicio\n   n1 <- 13\n   n2 <- 11\n   media <- (n1 + n2) / 2\n   escreval("Média final: ", media)\n   se media >= 10 entao\n      escreval("Situação: Aprovado")\n   senao\n      escreval("Situação: Reprovado")\n   fimse\nfimalgoritmo'
  },
  {
    id: 'proj-prem-1',
    title: 'Projeto 2: Conversor Kwanza para Euro',
    level: 'Intermédio · Premium',
    free: false,
    keyFeature: 'projects_pack',
    goal: 'Criar um conversor prático usando uma constante para a taxa de câmbio.',
    steps: [
      'Definir uma taxa fixa ou variável de conversão.',
      'Dividir o valor em Kwanzas pela taxa.',
      'Exibir o valor convertido com mensagem clara.'
    ],
    code: 'algoritmo "ConversorKwanza"\nvar\n   kz, taxa, euros: real\ninicio\n   kz <- 50000\n   taxa <- 1000\n   euros <- kz / taxa\n   escreval("Valor em Kz: ", kz)\n   escreval("Equivalente em EUR: ", euros)\nfimalgoritmo'
  },
  {
    id: 'proj-prem-2',
    title: 'Projeto 3: Simulador de Caixa Multicaixa',
    level: 'Intermédio · Premium',
    free: false,
    keyFeature: 'projects_pack',
    goal: 'Validar saldo disponível antes de autorizar um levantamento.',
    steps: [
      'Guardar saldo atual e valor do levantamento.',
      'Verificar se valor <= saldo e valor > 0.',
      'Atualizar o saldo restante ou mostrar aviso de saldo insuficiente.'
    ],
    code: 'algoritmo "CaixaMulticaixa"\nvar\n   saldo, levantamento: real\ninicio\n   saldo <- 25000\n   levantamento <- 10000\n   se (levantamento > 0) e (levantamento <= saldo) entao\n      saldo <- saldo - levantamento\n      escreval("Levantamento aprovado. Novo saldo: ", saldo)\n   senao\n      escreval("Operação recusada. Verifique o saldo.")\n   fimse\nfimalgoritmo'
  }
];

const LIBRARY_MATERIALS = [
  {
    id: 'lib-free',
    title: 'Guia Rápido: Tipos de Dados e Operadores',
    category: 'Resumo Visual',
    free: true,
    keyFeature: null,
    content: 'Inteiro: números sem casas decimais (10, -3). Real: números com decimais (3.14). Caractere: textos entre aspas ("Olá"). Lógico: verdadeiro ou falso. Operadores: + - * / % (aritméticos), > < >= <= = <> (relacionais), E OU NAO (lógicos).'
  },
  {
    id: 'lib-prem-1',
    title: 'Folha de Consulta: Estruturas em VisualG',
    category: 'Sintaxe',
    free: false,
    keyFeature: 'library_pack',
    content: 'Condicional: se <cond> entao ... senao ... fimse. Ciclo contado: para i de 1 ate N faca ... fimpara. Ciclo condicional: enquanto <cond> faca ... fimenquanto. Entrada/Saída: leia(x), escreva(x), escreval(x).'
  },
  {
    id: 'lib-prem-2',
    title: 'Modelos de Algoritmos Clássicos',
    category: 'Boas Práticas',
    free: false,
    keyFeature: 'library_pack',
    content: '1) Acumulador: soma <- soma + valor. 2) Contador: cont <- cont + 1. 3) Troca de valores: aux <- a; a <- b; b <- aux. 4) Maior valor: se novo > maior entao maior <- novo.'
  }
];

/* --------------------------------------------------------------------------
   4. FUNÇÕES AUXILIARES, SEGURANÇA HTML E CONTROLO DE ACESSO
   -------------------------------------------------------------------------- */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nowFormatted() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function addHistory(text) {
  state.history.unshift({ date: nowFormatted(), text });
  if (state.history.length > 40) state.history.length = 40;
  saveState();
}

function isStudentBlocked() {
  return state.student.status === 'bloqueado';
}

function hasFeatureAccess(featureId) {
  if (!featureId) return true;
  if (isStudentBlocked()) return false;
  const keyObj = OFFICIAL_KEYS.find((k) => k.featureId === featureId);
  if (keyObj && keyObj.alwaysFree) return true;
  if (keyObj && state.blockedKeys.includes(keyObj.key)) return false;
  return state.unlockedFeatures.includes(featureId);
}

function isLessonUnlocked(lesson) {
  if (lesson.free) return true;
  return hasFeatureAccess(lesson.keyFeature);
}

function getCompletionStats() {
  const total = LESSONS.length;
  const done = state.completedLessons.filter((id) => LESSONS.some((l) => l.id === id)).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, percent };
}

function getKeyTitleByFeature(featureId) {
  const found = OFFICIAL_KEYS.find((k) => k.featureId === featureId);
  return found ? found.title : 'Funcionalidade Premium';
}

/* --------------------------------------------------------------------------
   5. SIMULADOR INTERATIVO DE VISUALG (Execução Segura no Navegador)
   -------------------------------------------------------------------------- */

function analyzeVisualGSyntax(source) {
  const errors = [];
  const raw = String(source || '');
  if (!raw.trim()) {
    return {
      ok: false,
      errors: ['O editor está vazio. Escreve ou cola o teu código para verificar.'],
      hasWrite: false,
      hasAssign: false,
      hasIf: false
    };
  }

  const rawLines = raw.split(/\r?\n/);
  const validTypes = new Set(['inteiro', 'real', 'caractere', 'caracter', 'logico', 'lógico']);
  const declaredVars = new Set();
  const blockStack = [];

  let section = 'header'; // header -> var -> body -> done
  let hasAlgoritmo = false;
  let hasVarBlock = false;
  let hasInicio = false;
  let hasFimalgoritmo = false;
  let hasWrite = false;
  let hasAssign = false;
  let hasIf = false;

  const stripStrings = (str) => str.replace(/"[^"]*"/g, ' "" ');

  const hasBalancedQuotes = (line) => {
    const count = (line.match(/"/g) || []).length;
    return count % 2 === 0;
  };

  const hasBalancedParens = (line) => {
    let depth = 0;
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQuotes = !inQuotes;
      if (inQuotes) continue;
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth < 0) return false;
      }
    }
    return depth === 0;
  };

  const splitArgsStrict = (argStr) => {
    const args = [];
    let current = '';
    let inQuotes = false;
    let parenDepth = 0;
    for (let i = 0; i < argStr.length; i++) {
      const ch = argStr[i];
      if (ch === '"') inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === '(') parenDepth++;
        else if (ch === ')') parenDepth--;
      }
      if (ch === ',' && !inQuotes && parenDepth === 0) {
        args.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    args.push(current.trim());
    return args;
  };

  const validateExpression = (expr, lineNum) => {
    const clean = expr.trim();
    if (!clean) {
      errors.push(`Linha ${lineNum}: Expressão vazia.`);
      return;
    }
    if (!hasBalancedQuotes(clean)) {
      errors.push(`Linha ${lineNum}: Aspas por fechar na expressão.`);
      return;
    }
    if (!hasBalancedParens(clean)) {
      errors.push(`Linha ${lineNum}: Parênteses desequilibrados na expressão.`);
      return;
    }
    const noStrings = stripStrings(clean);
    if (/[^0-9a-zA-ZÀ-ÿ_+\-*/%().!<>=&|,\s"]/.test(noStrings)) {
      errors.push(`Linha ${lineNum}: Carateres inválidos na expressão "${clean}".`);
      return;
    }
    if (hasVarBlock) {
      const keywords = new Set(['verdadeiro', 'falso', 'e', 'ou', 'nao', 'não']);
      const ids = noStrings.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
      ids.forEach((id) => {
        if (!keywords.has(id.toLowerCase()) && !declaredVars.has(id)) {
          errors.push(`Linha ${lineNum}: Variável "${id}" não foi declarada no bloco var.`);
        }
      });
    }
  };

  rawLines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const line = rawLine.trim();
    if (!line || line.startsWith('//')) return;

    if (!hasBalancedQuotes(line)) {
      errors.push(`Linha ${lineNum}: Aspas por fechar em "${line}".`);
    }
    if (!hasBalancedParens(line)) {
      errors.push(`Linha ${lineNum}: Parênteses desequilibrados em "${line}".`);
    }

    if (section === 'done') {
      errors.push(`Linha ${lineNum}: Código encontrado após "fimalgoritmo".`);
      return;
    }

    if (section === 'header') {
      if (/^algoritmo\s+("[^"]+"|'[^']+')$/i.test(line)) {
        if (hasAlgoritmo) {
          errors.push(`Linha ${lineNum}: Declaração "algoritmo" repetida.`);
        }
        hasAlgoritmo = true;
        return;
      }
      if (/^algoritmo\b/i.test(line)) {
        errors.push(`Linha ${lineNum}: Usa o formato algoritmo "NomeDoAlgoritmo".`);
        hasAlgoritmo = true;
        return;
      }
      if (/^var$/i.test(line)) {
        if (!hasAlgoritmo) {
          errors.push(`Linha ${lineNum}: "algoritmo" deve aparecer antes de "var".`);
        }
        hasVarBlock = true;
        section = 'var';
        return;
      }
      if (/^inicio$/i.test(line)) {
        hasInicio = true;
        section = 'body';
        return;
      }
      errors.push(`Linha ${lineNum}: Instrução inválida no cabeçalho: "${line}". Esperado "algoritmo", "var" ou "inicio".`);
      return;
    }

    if (section === 'var') {
      if (/^inicio$/i.test(line)) {
        hasInicio = true;
        section = 'body';
        return;
      }
      const varMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s*:\s*(.+)$/);
      if (!varMatch) {
        errors.push(`Linha ${lineNum}: Declaração inválida em var: "${line}". Exemplo: idade: inteiro`);
        return;
      }
      const names = varMatch[1].split(',').map((n) => n.trim());
      const typeRaw = varMatch[2].trim().toLowerCase();
      const vetorMatch = typeRaw.match(/^vetor\s*\[\s*[^\]]+\s*\]\s*de\s+([a-zÀ-ÿ]+)$/);
      const baseType = vetorMatch ? vetorMatch[1] : typeRaw;

      if (!validTypes.has(baseType)) {
        errors.push(`Linha ${lineNum}: Tipo de dados desconhecido "${varMatch[2].trim()}". Tipos válidos: inteiro, real, caractere, logico.`);
        return;
      }
      names.forEach((n) => declaredVars.add(n));
      return;
    }

    // section === 'body'
    if (/^fimalgoritmo$/i.test(line)) {
      hasFimalgoritmo = true;
      section = 'done';
      return;
    }

    if (/^inicio$/i.test(line)) {
      errors.push(`Linha ${lineNum}: Palavra-chave "inicio" repetida.`);
      return;
    }

    // escreva(...) ou escreval(...)
    const writeMatch = line.match(/^escreval?\((.*)\)$/i);
    if (writeMatch) {
      hasWrite = true;
      const argContent = writeMatch[1].trim();
      if (!argContent) {
        errors.push(`Linha ${lineNum}: escreva/escreval precisa de pelo menos um valor dentro dos parênteses.`);
        return;
      }
      const args = splitArgsStrict(argContent);
      if (args.some((a) => a === '')) {
        errors.push(`Linha ${lineNum}: Vírgula extra ou argumento vazio em escreva/escreval.`);
        return;
      }
      args.forEach((arg) => validateExpression(arg, lineNum));
      return;
    }

    // leia(v1, v2)
    const leiaMatch = line.match(/^leia\((.+)\)$/i);
    if (leiaMatch) {
      const varsInRead = leiaMatch[1].split(',').map((v) => v.trim());
      varsInRead.forEach((vName) => {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(vName)) {
          errors.push(`Linha ${lineNum}: Nome de variável inválido em leia(): "${vName}".`);
        } else if (hasVarBlock && !declaredVars.has(vName)) {
          errors.push(`Linha ${lineNum}: Variável "${vName}" usada em leia() não foi declarada em var.`);
        }
      });
      return;
    }

    // Atribuição: var <- expr
    const assignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*<-\s*(.*)$/);
    if (assignMatch) {
      hasAssign = true;
      const target = assignMatch[1];
      const rhs = assignMatch[2].trim();
      if (hasVarBlock && !declaredVars.has(target)) {
        errors.push(`Linha ${lineNum}: Variável "${target}" não foi declarada no bloco var.`);
      }
      validateExpression(rhs, lineNum);
      return;
    }

    // Condicional se ... entao
    const seMatch = line.match(/^se\s+(.+)\s+entao$/i);
    if (seMatch) {
      hasIf = true;
      validateExpression(seMatch[1], lineNum);
      blockStack.push({ type: 'se', hasElse: false, line: lineNum });
      return;
    }

    if (/^senao$/i.test(line)) {
      const top = blockStack[blockStack.length - 1];
      if (!top || top.type !== 'se') {
        errors.push(`Linha ${lineNum}: "senao" sem um bloco "se ... entao" correspondente.`);
      } else if (top.hasElse) {
        errors.push(`Linha ${lineNum}: Bloco "se" já possui um "senao".`);
      } else {
        top.hasElse = true;
      }
      return;
    }

    if (/^fimse$/i.test(line)) {
      const top = blockStack[blockStack.length - 1];
      if (!top || top.type !== 'se') {
        errors.push(`Linha ${lineNum}: "fimse" sem um "se ... entao" aberto.`);
      } else {
        blockStack.pop();
      }
      return;
    }

    // Ciclo para
    const paraMatch = line.match(/^para\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+de\s+(.+)\s+ate\s+(.+)\s+faca$/i);
    if (paraMatch) {
      const loopVar = paraMatch[1];
      if (hasVarBlock && !declaredVars.has(loopVar)) {
        errors.push(`Linha ${lineNum}: Variável de controlo "${loopVar}" não foi declarada em var.`);
      }
      validateExpression(paraMatch[2], lineNum);
      validateExpression(paraMatch[3], lineNum);
      blockStack.push({ type: 'para', line: lineNum });
      return;
    }

    if (/^fimpara$/i.test(line)) {
      const top = blockStack[blockStack.length - 1];
      if (!top || top.type !== 'para') {
        errors.push(`Linha ${lineNum}: "fimpara" sem um "para ... faca" aberto.`);
      } else {
        blockStack.pop();
      }
      return;
    }

    // Ciclo enquanto
    const whileMatch = line.match(/^enquanto\s+(.+)\s+faca$/i);
    if (whileMatch) {
      validateExpression(whileMatch[1], lineNum);
      blockStack.push({ type: 'enquanto', line: lineNum });
      return;
    }

    if (/^fimenquanto$/i.test(line)) {
      const top = blockStack[blockStack.length - 1];
      if (!top || top.type !== 'enquanto') {
        errors.push(`Linha ${lineNum}: "fimenquanto" sem um "enquanto ... faca" aberto.`);
      } else {
        blockStack.pop();
      }
      return;
    }

    errors.push(`Linha ${lineNum}: Instrução não reconhecida ou erro de sintaxe: "${line}".`);
  });

  if (!hasAlgoritmo) errors.push('Falta a linha inicial: algoritmo "Nome".');
  if (!hasInicio) errors.push('Falta a palavra-chave "inicio" antes das instruções.');
  if (!hasFimalgoritmo) errors.push('Falta a palavra-chave "fimalgoritmo" no final do programa.');

  while (blockStack.length > 0) {
    const unclosed = blockStack.pop();
    const closer = unclosed.type === 'se' ? 'fimse' : unclosed.type === 'para' ? 'fimpara' : 'fimenquanto';
    errors.push(`Linha ${unclosed.line}: Bloco "${unclosed.type}" aberto sem "${closer}".`);
  }

  return {
    ok: errors.length === 0,
    errors,
    hasWrite,
    hasAssign,
    hasIf
  };
}

function runVisualGCode(source) {
  const analysis = analyzeVisualGSyntax(source);
  if (!analysis.ok) {
    return 'Erros encontrados:\n- ' + analysis.errors.join('\n- ');
  }

  const lines = source.split(/\r?\n/).map((l) => l.trim());
  const vars = {};
  const output = [];
  let inBody = false;

  const evalExpr = (expr) => {
    const clean = expr.trim();
    if (!clean) return '';
    if (/^"[^"]*"$/.test(clean)) return clean.slice(1, -1);

    let jsExpr = clean
      .replace(/\bverdadeiro\b/gi, 'true')
      .replace(/\bfalso\b/gi, 'false')
      .replace(/\bNAO\b/gi, '!')
      .replace(/\bE\b/gi, '&&')
      .replace(/\bOU\b/gi, '||')
      .replace(/<>/g, '!==')
      .replace(/(?<![<>!])=(?!=)/g, '===');

    jsExpr = jsExpr.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (match) => {
      if (match === 'true' || match === 'false') return match;
      if (Object.prototype.hasOwnProperty.call(vars, match)) {
        const val = vars[match];
        return typeof val === 'string' ? JSON.stringify(val) : String(val);
      }
      return '0';
    });

    try {
      if (/[^0-9a-zA-Z_+\-*/%().!<>=&|"\s',]/.test(jsExpr)) {
        return clean;
      }
      // eslint-disable-next-line no-new-func
      const fn = new Function(`"use strict"; return (${jsExpr});`);
      return fn();
    } catch {
      return clean;
    }
  };

  const splitArgs = (argStr) => {
    const args = [];
    let current = '';
    let inQuotes = false;
    let parenDepth = 0;
    for (let i = 0; i < argStr.length; i++) {
      const ch = argStr[i];
      if (ch === '"') inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === '(') parenDepth++;
        else if (ch === ')') parenDepth--;
      }
      if (ch === ',' && !inQuotes && parenDepth === 0) {
        args.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) args.push(current.trim());
    return args;
  };

  const executeBlock = (blockLines, startIdx = 0) => {
    let i = startIdx;
    while (i < blockLines.length) {
      const line = blockLines[i];
      if (!line || line.startsWith('//')) {
        i++;
        continue;
      }
      if (/^fimalgoritmo$/i.test(line)) {
        return blockLines.length;
      }
      if (/^inicio$/i.test(line)) {
        inBody = true;
        i++;
        continue;
      }
      if (!inBody) {
        i++;
        continue;
      }

      const writeMatch = line.match(/^escreval?\((.*)\)$/i);
      if (writeMatch) {
        const parts = splitArgs(writeMatch[1]).map((p) => String(evalExpr(p)));
        output.push(parts.join(''));
        i++;
        continue;
      }

      const leiaMatch = line.match(/^leia\((.+)\)$/i);
      if (leiaMatch) {
        leiaMatch[1].split(',').map((v) => v.trim()).forEach((vName) => {
          if (!Object.prototype.hasOwnProperty.call(vars, vName)) vars[vName] = 0;
        });
        i++;
        continue;
      }

      const assignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*<-\s*(.+)$/);
      if (assignMatch) {
        vars[assignMatch[1]] = evalExpr(assignMatch[2]);
        i++;
        continue;
      }

      const ifMatch = line.match(/^se\s+(.+)\s+entao$/i);
      if (ifMatch) {
        const condVal = Boolean(evalExpr(ifMatch[1]));
        const thenLines = [];
        const elseLines = [];
        let depth = 1;
        let inElse = false;
        let j = i + 1;
        while (j < blockLines.length && depth > 0) {
          const inner = blockLines[j];
          if (/^se\s+.+\s+entao$/i.test(inner)) depth++;
          else if (/^fimse$/i.test(inner)) {
            depth--;
            if (depth === 0) break;
          } else if (/^senao$/i.test(inner) && depth === 1) {
            inElse = true;
            j++;
            continue;
          }
          if (inElse) elseLines.push(inner);
          else thenLines.push(inner);
          j++;
        }
        executeBlock(condVal ? thenLines : elseLines, 0);
        i = j + 1;
        continue;
      }

      const forMatch = line.match(/^para\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+de\s+(.+)\s+ate\s+(.+)\s+faca$/i);
      if (forMatch) {
        const loopVar = forMatch[1];
        const startVal = Number(evalExpr(forMatch[2]));
        const endVal = Number(evalExpr(forMatch[3]));
        const loopBody = [];
        let depth = 1;
        let j = i + 1;
        while (j < blockLines.length && depth > 0) {
          const inner = blockLines[j];
          if (/^para\s+/i.test(inner)) depth++;
          else if (/^fimpara$/i.test(inner)) {
            depth--;
            if (depth === 0) break;
          }
          loopBody.push(inner);
          j++;
        }
        if (!Number.isNaN(startVal) && !Number.isNaN(endVal)) {
          const maxSteps = Math.min(endVal, startVal + 50);
          for (let v = startVal; v <= maxSteps; v++) {
            vars[loopVar] = v;
            executeBlock(loopBody, 0);
          }
        }
        i = j + 1;
        continue;
      }

      const whileMatch = line.match(/^enquanto\s+(.+)\s+faca$/i);
      if (whileMatch) {
        const loopBody = [];
        let depth = 1;
        let j = i + 1;
        while (j < blockLines.length && depth > 0) {
          const inner = blockLines[j];
          if (/^enquanto\s+/i.test(inner)) depth++;
          else if (/^fimenquanto$/i.test(inner)) {
            depth--;
            if (depth === 0) break;
          }
          loopBody.push(inner);
          j++;
        }
        let guard = 0;
        while (Boolean(evalExpr(whileMatch[1])) && guard < 50) {
          executeBlock(loopBody, 0);
          guard++;
        }
        i = j + 1;
        continue;
      }

      i++;
    }
    return i;
  };

  executeBlock(lines, 0);
  if (output.length === 0) {
    return 'Execução concluída sem saída no ecrã. Confirma se existem instruções escreval(...) entre inicio e fimalgoritmo.';
  }
  return output.join('\n');
}

/* --------------------------------------------------------------------------
   5B. VERIFICAÇÃO GRATUITA DE CÓDIGO (VALIDAÇÃO E PROGRESSÃO)
   -------------------------------------------------------------------------- */

const CODE_VERIFICATION_TASKS = [
  {
    id: 'ver-1',
    title: 'Nível 1: Primeira Mensagem',
    instruction: 'Escreve um algoritmo válido com algoritmo, inicio, fimalgoritmo e usa escreval("...") para mostrar uma mensagem no ecrã.',
    starter: 'algoritmo "MinhaMensagem"\ninicio\n   escreval("Olá Start Programmer!")\nfimalgoritmo',
    requireAssign: false,
    requireIf: false
  },
  {
    id: 'ver-2',
    title: 'Nível 2: Variável e Soma',
    instruction: 'Declara ou atribui uma variável com <- (ex: total <- 10 + 5) e mostra o resultado com escreval(...).',
    starter: 'algoritmo "SomaSimples"\nvar\n   total: inteiro\ninicio\n   total <- 10 + 5\n   escreval("Total: ", total)\nfimalgoritmo',
    requireAssign: true,
    requireIf: false
  },
  {
    id: 'ver-3',
    title: 'Nível 3: Decisão com SE',
    instruction: 'Usa uma estrutura condicional se ... entao ... fimse para testar um número e mostrar o resultado.',
    starter: 'algoritmo "TesteNota"\nvar\n   nota: inteiro\ninicio\n   nota <- 14\n   se nota >= 10 entao\n      escreval("Aprovado")\n   senao\n      escreval("Em recuperação")\n   fimse\nfimalgoritmo',
    requireAssign: true,
    requireIf: true
  },
  {
    id: 'ver-free',
    title: 'Verificação Livre de Código',
    instruction: 'Cola ou escreve o teu algoritmo em VisualG para verificar se a estrutura, blocos e saída estão corretos.',
    starter: 'algoritmo "Livre"\nvar\n   i: inteiro\ninicio\n   para i de 1 ate 3 faca\n      escreval("Passo ", i)\n   fimpara\nfimalgoritmo',
    requireAssign: false,
    requireIf: false
  }
];

function verifyVisualGCode(source, task) {
  const analysis = analyzeVisualGSyntax(source);
  const errors = [...analysis.errors];

  if (!analysis.hasWrite) {
    errors.push('Adiciona pelo menos uma instrução escreva(...) ou escreval(...) para produzir saída.');
  }

  if (task && task.requireAssign && !analysis.hasAssign) {
    errors.push('Este nível exige uma atribuição de variável com "<-".');
  }

  if (task && task.requireIf && !analysis.hasIf) {
    errors.push('Este nível exige uma estrutura condicional "se ... entao ... fimse".');
  }

  if (errors.length > 0) {
    return { ok: false, errors, output: '' };
  }

  const output = runVisualGCode(source.trim());
  return { ok: true, errors: [], output };
}

/* --------------------------------------------------------------------------
   6. ATIVAÇÃO DE CHAVES & AÇÕES ADMINISTRATIVAS LOCAIS
   -------------------------------------------------------------------------- */

function activateKey(rawKey) {
  const cleanKey = String(rawKey || '').trim().toLowerCase();
  if (!cleanKey) {
    return { ok: false, message: 'Insere uma chave de acesso antes de validar.' };
  }

  if (isStudentBlocked()) {
    return { ok: false, message: 'O teu acesso local está bloqueado no Painel de Administração.' };
  }

  const found = OFFICIAL_KEYS.find((item) => item.key === cleanKey);
  if (!found) {
    return { ok: false, message: 'Chave inválida. Verifica os carateres e tenta novamente.' };
  }

  if (found.alwaysFree) {
    return { ok: true, message: `A funcionalidade "${found.title}" já está disponível gratuitamente sem necessidade de chave.` };
  }

  if (state.blockedKeys.includes(found.key)) {
    return { ok: false, message: `A chave "${found.key}" está bloqueada pela administração local.` };
  }

  if (state.unlockedFeatures.includes(found.featureId)) {
    return { ok: true, message: `A funcionalidade "${found.title}" já está desbloqueada.` };
  }

  state.unlockedFeatures.push(found.featureId);
  state.keyActivations.unshift({
    date: nowFormatted(),
    userId: state.student.id,
    userName: state.student.name,
    key: found.key,
    feature: found.title,
    action: 'Ativada'
  });
  addHistory(`Chave ativada: ${found.key} (${found.title})`);
  saveState();
  return { ok: true, message: `Chave válida! Desbloqueaste: ${found.title}.` };
}

function getKeyStatus(keyItem) {
  if (state.blockedKeys.includes(keyItem.key)) return 'bloqueada';
  const usedByStudent = state.unlockedFeatures.includes(keyItem.featureId);
  const usedByUsers = state.users.some((u) => u.activatedKeys.includes(keyItem.key));
  if (usedByStudent || usedByUsers) return 'utilizada';
  return 'disponivel';
}

function getUsersForKey(keyCode) {
  const list = [];
  const keyObj = OFFICIAL_KEYS.find((k) => k.key === keyCode);
  if (keyObj && state.unlockedFeatures.includes(keyObj.featureId)) {
    list.push(state.student.name + ' (Atual)');
  }
  state.users.forEach((u) => {
    if (u.activatedKeys.includes(keyCode)) list.push(u.name);
  });
  return list;
}

/* --------------------------------------------------------------------------
   7. TOASTS E MODAL ACESSÍVEL
   -------------------------------------------------------------------------- */

function showToast(message, type = 'info') {
  const region = document.getElementById('toast-region');
  if (!region) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  region.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 3400);
}

function openModal({ title, bodyHtml, confirmLabel, cancelLabel = 'Cancelar', danger = false, onConfirm }) {
  const backdrop = document.getElementById('app-modal');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const actionsEl = document.getElementById('modal-actions');
  if (!backdrop || !titleEl || !bodyEl || !actionsEl) return;

  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHtml;
  actionsEl.innerHTML = '';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-outline-dark btn-sm';
  cancelBtn.textContent = cancelLabel;
  cancelBtn.addEventListener('click', closeModal);
  actionsEl.appendChild(cancelBtn);

  if (confirmLabel && typeof onConfirm === 'function') {
    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.className = `btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`;
    okBtn.textContent = confirmLabel;
    okBtn.addEventListener('click', () => {
      onConfirm();
      closeModal();
    });
    actionsEl.appendChild(okBtn);
  }

  backdrop.hidden = false;
}

function closeModal() {
  const backdrop = document.getElementById('app-modal');
  if (backdrop) backdrop.hidden = true;
}

/* --------------------------------------------------------------------------
   8. RENDERIZAÇÃO DAS VISTAS
   -------------------------------------------------------------------------- */

function navigate(view) {
  currentView = view;
  const mobileDrawer = document.getElementById('mobile-drawer');
  const menuBtn = document.getElementById('mobile-menu-btn');
  if (mobileDrawer && !mobileDrawer.hidden) {
    mobileDrawer.hidden = true;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }

  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach((el) => {
    el.classList.toggle('active', el.getAttribute('data-nav') === view);
  });

  if (window.location.hash !== `#${view}`) {
    history.replaceState(null, '', `#${view}`);
  }

  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function render() {
  document.body.classList.toggle('reading-large', Boolean(state.student.readingLarge));

  const headerCta = document.getElementById('header-cta-btn');
  if (headerCta) {
    const stats = getCompletionStats();
    headerCta.textContent = stats.done > 0 ? 'Continuar Aula' : 'Começar';
  }

  const main = document.getElementById('app-main');
  if (!main) return;

  switch (currentView) {
    case 'home':
      main.innerHTML = renderHomeView();
      bindHomeEvents();
      break;
    case 'learn':
      main.innerHTML = renderLearnView();
      bindLearnEvents();
      break;
    case 'practice':
      main.innerHTML = renderPracticeView();
      bindPracticeEvents();
      break;
    case 'premium':
      main.innerHTML = renderPremiumView();
      bindPremiumEvents();
      break;
    case 'dashboard':
      main.innerHTML = renderDashboardView();
      bindDashboardEvents();
      break;
    case 'profile':
      main.innerHTML = renderProfileView();
      bindProfileEvents();
      break;
    case 'help':
    case 'about':
      main.innerHTML = renderHelpAboutView();
      bindHelpEvents();
      break;
    case 'admin':
      main.innerHTML = renderAdminView();
      bindAdminEvents();
      break;
    default:
      main.innerHTML = renderHomeView();
      bindHomeEvents();
  }
}

/* -------------------- VISTA: PÁGINA INICIAL -------------------- */

function renderHomeView() {
  const stats = getCompletionStats();
  const lastLesson = LESSONS.find((l) => l.id === state.lastLessonId) || LESSONS[0];

  return `
    <div class="container stack-lg">
      <section class="hero-grid">
        <div class="hero-panel">
          <div class="hero-brand-row">
            <img
              class="hero-logo"
              src="./logo.png"
              alt="Ícone Start Programmer"
              width="54"
              height="54"
            />
            <div>
              <div class="hero-slogan">Aprende. Pratica. Programa.</div>
              <div class="meta-row">Start Programmer · Ensino desde o zero</div>
            </div>
          </div>

          <h1 class="hero-title">Aprende programação passo a passo, sem complicações.</h1>
          <p class="hero-desc">
            Começa pela Lógica de Programação, pratica em VisualG no seu melhor app e descobre a área tecnológica ideal para o teu futuro.
          </p>

          <div class="hero-actions">
            <button type="button" class="btn btn-white" id="hero-start-btn">
              ${stats.done > 0 ? 'Continuar a aprender' : 'Começar a aprender'}
            </button>
            <button type="button" class="btn btn-outline-light" data-goto="learn">
              Área de Aprendizagem
            </button>
            <button type="button" class="btn btn-outline-light" id="hero-verify-btn">
              Verificar Código
            </button>
            <button type="button" class="btn btn-outline-light" data-goto="premium">
              Área Premium
            </button>
          </div>
        </div>

        <div class="card-navy hero-preview-card">
          <div class="stack-sm">
            <div class="row-between">
              <strong>O teu progresso atual</strong>
              <span class="tabular status-label status-free">${stats.percent}% concluído</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${stats.percent}%"></div>
            </div>
            <div class="meta-row">
              <span class="tabular">${stats.done} de ${stats.total} aulas</span>
              <span class="meta-sep" aria-hidden="true">·</span>
              <span>Última aula: ${escapeHtml(lastLesson.title)}</span>
            </div>
          </div>

          <div class="code-window">
            <div class="code-window-bar">
              <span>Exemplo em VisualG</span>
              <span>Fase 2</span>
            </div>
            <pre class="code-block"><span class="code-kw">algoritmo</span> <span class="code-str">"PrimeiroPasso"</span>
<span class="code-kw">var</span>
   meta: <span class="code-kw">inteiro</span>
<span class="code-kw">inicio</span>
   meta &lt;- <span class="code-num">1</span>
   escreval(<span class="code-str">"Hoje comecei a programar!"</span>)
<span class="code-kw">fimalgoritmo</span></pre>
          </div>
        </div>
      </section>

      <section class="stack-md">
        <div class="section-header">
          <div>
            <h2 class="section-title">Percurso de Aprendizagem</h2>
            <p class="section-subtitle">Três fases organizadas para construíres bases sólidas antes de escolher uma especialização.</p>
          </div>
        </div>

        <div class="grid-3">
          <article class="card-white stack-sm">
            <div class="meta-row">
              <span>Fase 1</span>
              <span class="meta-sep" aria-hidden="true">·</span>
              <span>15 Aulas</span>
            </div>
            <h3>Lógica de Programação</h3>
            <p class="muted-light">Algoritmos, variáveis, operadores, condições, ciclos, vetores, matrizes e funções com prática em cada aula.</p>
            <button type="button" class="btn btn-primary btn-sm" data-goto-phase="fase1">Explorar Fase 1</button>
          </article>

          <article class="card-white stack-sm">
            <div class="meta-row">
              <span>Fase 2</span>
              <span class="meta-sep" aria-hidden="true">·</span>
              <span>Simulador Integrado</span>
            </div>
            <h3>VisualG na Prática</h3>
            <p class="muted-light">Escreve e executa algoritmos em português diretamente no seu melhor app com desafios e testes automáticos.</p>
            <button type="button" class="btn btn-primary btn-sm" data-goto-phase="fase2">Explorar Fase 2</button>
          </article>

          <article class="card-white stack-sm">
            <div class="meta-row">
              <span>Fase 3</span>
              <span class="meta-sep" aria-hidden="true">·</span>
              <span>6 Áreas</span>
            </div>
            <h3>Áreas da Programação</h3>
            <p class="muted-light">Conhece Web, Mobile, Software, Inteligência Artificial, Dados e Cibersegurança e escolhe o teu caminho.</p>
            <button type="button" class="btn btn-primary btn-sm" data-goto-phase="fase3">Conhecer Áreas</button>
          </article>
        </div>
      </section>

      <section class="card-navy row-between">
        <div class="stack-sm">
          <h3>Prática, Desafios e Biblioteca</h3>
          <p class="muted-dark">Pacotes de exercícios, desafios especiais, projetos práticos e testes avançados com correção imediata.</p>
        </div>
        <div class="row-wrap">
          <button type="button" class="btn btn-white btn-sm" data-goto="practice">Ir para Prática</button>
          <button type="button" class="btn btn-outline-light btn-sm" data-goto="premium">Ativar Chave</button>
        </div>
      </section>
    </div>
  `;
}

function bindHomeEvents() {
  const startBtn = document.getElementById('hero-start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      activeLessonId = state.lastLessonId || 'log-01';
      navigate('learn');
    });
  }

  const heroVerifyBtn = document.getElementById('hero-verify-btn');
  if (heroVerifyBtn) {
    heroVerifyBtn.addEventListener('click', () => {
      practiceTab = 'verify';
      activeQuizState = null;
      navigate('practice');
    });
  }

  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.getAttribute('data-goto')));
  });

  document.querySelectorAll('[data-goto-phase]').forEach((btn) => {
    btn.addEventListener('click', () => {
      learnPhaseFilter = btn.getAttribute('data-goto-phase');
      if (learnPhaseFilter === 'fase1') activeLessonId = 'log-01';
      if (learnPhaseFilter === 'fase2') activeLessonId = 'ptg-01';
      navigate('learn');
    });
  });
}

/* -------------------- VISTA: APRENDER (FASES 1, 2 E 3) -------------------- */

function renderLearnView() {
  const stats = getCompletionStats();
  const isPhase3 = learnPhaseFilter === 'fase3';

  const filteredLessons = LESSONS.filter((lesson) => {
    if (learnPhaseFilter !== 'all' && learnPhaseFilter !== 'fase3' && lesson.phase !== learnPhaseFilter) {
      return false;
    }
    if (learnOnlyFavorites && !state.favorites.includes(lesson.id)) {
      return false;
    }
    if (learnSearchQuery.trim()) {
      const q = learnSearchQuery.trim().toLowerCase();
      const text = `${lesson.title} ${lesson.summary} ${lesson.module} ${lesson.explanation.join(' ')}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  if (!isPhase3 && filteredLessons.length > 0 && !filteredLessons.some((l) => l.id === activeLessonId)) {
    activeLessonId = filteredLessons[0].id;
  }

  const activeLesson = LESSONS.find((l) => l.id === activeLessonId) || LESSONS[0];

  return `
    <div class="container stack-md">
      <div class="section-header">
        <div>
          <h1 class="section-title">Área de Aprendizagem</h1>
          <p class="section-subtitle">Progresso geral: <strong class="tabular">${stats.done}/${stats.total}</strong> aulas concluídas (${stats.percent}%).</p>
        </div>
        <div class="row-wrap">
          <button type="button" class="btn btn-outline-light btn-sm" id="toggle-presentation-btn">
            ${state.student.presentationMode ? 'Sair do Modo Foco' : 'Modo Foco / Apresentação'}
          </button>
        </div>
      </div>

      <div class="toolbar">
        <div class="segmented" role="tablist" aria-label="Filtrar por fase">
          <button type="button" class="seg-btn ${learnPhaseFilter === 'all' ? 'active' : ''}" data-phase="all">Todas</button>
          <button type="button" class="seg-btn ${learnPhaseFilter === 'fase1' ? 'active' : ''}" data-phase="fase1">Fase 1: Lógica</button>
          <button type="button" class="seg-btn ${learnPhaseFilter === 'fase2' ? 'active' : ''}" data-phase="fase2">Fase 2: VisualG</button>
          <button type="button" class="seg-btn ${learnPhaseFilter === 'fase3' ? 'active' : ''}" data-phase="fase3">Fase 3: Áreas</button>
        </div>

        <div class="row-wrap" style="flex: 1; justify-content: flex-end;">
          <div class="search-box">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              id="learn-search-input"
              class="search-input"
              placeholder="Pesquisar aula ou conceito..."
              value="${escapeHtml(learnSearchQuery)}"
              aria-label="Pesquisar conteúdos"
            />
          </div>
          <button type="button" class="btn btn-sm ${learnOnlyFavorites ? 'btn-white' : 'btn-outline-light'}" id="toggle-fav-filter-btn">
            Favoritos (${state.favorites.length})
          </button>
        </div>
      </div>

      ${isPhase3 ? renderPhase3Areas() : renderLessonWorkspace(filteredLessons, activeLesson)}
    </div>
  `;
}

function renderLessonWorkspace(filteredLessons, lesson) {
  const unlocked = isLessonUnlocked(lesson);
  const completed = state.completedLessons.includes(lesson.id);
  const isFav = state.favorites.includes(lesson.id);
  const currentIndex = LESSONS.findIndex((l) => l.id === lesson.id);
  const nextLesson = currentIndex >= 0 && currentIndex < LESSONS.length - 1 ? LESSONS[currentIndex + 1] : null;

  return `
    <div class="learn-workspace ${state.student.presentationMode ? 'presentation-mode' : ''}">
      <aside class="lesson-sidebar" aria-label="Lista de aulas">
        ${
          filteredLessons.length === 0
            ? `<div class="card-navy">Nenhuma aula encontrada para esta pesquisa.</div>`
            : filteredLessons
                .map((item) => {
                  const itemUnlocked = isLessonUnlocked(item);
                  const itemDone = state.completedLessons.includes(item.id);
                  const statusText = itemDone
                    ? '<span class="status-label status-done">Concluída</span>'
                    : itemUnlocked
                      ? '<span class="status-label status-free">Disponível</span>'
                      : '<span class="status-label status-locked">Premium</span>';
                  return `
                    <button
                      type="button"
                      class="lesson-item ${item.id === lesson.id ? 'active' : ''}"
                      data-lesson-id="${item.id}"
                    >
                      <div class="meta-row">
                        <span>${escapeHtml(item.phaseLabel)}</span>
                        <span class="meta-sep" aria-hidden="true">·</span>
                        ${statusText}
                      </div>
                      <div class="lesson-item-title">${escapeHtml(item.title)}</div>
                    </button>
                  `;
                })
                .join('')
        }
      </aside>

      <section class="card-white lesson-viewer" aria-live="polite">
        <div class="lesson-viewer-header">
          <div>
            <div class="meta-row">
              <span>${escapeHtml(lesson.phaseLabel)}</span>
              <span class="meta-sep" aria-hidden="true">·</span>
              <span>${escapeHtml(lesson.module)}</span>
              <span class="meta-sep" aria-hidden="true">·</span>
              <span>${lesson.free ? 'Gratuito' : 'Premium'}</span>
              ${completed ? '<span class="meta-sep" aria-hidden="true">·</span><span class="status-label status-done">Concluída</span>' : ''}
            </div>
            <h2 class="lesson-viewer-title">${escapeHtml(lesson.title)}</h2>
          </div>

          <div class="lesson-controls">
            <button type="button" class="btn btn-outline-dark btn-sm" id="lesson-fav-btn">
              ${isFav ? 'Remover Favorito' : 'Guardar Favorito'}
            </button>
          </div>
        </div>

        ${
          !unlocked
            ? `
            <div class="lock-panel">
              <div class="status-label status-locked">Conteúdo Premium Bloqueado</div>
              <h3>Desbloqueia: ${escapeHtml(getKeyTitleByFeature(lesson.keyFeature))}</h3>
              <p class="muted-dark">
                Esta aula faz parte da formação completa. Insere a chave correspondente na Área Premium para continuar.
              </p>
              <button type="button" class="btn btn-white btn-sm" id="unlock-redirect-btn">
                Ativar Chave de Acesso
              </button>
            </div>
          `
            : `
            <div class="lesson-prose">
              <p><strong>${escapeHtml(lesson.summary)}</strong></p>
              ${lesson.explanation.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
              <div class="lesson-keypoint">
                <strong>Ponto-chave</strong>
                <span>${escapeHtml(lesson.keypoint)}</span>
              </div>
            </div>

            ${
              lesson.hasSimulator
                ? `
                <div class="simulator-box">
                  <div class="simulator-head">
                    <strong>Simulador de VisualG (${escapeHtml(lesson.codeTitle)})</strong>
                    <div class="row-wrap">
                      <button type="button" class="btn btn-outline-light btn-sm" id="reset-sim-btn">Repor Exemplo</button>
                      <button type="button" class="btn btn-primary btn-sm" id="run-sim-btn">Executar Código</button>
                    </div>
                  </div>
                  <textarea id="sim-editor" class="code-editor" spellcheck="false" aria-label="Editor de VisualG">${escapeHtml(lesson.code)}</textarea>
                  <div>
                    <div class="meta-row" style="margin-bottom:6px;">Resultado no ecrã</div>
                    <div id="sim-output" class="simulator-output">Clica em "Executar Código" para ver a saída.</div>
                  </div>
                </div>
              `
                : `
                <div class="code-window">
                  <div class="code-window-bar">
                    <span>${escapeHtml(lesson.codeTitle)}</span>
                    <span>Exemplo</span>
                  </div>
                  <pre class="code-block">${escapeHtml(lesson.code)}</pre>
                </div>
              `
            }

            <div class="quiz-card" id="lesson-practice-box">
              <div class="row-between">
                <h4>Prática Obrigatória da Aula</h4>
                <span class="meta-row">${completed ? 'Aula já concluída' : 'Responde corretamente para concluir'}</span>
              </div>
              <p><strong>${escapeHtml(lesson.practice.question)}</strong></p>
              ${renderLessonPracticeControls(lesson.practice)}
              <div id="lesson-practice-feedback"></div>
            </div>

            <div class="row-between">
              <button type="button" class="btn btn-outline-dark btn-sm" id="prev-lesson-btn" ${currentIndex === 0 ? 'disabled' : ''}>
                Aula Anterior
              </button>
              <div class="row-wrap">
                ${
                  completed && nextLesson
                    ? `<button type="button" class="btn btn-primary btn-sm" id="next-lesson-btn">Próxima Aula</button>`
                    : ''
                }
              </div>
            </div>
          `
        }
      </section>
    </div>
  `;
}

function renderLessonPracticeControls(practice) {
  if (practice.type === 'fill') {
    return `
      <div class="stack-sm">
        <pre class="code-block" style="background:#08152d;border-radius:8px;">${escapeHtml(practice.promptTemplate)}</pre>
        <div class="row-wrap">
          <input type="text" id="lesson-fill-input" class="text-input" style="max-width:260px;" placeholder="Escreve a resposta..." />
          <button type="button" class="btn btn-primary btn-sm" id="lesson-fill-submit">Verificar Resposta</button>
        </div>
        <div class="meta-row">Dica: ${escapeHtml(practice.hint)}</div>
      </div>
    `;
  }

  return `
    <div class="quiz-options">
      ${practice.options
        .map(
          (opt, idx) => `
          <button type="button" class="quiz-option" data-practice-opt="${idx}">
            ${escapeHtml(opt)}
          </button>
        `
        )
        .join('')}
    </div>
  `;
}

function renderPhase3Areas() {
  const unlocked = hasFeatureAccess('areas_full');
  const stats = getCompletionStats();
  const baseDone = state.completedLessons.filter((id) => id.startsWith('log-') || id.startsWith('ptg-')).length;
  const search = learnSearchQuery.trim().toLowerCase();
  const areas = PROGRAMMING_AREAS.filter((a) => {
    if (!search) return true;
    return `${a.name} ${a.whatItDoes} ${a.technologies.join(' ')} ${a.canBuild}`.toLowerCase().includes(search);
  });

  return `
    <div class="stack-md">
      <div class="card-navy row-between">
        <div class="stack-sm">
          <div class="meta-row">
            <span>Fase 3 · Especialização</span>
            <span class="meta-sep" aria-hidden="true">·</span>
            <span class="tabular">${baseDone} aulas concluídas nas Fases 1 e 2</span>
          </div>
          <h2>Conhecer as Áreas da Programação</h2>
          <p class="muted-dark">
            Depois de dominar Lógica e VisualG, explora as 6 principais áreas da tecnologia e escolhe a especialização que queres seguir.
          </p>
        </div>
        ${
          state.student.chosenArea
            ? `<div class="status-label status-done">Área escolhida: ${escapeHtml(state.student.chosenArea)}</div>`
            : ''
        }
      </div>

      ${
        !unlocked
          ? `
          <div class="lock-panel">
            <div class="status-label status-locked">Módulo Premium · Chave necessária</div>
            <h3>Desbloqueia o Guia Completo das 6 Áreas da Programação</h3>
            <p class="muted-dark">
              Ativa a chave de "Áreas da programação 8" para explorar tecnologias, projetos recomendados e definir a tua especialização no perfil.
            </p>
            <button type="button" class="btn btn-white btn-sm" id="unlock-areas-btn">Ativar na Área Premium</button>
          </div>
        `
          : ''
      }

      <div class="grid-3">
        ${areas
          .map((area) => {
            const isChosen = state.student.chosenArea === area.name;
            return `
              <article class="card-white stack-sm">
                <div class="row-between">
                  <h3>${escapeHtml(area.name)}</h3>
                  ${isChosen ? '<span class="status-label status-done">Escolhida</span>' : ''}
                </div>
                <p class="muted-light">${escapeHtml(area.whatItDoes)}</p>
                ${
                  unlocked
                    ? `
                    <div class="lesson-keypoint">
                      <strong>Tecnologias utilizadas</strong>
                      <span>${escapeHtml(area.technologies.join(' · '))}</span>
                    </div>
                    <div class="lesson-keypoint">
                      <strong>O que podes desenvolver</strong>
                      <span>${escapeHtml(area.canBuild)}</span>
                    </div>
                    <button
                      type="button"
                      class="btn btn-sm ${isChosen ? 'btn-success' : 'btn-primary'}"
                      data-choose-area="${escapeHtml(area.name)}"
                    >
                      ${isChosen ? 'Área Selecionada' : 'Escolher esta área'}
                    </button>
                  `
                    : `<div class="meta-row">Disponível após ativar Áreas da programação 8 · Progresso atual: ${stats.percent}%</div>`
                }
              </article>
            `;
          })
          .join('')}
      </div>
    </div>
  `;
}

function bindLearnEvents() {
  const presBtn = document.getElementById('toggle-presentation-btn');
  if (presBtn) {
    presBtn.addEventListener('click', () => {
      state.student.presentationMode = !state.student.presentationMode;
      saveState();
      render();
    });
  }

  document.querySelectorAll('[data-phase]').forEach((btn) => {
    btn.addEventListener('click', () => {
      learnPhaseFilter = btn.getAttribute('data-phase');
      render();
    });
  });

  const searchInput = document.getElementById('learn-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      learnSearchQuery = e.target.value;
      render();
      const restored = document.getElementById('learn-search-input');
      if (restored) {
        restored.focus();
        restored.setSelectionRange(restored.value.length, restored.value.length);
      }
    });
  }

  const favFilterBtn = document.getElementById('toggle-fav-filter-btn');
  if (favFilterBtn) {
    favFilterBtn.addEventListener('click', () => {
      learnOnlyFavorites = !learnOnlyFavorites;
      render();
    });
  }

  document.querySelectorAll('[data-lesson-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeLessonId = btn.getAttribute('data-lesson-id');
      state.lastLessonId = activeLessonId;
      saveState();
      render();
    });
  });

  const unlockBtn = document.getElementById('unlock-redirect-btn') || document.getElementById('unlock-areas-btn');
  if (unlockBtn) {
    unlockBtn.addEventListener('click', () => navigate('premium'));
  }

  const favBtn = document.getElementById('lesson-fav-btn');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      const idx = state.favorites.indexOf(activeLessonId);
      if (idx >= 0) {
        state.favorites.splice(idx, 1);
        showToast('Aula removida dos favoritos.');
      } else {
        state.favorites.push(activeLessonId);
        showToast('Aula guardada nos favoritos.', 'success');
      }
      saveState();
      render();
    });
  }

  // Simulador de VisualG
  const runSimBtn = document.getElementById('run-sim-btn');
  const resetSimBtn = document.getElementById('reset-sim-btn');
  const editor = document.getElementById('sim-editor');
  const simOut = document.getElementById('sim-output');
  const currentLesson = LESSONS.find((l) => l.id === activeLessonId);

  if (runSimBtn && editor && simOut) {
    runSimBtn.addEventListener('click', () => {
      simOut.textContent = runVisualGCode(editor.value);
    });
  }
  if (resetSimBtn && editor && simOut && currentLesson) {
    resetSimBtn.addEventListener('click', () => {
      editor.value = currentLesson.code;
      simOut.textContent = 'Exemplo reposto. Clica em "Executar Código".';
    });
  }

  // Prática obrigatória dentro da aula
  const feedbackEl = document.getElementById('lesson-practice-feedback');
  const completeCurrentLesson = () => {
    if (!state.completedLessons.includes(activeLessonId)) {
      state.completedLessons.push(activeLessonId);
      state.points += 20;
      addHistory(`Aula concluída: ${currentLesson.title} (+20 pts)`);
      saveState();
    }
  };

  document.querySelectorAll('[data-practice-opt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!currentLesson || !feedbackEl) return;
      const picked = Number(btn.getAttribute('data-practice-opt'));
      const isRight = picked === currentLesson.practice.answer;
      document.querySelectorAll('[data-practice-opt]').forEach((b) => {
        b.classList.remove('correct', 'wrong');
      });
      if (isRight) {
        btn.classList.add('correct');
        completeCurrentLesson();
        feedbackEl.innerHTML = `<div class="feedback-banner success"><strong>Correto!</strong> ${escapeHtml(currentLesson.practice.explanation)}</div>`;
        showToast('Aula concluída com sucesso!', 'success');
        setTimeout(() => render(), 650);
      } else {
        btn.classList.add('wrong');
        feedbackEl.innerHTML = `<div class="feedback-banner error"><strong>Tenta novamente.</strong> ${escapeHtml(currentLesson.practice.explanation)}</div>`;
      }
    });
  });

  const fillSubmit = document.getElementById('lesson-fill-submit');
  const fillInput = document.getElementById('lesson-fill-input');
  if (fillSubmit && fillInput && currentLesson && feedbackEl) {
    const checkLessonFill = () => {
      const val = fillInput.value.trim().toLowerCase();
      const accepted = currentLesson.practice.accepted.map((a) => a.toLowerCase());
      if (accepted.includes(val)) {
        completeCurrentLesson();
        feedbackEl.innerHTML = `<div class="feedback-banner success"><strong>Correto!</strong> ${escapeHtml(currentLesson.practice.explanation)}</div>`;
        showToast('Aula concluída com sucesso!', 'success');
        setTimeout(() => render(), 650);
      } else {
        feedbackEl.innerHTML = `<div class="feedback-banner error"><strong>Resposta incorreta.</strong> ${escapeHtml(currentLesson.practice.explanation)}</div>`;
      }
    };
    fillSubmit.addEventListener('click', checkLessonFill);
    fillInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkLessonFill();
      }
    });
  }

  const prevBtn = document.getElementById('prev-lesson-btn');
  const nextBtn = document.getElementById('next-lesson-btn');
  const idx = LESSONS.findIndex((l) => l.id === activeLessonId);
  if (prevBtn && idx > 0) {
    prevBtn.addEventListener('click', () => {
      activeLessonId = LESSONS[idx - 1].id;
      state.lastLessonId = activeLessonId;
      saveState();
      render();
    });
  }
  if (nextBtn && idx < LESSONS.length - 1) {
    nextBtn.addEventListener('click', () => {
      activeLessonId = LESSONS[idx + 1].id;
      state.lastLessonId = activeLessonId;
      saveState();
      render();
    });
  }

  document.querySelectorAll('[data-choose-area]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosen = btn.getAttribute('data-choose-area');
      state.student.chosenArea = chosen;
      addHistory(`Área de especialização escolhida: ${chosen}`);
      saveState();
      showToast(`Área "${chosen}" definida no teu perfil!`, 'success');
      render();
    });
  });
}

/* -------------------- VISTA: PRATICAR -------------------- */

function renderPracticeView() {
  return `
    <div class="container stack-md">
      <div class="section-header">
        <div>
          <h1 class="section-title">Centro de Prática</h1>
          <p class="section-subtitle">Consolida o conhecimento com exercícios, desafios de lógica, testes avaliados, projetos e biblioteca.</p>
        </div>
        <div class="card-navy" style="padding: 12px 18px;">
          <span class="meta-row">Pontuação acumulada</span>
          <div class="kpi-value tabular">${state.points} pts</div>
        </div>
      </div>

      <div class="segmented" role="tablist" aria-label="Secções de prática">
        <button type="button" class="seg-btn ${practiceTab === 'exercises' ? 'active' : ''}" data-ptab="exercises">Pacotes de Exercícios</button>
        <button type="button" class="seg-btn ${practiceTab === 'verify' ? 'active' : ''}" data-ptab="verify">Verificar Código</button>
        <button type="button" class="seg-btn ${practiceTab === 'challenges' ? 'active' : ''}" data-ptab="challenges">Desafios Especiais</button>
        <button type="button" class="seg-btn ${practiceTab === 'tests' ? 'active' : ''}" data-ptab="tests">Testes</button>
        <button type="button" class="seg-btn ${practiceTab === 'projects' ? 'active' : ''}" data-ptab="projects">Projetos Práticos</button>
        <button type="button" class="seg-btn ${practiceTab === 'library' ? 'active' : ''}" data-ptab="library">Biblioteca</button>
      </div>

      ${renderPracticeTabBody()}
    </div>
  `;
}

function renderPracticeTabBody() {
  if (activeQuizState) {
    return renderActiveQuiz();
  }

  if (practiceTab === 'verify') {
    const task = CODE_VERIFICATION_TASKS[activeVerifyIndex] || CODE_VERIFICATION_TASKS[0];
    const codeText = verifyDraftCode || task.starter;
    const isVerifiedDone = state.verifiedCodes.includes(task.id);
    const hasNext = activeVerifyIndex < CODE_VERIFICATION_TASKS.length - 1;

    return `
      <div class="stack-md">
        <div class="card-navy row-between">
          <div class="stack-sm">
            <div class="meta-row">
              <span>Versão Gratuita</span>
              <span class="meta-sep" aria-hidden="true">·</span>
              <span class="tabular">${state.verifiedCodes.length}/${CODE_VERIFICATION_TASKS.length} verificados</span>
            </div>
            <h2>Verificação Automática de Código</h2>
            <p class="muted-dark">Escreve ou cola o teu algoritmo, verifica se está correto e, se estiver OK, prossegue para o próximo nível.</p>
          </div>
          <div class="row-wrap">
            ${CODE_VERIFICATION_TASKS.map((t, i) => `
              <button type="button" class="btn btn-sm ${i === activeVerifyIndex ? 'btn-white' : 'btn-outline-light'}" data-verify-idx="${i}">
                ${i < 3 ? `Nível ${i + 1}` : 'Modo Livre'}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="card-white stack-md">
          <div class="row-between">
            <div>
              <h3>${escapeHtml(task.title)}</h3>
              <p class="muted-light">${escapeHtml(task.instruction)}</p>
            </div>
            ${isVerifiedDone ? '<span class="status-label status-done">Aprovado</span>' : ''}
          </div>

          <div class="simulator-box">
            <div class="simulator-head">
              <strong>Editor de Código (VisualG)</strong>
              <div class="row-wrap">
                <button type="button" class="btn btn-outline-light btn-sm" id="verify-reset-btn">Repor Modelo</button>
                <button type="button" class="btn btn-primary btn-sm" id="verify-run-btn">Verificar Código</button>
              </div>
            </div>
            <textarea id="verify-editor" class="code-editor" spellcheck="false" aria-label="Código para verificação">${escapeHtml(codeText)}</textarea>
          </div>

          ${
            verifyCheckResult
              ? verifyCheckResult.ok
                ? `
                  <div class="feedback-banner success">
                    <strong>Código OK! Tudo verificado sem erros.</strong> Podes prosseguir.
                  </div>
                  <div>
                    <div class="meta-row" style="margin-bottom:6px;">Saída verificada no ecrã</div>
                    <div class="simulator-output">${escapeHtml(verifyCheckResult.output)}</div>
                  </div>
                  <div class="row-between">
                    <span></span>
                    <button type="button" class="btn btn-success btn-sm" id="verify-proceed-btn">
                      ${hasNext ? 'Prosseguir para o próximo nível' : 'Prosseguir para as Aulas'}
                    </button>
                  </div>
                `
                : `
                  <div class="feedback-banner error">
                    <strong>Foram encontrados erros no código. Corrige antes de prosseguir:</strong>
                    <ul style="margin: 8px 0 0 18px; padding: 0;">
                      ${verifyCheckResult.errors.map((err) => `<li>${escapeHtml(err)}</li>`).join('')}
                    </ul>
                  </div>
                `
              : ''
          }
        </div>
      </div>
    `;
  }

  if (practiceTab === 'exercises') {
    return `
      <div class="grid-3">
        ${EXERCISE_PACKS.map((pack) => {
          const unlocked = pack.free || hasFeatureAccess(pack.keyFeature);
          return `
            <article class="card-white stack-sm">
              <div class="meta-row">
                <span>${pack.free ? 'Gratuito' : 'Premium'}</span>
                <span class="meta-sep" aria-hidden="true">·</span>
                <span class="tabular">${pack.questions.length} questões</span>
              </div>
              <h3>${escapeHtml(pack.title)}</h3>
              <p class="muted-light">${escapeHtml(pack.description)}</p>
              ${
                unlocked
                  ? `<button type="button" class="btn btn-primary btn-sm" data-start-quiz="pack:${pack.id}">Iniciar Pacote</button>`
                  : `<button type="button" class="btn btn-outline-dark btn-sm" data-goto-premium="1">Desbloquear (${escapeHtml(getKeyTitleByFeature(pack.keyFeature))})</button>`
              }
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  if (practiceTab === 'challenges') {
    return `
      <div class="grid-3">
        ${CHALLENGES.map((ch) => {
          const unlocked = ch.free || hasFeatureAccess(ch.keyFeature);
          const solved = state.solvedChallenges.includes(ch.id);
          return `
            <article class="card-white stack-sm">
              <div class="meta-row">
                <span>${ch.free ? 'Gratuito' : 'Premium'}</span>
                ${solved ? '<span class="meta-sep" aria-hidden="true">·</span><span class="status-label status-done">Resolvido</span>' : ''}
              </div>
              <h3>${escapeHtml(ch.title)}</h3>
              <p class="muted-light">${escapeHtml(ch.description)}</p>
              ${
                unlocked
                  ? `
                    <div class="lesson-keypoint">${escapeHtml(ch.scenario)}</div>
                    <div class="quiz-options">
                      ${ch.options
                        .map(
                          (opt, i) => `
                          <button type="button" class="quiz-option" data-chal-id="${ch.id}" data-chal-opt="${i}">
                            ${escapeHtml(opt)}
                          </button>
                        `
                        )
                        .join('')}
                    </div>
                    <div id="chal-fb-${ch.id}"></div>
                  `
                  : `<button type="button" class="btn btn-outline-dark btn-sm" data-goto-premium="1">Desbloquear (${escapeHtml(getKeyTitleByFeature(ch.keyFeature))})</button>`
              }
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  if (practiceTab === 'tests') {
    return `
      <div class="stack-md">
        <div class="grid-2">
          ${TESTS.map((test) => {
            const unlocked = test.free || hasFeatureAccess(test.keyFeature);
            return `
              <article class="card-white stack-sm">
                <div class="meta-row">
                  <span>${test.free ? 'Gratuito' : 'Premium'}</span>
                  <span class="meta-sep" aria-hidden="true">·</span>
                  <span class="tabular">${test.questions.length} questões</span>
                </div>
                <h3>${escapeHtml(test.title)}</h3>
                <p class="muted-light">${escapeHtml(test.description)}</p>
                ${
                  unlocked
                    ? `<button type="button" class="btn btn-primary btn-sm" data-start-quiz="test:${test.id}">Fazer Teste</button>`
                    : `<button type="button" class="btn btn-outline-dark btn-sm" data-goto-premium="1">Desbloquear (${escapeHtml(getKeyTitleByFeature(test.keyFeature))})</button>`
                }
              </article>
            `;
          }).join('')}
        </div>

        ${
          state.testResults.length > 0
            ? `
            <div class="card-white stack-sm">
              <h3>Resultados dos Testes Realizados</h3>
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Avaliação</th>
                      <th>Pontuação</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${state.testResults
                      .map(
                        (r) => `
                      <tr>
                        <td class="tabular">${escapeHtml(r.date)}</td>
                        <td>${escapeHtml(r.title)}</td>
                        <td class="tabular"><strong>${r.score}/${r.total} (${r.percent}%)</strong></td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `
            : ''
        }
      </div>
    `;
  }

  if (practiceTab === 'projects') {
    return `
      <div class="grid-3">
        ${PROJECTS.map((proj) => {
          const unlocked = proj.free || hasFeatureAccess(proj.keyFeature);
          return `
            <article class="card-white stack-sm">
              <div class="meta-row">${escapeHtml(proj.level)}</div>
              <h3>${escapeHtml(proj.title)}</h3>
              <p class="muted-light">${escapeHtml(proj.goal)}</p>
              ${
                unlocked
                  ? `
                    <div class="lesson-keypoint">
                      <strong>Passos do projeto</strong>
                      <span>${proj.steps.map((s, i) => `${i + 1}. ${escapeHtml(s)}`).join('<br>')}</span>
                    </div>
                    <pre class="code-block" style="background:#08152d;border-radius:8px;font-size:0.78rem;">${escapeHtml(proj.code)}</pre>
                  `
                  : `<button type="button" class="btn btn-outline-dark btn-sm" data-goto-premium="1">Desbloquear (${escapeHtml(getKeyTitleByFeature(proj.keyFeature))})</button>`
              }
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  // Biblioteca de Materiais
  return `
    <div class="grid-3">
      ${LIBRARY_MATERIALS.map((mat) => {
        const unlocked = mat.free || hasFeatureAccess(mat.keyFeature);
        const isFav = state.favorites.includes(mat.id);
        return `
          <article class="card-white stack-sm">
            <div class="row-between">
              <span class="meta-row">${escapeHtml(mat.category)} · ${mat.free ? 'Gratuito' : 'Premium'}</span>
              ${
                unlocked
                  ? `<button type="button" class="btn btn-outline-dark btn-sm" data-mat-fav="${mat.id}">${isFav ? 'Favorito' : 'Guardar'}</button>`
                  : ''
              }
            </div>
            <h3>${escapeHtml(mat.title)}</h3>
            ${
              unlocked
                ? `<p class="muted-light">${escapeHtml(mat.content)}</p>`
                : `<button type="button" class="btn btn-outline-dark btn-sm" data-goto-premium="1">Desbloquear (${escapeHtml(getKeyTitleByFeature(mat.keyFeature))})</button>`
            }
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function renderActiveQuiz() {
  const qData = activeQuizState;
  const total = qData.questions.length;

  if (qData.finished) {
    const percent = Math.round((qData.score / total) * 100);
    return `
      <div class="card-white stack-md">
        <div class="row-between">
          <h2>Resultado: ${escapeHtml(qData.title)}</h2>
          <span class="kpi-value tabular">${qData.score}/${total} (${percent}%)</span>
        </div>
        <div class="feedback-banner ${percent >= 60 ? 'success' : 'info'}">
          ${percent >= 60 ? 'Excelente desempenho! Os conceitos estão consolidados.' : 'Bom treino! Revê as explicações abaixo e tenta novamente.'}
        </div>
        <div class="stack-sm">
          ${qData.answers
            .map(
              (a, i) => `
            <div class="lesson-keypoint">
              <strong>Questão ${i + 1}: ${escapeHtml(a.question)}</strong>
              <span>Estado: ${a.correct ? 'Correta' : 'Incorreta'} · ${escapeHtml(a.explanation)}</span>
            </div>
          `
            )
            .join('')}
        </div>
        <div class="row-wrap">
          <button type="button" class="btn btn-primary btn-sm" id="quiz-close-btn">Voltar à lista</button>
        </div>
      </div>
    `;
  }

  const currentQ = qData.questions[qData.index];
  return `
    <div class="card-white stack-md">
      <div class="row-between">
        <div>
          <div class="meta-row">${escapeHtml(qData.title)} · Questão ${qData.index + 1} de ${total}</div>
          <h3>${escapeHtml(currentQ.question)}</h3>
        </div>
        <button type="button" class="btn btn-outline-dark btn-sm" id="quiz-cancel-btn">Sair</button>
      </div>

      ${
        currentQ.type === 'fill'
          ? `
          <div class="stack-sm">
            <pre class="code-block" style="background:#08152d;border-radius:8px;">${escapeHtml(currentQ.promptTemplate)}</pre>
            <div class="row-wrap">
              <input type="text" id="quiz-fill-input" class="text-input" style="max-width:260px;" placeholder="Escreve a resposta..." />
              <button type="button" class="btn btn-primary btn-sm" id="quiz-fill-btn" ${qData.answeredCurrent ? 'disabled' : ''}>Confirmar</button>
            </div>
            <div class="meta-row">Dica: ${escapeHtml(currentQ.hint)}</div>
          </div>
        `
          : `
          <div class="quiz-options">
            ${currentQ.options
              .map((opt, i) => {
                let cls = 'quiz-option';
                if (qData.answeredCurrent) {
                  if (i === currentQ.answer) cls += ' correct';
                  else if (i === qData.selectedOpt) cls += ' wrong';
                }
                return `
                  <button type="button" class="${cls}" data-quiz-opt="${i}" ${qData.answeredCurrent ? 'disabled' : ''}>
                    ${escapeHtml(opt)}
                  </button>
                `;
              })
              .join('')}
          </div>
        `
      }

      ${qData.lastFeedback ? `<div class="feedback-banner ${qData.lastFeedback.ok ? 'success' : 'error'}">${escapeHtml(qData.lastFeedback.text)}</div>` : ''}

      ${
        qData.answeredCurrent
          ? `<div class="row-between"><span></span><button type="button" class="btn btn-primary btn-sm" id="quiz-next-btn">${qData.index + 1 < total ? 'Próxima Questão' : 'Ver Resultado Final'}</button></div>`
          : ''
      }
    </div>
  `;
}

function bindPracticeEvents() {
  document.querySelectorAll('[data-ptab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeQuizState = null;
      practiceTab = btn.getAttribute('data-ptab');
      render();
    });
  });

  document.querySelectorAll('[data-goto-premium]').forEach((btn) => {
    btn.addEventListener('click', () => navigate('premium'));
  });

  // Verificação gratuita de código
  document.querySelectorAll('[data-verify-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeVerifyIndex = Number(btn.getAttribute('data-verify-idx'));
      verifyDraftCode = '';
      verifyCheckResult = null;
      render();
    });
  });

  const verifyEditor = document.getElementById('verify-editor');
  const verifyResetBtn = document.getElementById('verify-reset-btn');
  const verifyRunBtn = document.getElementById('verify-run-btn');
  const verifyProceedBtn = document.getElementById('verify-proceed-btn');

  if (verifyEditor) {
    verifyEditor.addEventListener('input', (e) => {
      verifyDraftCode = e.target.value;
    });
  }

  if (verifyResetBtn) {
    verifyResetBtn.addEventListener('click', () => {
      const task = CODE_VERIFICATION_TASKS[activeVerifyIndex] || CODE_VERIFICATION_TASKS[0];
      verifyDraftCode = task.starter;
      verifyCheckResult = null;
      render();
    });
  }

  if (verifyRunBtn && verifyEditor) {
    verifyRunBtn.addEventListener('click', () => {
      const task = CODE_VERIFICATION_TASKS[activeVerifyIndex] || CODE_VERIFICATION_TASKS[0];
      verifyDraftCode = verifyEditor.value;
      const result = verifyVisualGCode(verifyDraftCode, task);
      verifyCheckResult = result;
      if (result.ok) {
        if (!state.verifiedCodes.includes(task.id)) {
          state.verifiedCodes.push(task.id);
          state.points += 15;
          addHistory(`Código verificado e aprovado: ${task.title} (+15 pts)`);
          saveState();
        }
        showToast('Código verificado com sucesso! Podes prosseguir.', 'success');
      } else {
        showToast('Existem erros no código. Verifica as mensagens.', 'error');
      }
      render();
    });
  }

  if (verifyProceedBtn) {
    verifyProceedBtn.addEventListener('click', () => {
      if (activeVerifyIndex < CODE_VERIFICATION_TASKS.length - 1) {
        activeVerifyIndex += 1;
        verifyDraftCode = '';
        verifyCheckResult = null;
        render();
      } else {
        navigate('learn');
      }
    });
  }

  document.querySelectorAll('[data-start-quiz]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [kind, id] = btn.getAttribute('data-start-quiz').split(':');
      const source = kind === 'pack' ? EXERCISE_PACKS.find((p) => p.id === id) : TESTS.find((t) => t.id === id);
      if (!source) return;
      activeQuizState = {
        kind,
        id: source.id,
        title: source.title,
        questions: source.questions,
        index: 0,
        score: 0,
        answers: [],
        answeredCurrent: false,
        lastFeedback: null,
        finished: false
      };
      render();
    });
  });

  // Desafios rápidos
  document.querySelectorAll('[data-chal-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cid = btn.getAttribute('data-chal-id');
      const opt = Number(btn.getAttribute('data-chal-opt'));
      const ch = CHALLENGES.find((c) => c.id === cid);
      const fb = document.getElementById(`chal-fb-${cid}`);
      if (!ch || !fb) return;

      document.querySelectorAll(`[data-chal-id="${cid}"]`).forEach((b) => {
        b.classList.remove('correct', 'wrong');
      });

      if (opt === ch.answer) {
        btn.classList.add('correct');
        if (!state.solvedChallenges.includes(cid)) {
          state.solvedChallenges.push(cid);
          state.points += 30;
          addHistory(`Desafio resolvido: ${ch.title} (+30 pts)`);
          saveState();
        }
        fb.innerHTML = `<div class="feedback-banner success"><strong>Correto!</strong> ${escapeHtml(ch.explanation)}</div>`;
      } else {
        btn.classList.add('wrong');
        fb.innerHTML = `<div class="feedback-banner error"><strong>Incorreto.</strong> ${escapeHtml(ch.explanation)}</div>`;
      }
    });
  });

  // Favoritos na biblioteca
  document.querySelectorAll('[data-mat-fav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-mat-fav');
      const idx = state.favorites.indexOf(id);
      if (idx >= 0) state.favorites.splice(idx, 1);
      else state.favorites.push(id);
      saveState();
      render();
    });
  });

  // Eventos do Quiz ativo
  if (activeQuizState) {
    const cancelBtn = document.getElementById('quiz-cancel-btn');
    const closeBtn = document.getElementById('quiz-close-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => { activeQuizState = null; render(); });
    if (closeBtn) closeBtn.addEventListener('click', () => { activeQuizState = null; render(); });

    const submitQuizAnswer = (isCorrect, q, selectedOpt = null) => {
      activeQuizState.answeredCurrent = true;
      activeQuizState.selectedOpt = selectedOpt;
      if (isCorrect) activeQuizState.score += 1;
      activeQuizState.answers.push({
        question: q.question,
        correct: isCorrect,
        explanation: q.explanation
      });
      activeQuizState.lastFeedback = {
        ok: isCorrect,
        text: `${isCorrect ? 'Correto! ' : 'Incorreto. '}${q.explanation}`
      };
      render();
    };

    document.querySelectorAll('[data-quiz-opt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (activeQuizState.answeredCurrent) return;
        const q = activeQuizState.questions[activeQuizState.index];
        const picked = Number(btn.getAttribute('data-quiz-opt'));
        submitQuizAnswer(picked === q.answer, q, picked);
      });
    });

    const fillBtn = document.getElementById('quiz-fill-btn');
    const fillInput = document.getElementById('quiz-fill-input');
    if (fillBtn && fillInput) {
      const checkQuizFill = () => {
        if (activeQuizState.answeredCurrent) return;
        const q = activeQuizState.questions[activeQuizState.index];
        const val = fillInput.value.trim().toLowerCase();
        const isCorrect = q.accepted.map((a) => a.toLowerCase()).includes(val);
        submitQuizAnswer(isCorrect, q, null);
      };
      fillBtn.addEventListener('click', checkQuizFill);
      fillInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          checkQuizFill();
        }
      });
    }

    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (activeQuizState.index + 1 < activeQuizState.questions.length) {
          activeQuizState.index += 1;
          activeQuizState.answeredCurrent = false;
          activeQuizState.lastFeedback = null;
        } else {
          activeQuizState.finished = true;
          const total = activeQuizState.questions.length;
          const percent = Math.round((activeQuizState.score / total) * 100);
          const earned = activeQuizState.score * 15;
          state.points += earned;
          if (activeQuizState.kind === 'test') {
            state.testResults.unshift({
              date: nowFormatted(),
              title: activeQuizState.title,
              score: activeQuizState.score,
              total,
              percent
            });
          }
          addHistory(`${activeQuizState.title}: ${activeQuizState.score}/${total} (+${earned} pts)`);
          saveState();
        }
        render();
      });
    }
  }
}

/* -------------------- VISTA: ÁREA PREMIUM & ATIVAÇÃO DE CHAVES -------------------- */

function renderPremiumView() {
  const unlockedCount = OFFICIAL_KEYS.filter((k) => hasFeatureAccess(k.featureId)).length;

  return `
    <div class="container stack-lg">
      <div class="section-header">
        <div>
          <h1 class="section-title">Área Premium e Ativação de Chaves</h1>
          <p class="section-subtitle">Modelo Freemium: começa grátis e desbloqueia cada módulo especializado com a sua chave oficial.</p>
        </div>
        <div class="card-navy" style="padding:12px 18px;">
          <span class="meta-row">Funcionalidades ativas</span>
          <div class="kpi-value tabular">${unlockedCount}/8</div>
        </div>
      </div>

      <section class="grid-2">
        <div class="card-white stack-md">
          <h3>Ativar Chave de Acesso</h3>
          <p class="muted-light">
            Insere a chave correspondente à funcionalidade que pretendes desbloquear. Cada chave ativa apenas um módulo específico.
          </p>
          <form id="key-activation-form" class="stack-sm">
            <label for="key-input"><strong>Chave de acesso</strong></label>
            <div class="row-wrap">
              <input
                type="text"
                id="key-input"
                class="text-input mono"
                style="flex:1; min-width: 200px;"
                placeholder="Insere a tua chave de acesso"
                autocomplete="off"
              />
              <button type="submit" class="btn btn-primary">Validar Chave</button>
            </div>
          </form>
          <div id="key-feedback-area"></div>
        </div>

        <div class="card-navy stack-md">
          <h3>Como obter chaves e Preço</h3>
          <p class="muted-dark">
            A versão gratuita inclui introdução à lógica, primeiras aulas de VisualG, verificação de código, exercícios iniciais e guia básico.
          </p>
          <div class="lesson-keypoint" style="background: rgba(255,255,255,0.06); border-color: var(--navy-border); color: var(--white);">
            <strong style="color: var(--accent-sky);">Cada chave custa 2.000 Kz (Multicaixa Express)</strong>
            <span>Para solicitar e receber as chaves de acesso, ligue ou deixe SMS no WhatsApp: <strong>+244 955900221</strong>.</span>
          </div>
          <div class="row-wrap">
            <a class="btn btn-white btn-sm" href="https://wa.me/244955900221" target="_blank" rel="noopener noreferrer">
              WhatsApp: +244 955900221
            </a>
            <a class="btn btn-outline-light btn-sm" href="tel:+244955900221">
              Ligar: +244 955900221
            </a>
          </div>
        </div>
      </section>

      <section class="stack-md">
        <h2 class="section-title">Estado das 8 Funcionalidades Premium</h2>
        <div class="grid-4">
          ${OFFICIAL_KEYS.map((item, idx) => {
            const unlocked = hasFeatureAccess(item.featureId);
            const blocked = !item.alwaysFree && state.blockedKeys.includes(item.key);
            return `
              <article class="card-white stack-sm">
                <div class="meta-row">
                  <span class="tabular">Módulo 0${idx + 1}</span>
                  <span class="meta-sep" aria-hidden="true">·</span>
                  <span class="tabular">${escapeHtml(item.priceKz)}</span>
                </div>
                <h4>${escapeHtml(item.title)}</h4>
                <div class="status-label ${blocked ? 'status-blocked' : unlocked ? 'status-done' : 'status-locked'}">
                  ${item.alwaysFree ? 'Disponível (Sem chave)' : blocked ? 'Chave Bloqueada' : unlocked ? 'Desbloqueado' : 'Bloqueado (Chave necessária)'}
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    </div>
  `;
}

function bindPremiumEvents() {
  const form = document.getElementById('key-activation-form');
  const input = document.getElementById('key-input');
  const fb = document.getElementById('key-feedback-area');
  if (!form || !input || !fb) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const res = activateKey(input.value);
    fb.innerHTML = `<div class="feedback-banner ${res.ok ? 'success' : 'error'}">${escapeHtml(res.message)}</div>`;
    if (res.ok) {
      input.value = '';
      showToast(res.message, 'success');
      setTimeout(() => render(), 550);
    } else {
      showToast(res.message, 'error');
    }
  });
}

/* -------------------- VISTA: PAINEL DO ALUNO -------------------- */

function renderDashboardView() {
  const stats = getCompletionStats();
  const lastLesson = LESSONS.find((l) => l.id === state.lastLessonId) || LESSONS[0];
  const favLessons = LESSONS.filter((l) => state.favorites.includes(l.id));
  const favMaterials = LIBRARY_MATERIALS.filter((m) => state.favorites.includes(m.id));

  return `
    <div class="container stack-lg">
      <div class="section-header">
        <div>
          <h1 class="section-title">Painel de ${escapeHtml(state.student.name)}</h1>
          <p class="section-subtitle">${escapeHtml(state.student.goal)}</p>
        </div>
        <div class="row-wrap">
          <button type="button" class="btn btn-outline-light btn-sm" data-dash-nav="profile">Editar Perfil</button>
          <button type="button" class="btn btn-white btn-sm" id="dash-continue-btn">Continuar Última Aula</button>
        </div>
      </div>

      <section class="grid-4">
        <div class="card-white stack-sm">
          <span class="meta-row">Conclusão Geral</span>
          <div class="kpi-value tabular">${stats.percent}%</div>
          <div class="progress-track"><div class="progress-fill" style="width:${stats.percent}%"></div></div>
        </div>
        <div class="card-white stack-sm">
          <span class="meta-row">Aulas Concluídas</span>
          <div class="kpi-value tabular">${stats.done}/${stats.total}</div>
          <span class="meta-row">Fases 1 e 2</span>
        </div>
        <div class="card-white stack-sm">
          <span class="meta-row">Pontuação</span>
          <div class="kpi-value tabular">${state.points}</div>
          <span class="meta-row">Pontos acumulados</span>
        </div>
        <div class="card-white stack-sm">
          <span class="meta-row">Especialização</span>
          <div style="font-weight:700; font-size:1.05rem;">${escapeHtml(state.student.chosenArea || 'Por definir')}</div>
          <span class="meta-row">Fase 3</span>
        </div>
      </section>

      <section class="grid-2">
        <div class="card-white stack-md">
          <div class="row-between">
            <h3>Favoritos Guardados</h3>
            <span class="meta-row tabular">${favLessons.length + favMaterials.length} itens</span>
          </div>
          ${
            favLessons.length + favMaterials.length === 0
              ? '<p class="muted-light">Ainda não guardaste nenhuma aula ou material como favorito.</p>'
              : `
                <div class="stack-sm">
                  ${favLessons
                    .map(
                      (l) => `
                    <div class="row-between lesson-keypoint">
                      <span>${escapeHtml(l.title)}</span>
                      <button type="button" class="btn btn-outline-dark btn-sm" data-open-lesson="${l.id}">Abrir</button>
                    </div>
                  `
                    )
                    .join('')}
                  ${favMaterials
                    .map(
                      (m) => `
                    <div class="row-between lesson-keypoint">
                      <span>${escapeHtml(m.title)}</span>
                      <button type="button" class="btn btn-outline-dark btn-sm" data-open-lib="1">Ver Biblioteca</button>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
          }
        </div>

        <div class="card-white stack-md">
          <div class="row-between">
            <h3>Histórico de Aprendizagem</h3>
            <span class="meta-row">Últimos registos</span>
          </div>
          ${
            state.history.length === 0
              ? `<p class="muted-light">Começa a primeira aula (${escapeHtml(lastLesson.title)}) para registar a tua evolução.</p>`
              : `
                <div class="stack-sm">
                  ${state.history
                    .slice(0, 8)
                    .map(
                      (h) => `
                    <div class="row-between" style="border-bottom:1px solid var(--border-light); padding-bottom:8px;">
                      <span>${escapeHtml(h.text)}</span>
                      <span class="meta-row tabular">${escapeHtml(h.date)}</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
          }
        </div>
      </section>
    </div>
  `;
}

function bindDashboardEvents() {
  const contBtn = document.getElementById('dash-continue-btn');
  if (contBtn) {
    contBtn.addEventListener('click', () => {
      activeLessonId = state.lastLessonId || 'log-01';
      navigate('learn');
    });
  }
  document.querySelectorAll('[data-dash-nav]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.getAttribute('data-dash-nav')));
  });
  document.querySelectorAll('[data-open-lesson]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeLessonId = btn.getAttribute('data-open-lesson');
      navigate('learn');
    });
  });
  document.querySelectorAll('[data-open-lib]').forEach((btn) => {
    btn.addEventListener('click', () => {
      practiceTab = 'library';
      navigate('practice');
    });
  });
}

/* -------------------- VISTA: PERFIL DO ALUNO -------------------- */

function renderProfileView() {
  return `
    <div class="container stack-lg">
      <div class="section-header">
        <div>
          <h1 class="section-title">Perfil do Aluno</h1>
          <p class="section-subtitle">Personaliza os teus dados e preferências de leitura guardados localmente neste navegador.</p>
        </div>
      </div>

      <div class="grid-2">
        <form id="profile-form" class="card-white stack-md">
          <h3>Dados e Preferências</h3>
          <div class="stack-sm">
            <label for="prof-name"><strong>Nome do aluno</strong></label>
            <input type="text" id="prof-name" class="text-input" value="${escapeHtml(state.student.name)}" required />
          </div>
          <div class="stack-sm">
            <label for="prof-goal"><strong>Objetivo de estudo</strong></label>
            <input type="text" id="prof-goal" class="text-input" value="${escapeHtml(state.student.goal)}" />
          </div>
          <div class="stack-sm">
            <label for="prof-area"><strong>Área de especialização escolhida</strong></label>
            <select id="prof-area" class="select-input">
              <option value="">Ainda por escolher</option>
              ${PROGRAMMING_AREAS.map(
                (a) => `<option value="${escapeHtml(a.name)}" ${state.student.chosenArea === a.name ? 'selected' : ''}>${escapeHtml(a.name)}</option>`
              ).join('')}
            </select>
          </div>
          <label class="row-wrap" style="cursor:pointer;">
            <input type="checkbox" id="prof-large-text" ${state.student.readingLarge ? 'checked' : ''} />
            <span>Ativar texto ampliado para leitura confortável</span>
          </label>
          <div class="row-wrap">
            <button type="submit" class="btn btn-primary btn-sm">Guardar Alterações</button>
          </div>
        </form>

        <div class="card-navy stack-md">
          <h3>Reiniciar Progresso</h3>
          <p class="muted-dark">
            Se quiseres recomeçar a tua jornada de aprendizagem do início e limpar aulas concluídas, favoritos e pontuação, utiliza o botão abaixo.
          </p>
          <div>
            <button type="button" class="btn btn-danger btn-sm" id="reset-progress-btn">Reiniciar Progresso</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindProfileEvents() {
  const form = document.getElementById('profile-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameVal = document.getElementById('prof-name').value.trim();
      const goalVal = document.getElementById('prof-goal').value.trim();
      const areaVal = document.getElementById('prof-area').value;
      const largeText = document.getElementById('prof-large-text').checked;

      state.student.name = nameVal || 'Estudante';
      state.student.goal = goalVal || 'Aprender programação desde o zero';
      state.student.chosenArea = areaVal;
      state.student.readingLarge = largeText;
      saveState();
      showToast('Perfil atualizado com sucesso.', 'success');
      render();
    });
  }

  const resetBtn = document.getElementById('reset-progress-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      openModal({
        title: 'Reiniciar progresso',
        bodyHtml: '<p>Tens a certeza de que pretendes apagar aulas concluídas, favoritos, histórico e chaves ativadas?</p>',
        confirmLabel: 'Sim, reiniciar tudo',
        danger: true,
        onConfirm: () => {
          localStorage.removeItem(STORAGE_KEY);
          state = createInitialState();
          activeLessonId = 'log-01';
          adminSessionUnlocked = false;
          showToast('Progresso reiniciado.');
          render();
        }
      });
    });
  }
}

/* -------------------- VISTA: AJUDA & SOBRE -------------------- */

function renderHelpAboutView() {
  return `
    <div class="container stack-lg">
      <div class="section-header">
        <div>
          <h1 class="section-title">Ajuda e Sobre o Start Programmer</h1>
          <p class="section-subtitle">Tudo o que precisas para tirar o máximo proveito da plataforma.</p>
        </div>
      </div>

      <section class="grid-2">
        <div class="card-white stack-md">
          <h2>Sobre o Aplicativo</h2>
          <p>
            O <strong>Start Programmer</strong> nasceu com o propósito de ensinar programação desde o zero, para qualquer idade ou nível de experiência.
          </p>
          <p class="muted-light">
            Em vez de atirar iniciantes para linguagens complexas logo no primeiro dia, a plataforma constrói primeiro a base de Lógica de Programação, consolida a escrita de algoritmos em VisualG e só depois apresenta as áreas profissionais.
          </p>
          <div class="lesson-keypoint">
            <strong>Contacto e Suporte</strong>
            <span>Email: <a href="mailto:arturnhanga01@gmail.com" style="color: var(--accent-blue); text-decoration: underline;">arturnhanga01@gmail.com</a></span>
          </div>
        </div>

        <div class="card-white stack-md">
          <h2>Perguntas Frequentes (Ajuda)</h2>
          <div class="stack-sm">
            <div class="lesson-keypoint">
              <strong>1. Como concluir uma aula?</strong>
              <span>Lê o resumo, testa os exemplos e responde corretamente ao exercício prático no final da aula.</span>
            </div>
            <div class="lesson-keypoint">
              <strong>2. Como funcionam as chaves de acesso?</strong>
              <span>Vai à Área Premium e insere a chave recebida. Cada chave desbloqueia apenas a sua funcionalidade específica. Cada chave custa 2.000 Kz — para solicitar chaves, ligue ou deixe SMS no WhatsApp: <strong>+244 955900221</strong>.</span>
            </div>
          </div>
          <div>
            <button type="button" class="btn btn-primary btn-sm" id="help-go-learn">Voltar às Aulas</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function bindHelpEvents() {
  const btn = document.getElementById('help-go-learn');
  if (btn) btn.addEventListener('click', () => navigate('learn'));
}

/* -------------------- VISTA: PAINEL DE ADMINISTRAÇÃO (LOCAL & DEMONSTRATIVO) -------------------- */

function hashPinLocal(pin) {
  let h = 2166136261;
  for (let i = 0; i < pin.length; i++) {
    h ^= pin.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return String(h >>> 0);
}

function renderAdminView() {
  if (!adminSessionUnlocked) {
    return `
      <div class="container" style="max-width: 560px;">
        <div class="card-white stack-md">
          <h2>Acesso Restrito · Administração</h2>
          <p class="muted-light">
            Área administrativa local e demonstrativa (sem backend nem sincronização entre dispositivos).
          </p>
          <form id="admin-gate-form" class="stack-sm">
            <label for="admin-pin-input">
              <strong>Insere o código de acesso administrativo</strong>
            </label>
            <input type="password" id="admin-pin-input" class="text-input" required autocomplete="off" placeholder="••••••••" />
            <div id="admin-gate-fb"></div>
            <div class="row-wrap">
              <button type="submit" class="btn btn-primary btn-sm">
                Entrar na Administração
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // Lista combinada de utilizadores locais (aluno atual + utilizadores demonstrativos)
  const allUsers = [
    {
      id: state.student.id,
      name: `${state.student.name} (Sessão atual)`,
      email: 'sessao.local@navegador',
      status: state.student.status,
      activatedKeys: OFFICIAL_KEYS.filter((k) => state.unlockedFeatures.includes(k.featureId)).map((k) => k.key)
    },
    ...state.users
  ];

  return `
    <div class="container stack-lg">
      <div class="section-header">
        <div>
          <h1 class="section-title">Painel de Administração</h1>
          <p class="section-subtitle">Gestão local e demonstrativa de utilizadores e das oito chaves de acesso.</p>
        </div>
        <button type="button" class="btn btn-outline-light btn-sm" id="admin-lock-btn">Bloquear Sessão Admin</button>
      </div>

      <!-- 1 e 6. Lista de Utilizadores & Gestão de Acessos -->
      <section class="card-white stack-md">
        <h3>1. Lista e Gestão de Utilizadores</h3>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>Chaves Ativadas</th>
                <th>Estado</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              ${allUsers
                .map(
                  (u) => `
                <tr>
                  <td><strong>${escapeHtml(u.name)}</strong><br><span class="muted-light" style="font-size:0.8rem;">${escapeHtml(u.email)}</span></td>
                  <td class="mono">${u.activatedKeys.length > 0 ? escapeHtml(u.activatedKeys.join(', ')) : 'Nenhuma'}</td>
                  <td>
                    <span class="status-label ${u.status === 'ativo' ? 'status-done' : 'status-blocked'}">
                      ${u.status === 'ativo' ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td>
                    <button type="button" class="btn btn-sm ${u.status === 'ativo' ? 'btn-danger' : 'btn-success'}" data-toggle-user="${escapeHtml(u.id)}">
                      ${u.status === 'ativo' ? 'Bloquear Acesso' : 'Ativar Acesso'}
                    </button>
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- 2, 3, 4 e 5. Lista das 8 Chaves, Funcionalidades, Utilizadores e Estado -->
      <section class="card-white stack-md">
        <h3>2. Chaves de Acesso e Funcionalidades</h3>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Chave</th>
                <th>Funcionalidade Correspondente</th>
                <th>Utilizadores que Ativaram</th>
                <th>Estado</th>
                <th>Gestão</th>
              </tr>
            </thead>
            <tbody>
              ${OFFICIAL_KEYS.map((k) => {
                const status = k.alwaysFree ? 'gratuita' : getKeyStatus(k);
                const usersList = getUsersForKey(k.key);
                const isBlocked = status === 'bloqueada';
                return `
                  <tr>
                    <td class="mono"><strong>${escapeHtml(k.key)}</strong></td>
                    <td>${escapeHtml(k.title)}</td>
                    <td>${k.alwaysFree ? 'Acesso livre (sem chave)' : usersList.length > 0 ? escapeHtml(usersList.join(', ')) : 'Nenhum'}</td>
                    <td>
                      <span class="status-label ${status === 'bloqueada' ? 'status-blocked' : status === 'utilizada' || status === 'gratuita' ? 'status-done' : 'status-free'}">
                        ${status === 'bloqueada' ? 'Bloqueada' : status === 'gratuita' ? 'Gratuita (Sem chave)' : status === 'utilizada' ? 'Utilizada' : 'Disponível'}
                      </span>
                    </td>
                    <td>
                      ${
                        k.alwaysFree
                          ? '<span class="meta-row">Livre</span>'
                          : `<button type="button" class="btn btn-sm ${isBlocked ? 'btn-success' : 'btn-outline-dark'}" data-toggle-key="${escapeHtml(k.key)}">${isBlocked ? 'Desbloquear' : 'Bloquear'}</button>`
                      }
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- 7. Histórico de Ativações -->
      <section class="card-white stack-md">
        <h3>3. Histórico de Ativações</h3>
        ${
          state.keyActivations.length === 0
            ? '<p class="muted-light">Ainda não existem ativações registadas.</p>'
            : `
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Utilizador</th>
                      <th>Chave</th>
                      <th>Funcionalidade</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${state.keyActivations
                      .map(
                        (act) => `
                      <tr>
                        <td class="tabular">${escapeHtml(act.date)}</td>
                        <td>${escapeHtml(act.userName)}</td>
                        <td class="mono">${escapeHtml(act.key)}</td>
                        <td>${escapeHtml(act.feature)}</td>
                        <td>${escapeHtml(act.action)}</td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
        }
      </section>
    </div>
  `;
}

function bindAdminEvents() {
  const gateForm = document.getElementById('admin-gate-form');
  if (gateForm) {
    gateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pinInput = document.getElementById('admin-pin-input');
      const fb = document.getElementById('admin-gate-fb');
      const pin = pinInput.value.trim();
      const DEMO_ADMIN_HASH = '2235945431';
      if (hashPinLocal(pin) === DEMO_ADMIN_HASH) {
        adminSessionUnlocked = true;
        render();
      } else {
        fb.innerHTML = '<div class="feedback-banner error">Código de acesso incorreto.</div>';
      }
    });
    return;
  }

  const lockBtn = document.getElementById('admin-lock-btn');
  if (lockBtn) {
    lockBtn.addEventListener('click', () => {
      adminSessionUnlocked = false;
      render();
    });
  }

  document.querySelectorAll('[data-toggle-user]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const uid = btn.getAttribute('data-toggle-user');
      if (uid === state.student.id) {
        state.student.status = state.student.status === 'ativo' ? 'bloqueado' : 'ativo';
      } else {
        const u = state.users.find((item) => item.id === uid);
        if (u) u.status = u.status === 'ativo' ? 'bloqueado' : 'ativo';
      }
      saveState();
      render();
    });
  });

  document.querySelectorAll('[data-toggle-key]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const kCode = btn.getAttribute('data-toggle-key');
      const keyObj = OFFICIAL_KEYS.find((k) => k.key === kCode);
      const idx = state.blockedKeys.indexOf(kCode);
      if (idx >= 0) {
        state.blockedKeys.splice(idx, 1);
        state.keyActivations.unshift({
          date: nowFormatted(),
          userId: 'admin',
          userName: 'Administração Local',
          key: kCode,
          feature: keyObj ? keyObj.title : kCode,
          action: 'Desbloqueada'
        });
      } else {
        state.blockedKeys.push(kCode);
        state.keyActivations.unshift({
          date: nowFormatted(),
          userId: 'admin',
          userName: 'Administração Local',
          key: kCode,
          feature: keyObj ? keyObj.title : kCode,
          action: 'Bloqueada'
        });
      }
      saveState();
      render();
    });
  });
}

/* --------------------------------------------------------------------------
   9. INICIALIZAÇÃO GLOBAL DA APLICAÇÃO
   -------------------------------------------------------------------------- */

function initApp() {
  // Links de navegação no cabeçalho, menu mobile e rodapé
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-nav');
      if (target) navigate(target);
    });
  });

  const headerCta = document.getElementById('header-cta-btn');
  if (headerCta) {
    headerCta.addEventListener('click', () => {
      activeLessonId = state.lastLessonId || 'log-01';
      navigate('learn');
    });
  }

  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      const opening = drawer.hidden;
      drawer.hidden = !opening;
      menuBtn.setAttribute('aria-expanded', opening ? 'true' : 'false');
    });
  }

  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('app-modal');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  const initialHash = window.location.hash.replace('#', '');
  const validViews = ['home', 'learn', 'practice', 'premium', 'dashboard', 'profile', 'help', 'about', 'admin'];
  currentView = validViews.includes(initialHash) ? initialHash : 'home';
  navigate(currentView);
}

document.addEventListener('DOMContentLoaded', initApp);
