// Conteúdo das publicações (PT-PT). Pode ser editado à vontade.
//
// Chaves:
//   "categoria-n"       -> partilhado pelas gémeas real-categoria-n e ai-categoria-n
//                          (mesmo texto para as duas, para que a legenda não explique diferenças)
//   "real-..." / "ai-..." -> usado quando as duas imagens com o mesmo número NÃO são gémeas
// Legendas: máx. 30 palavras. Comentários: 3 por imagem, sem pistas sobre IA ou autenticidade.

window.POST_NAMES = [
  "Ana Paixão", "Ana Maximiano", "Angela Baltasar", "António Pinto de Mesquita", "António Santos",
  "Antony Costa", "Beatriz Ferreira", "Bruno Crestino", "Celestina Bravo", "Cláudio Grilo",
  "Daniel Nogueira", "Diogo Bernardo", "Fábio Catorze", "Fernando Caldeira", "Gonçalo Oliveira",
  "Heral Mukesh", "Hugo Alves", "Hugo Teixeira", "Inês Cunha Vale", "Inês da Rosa Ferreira",
  "Joana Basílio", "Joana Vaz Pinto Núncio", "João Rocha", "João Sá Monteiro", "João Antunes",
  "João Silva", "Jorge Maia", "Marco Pereira", "Marco Ruivo", "Mariana Pinto",
  "Miguel Pires de Matos", "Milene Silva", "Nelson Gomes", "Neuza Aires", "Paulo Neves",
  "Rita Matos", "Rui Gabriel Goncalves", "Sabrina Serra", "Sérgio Palhais", "Tiago Barros",
  "Tiago Graça Neves", "Tiago Morais", "Tiago Ventura Correia", "Vania Sousa", "Vera Rebola"
];

window.POST_CONTENT = {
  // ---------- gémeas (real + IA partilham o texto) ----------
  "animais-1": {
    caption: "Fim de semana na aldeia dos avós. O galo acordou-me às 5h, a avó às 6h, e os ovos do pequeno-almoço vieram destas senhoras.",
    comments: [
      "O galo tem claramente mais autoridade na aldeia do que o presidente da junta.",
      "Ovos caseiros às 6h e eu aqui com cereais de caixa. Respeito.",
      "A da frente está a posar. Influencer de capoeira confirmada 🐔"
    ]
  },
  "animais-2": {
    caption: "Noite de Halloween cá em casa. Eu tratei das bebidas, ele da fantasia. Durou exatamente 40 segundos até decidir que a dignidade era mais importante.",
    comments: [
      "Aquele olhar diz tudo: esta noite vai haver vingança em cima dos teus sapatos.",
      "Gato preto, Halloween e copo na mesa. Início de filme de terror ou sexta-feira normal?",
      "40 segundos é mais do que eu aguento de gravata numa reunião."
    ]
  },
  "animais-3": {
    caption: "O Tobias recebeu uma camisola nova da tia. Ainda não sabemos se está a posar ou a planear a fuga. Está assim há uma manhã inteira.",
    comments: [
      "Foto de perfil para o LinkedIn: «Open to work. Especialista em ladrar ao carteiro.»",
      "Ele não está a posar, está a ignorar-te com estilo. Há uma diferença.",
      "Quero a mesma camisola em tamanho humano. Urgente."
    ]
  },
  "cidade-2": {
    caption: "Primeiro dia de sol depois de uma semana de chuva. Metade da cidade teve a mesma ideia: banco, tulipas e zero vontade de voltar ao escritório.",
    comments: [
      "Bancos todos ocupados e tu a tirar fotos em vez de guardar lugar. Erro de principiante.",
      "Muito bonito, sim senhor. E onde é que se almoça?",
      "Proposta: a próxima aula é aqui. Quem apoia?"
    ]
  },
  "cidade-3": {
    caption: "Vista do escritório novo. Dizem que compensa o trânsito para a ponte todas as manhãs. Ainda estou a tentar acreditar nisso.",
    comments: [
      "Daqui consegues ver o comboio que perdeste às 8h17.",
      "A ponte ali tão perto e o GPS continua a dizer 47 minutos.",
      "Vista top. Agora mostra o lugar de estacionamento 😏"
    ]
  },
  "natureza-1": {
    caption: "Pinhal antes da praia. Plano: dez minutos à sombra. Realidade: duas horas, um livro a meio e uma sesta não planeada. Zero arrependimentos.",
    comments: [
      "Estes pinheiros têm a mesma postura que eu ao fim de quatro horas de aula.",
      "Sesta não planeada é a melhor sesta. Facto científico.",
      "Qual era o livro? Pergunto só para ter desculpa para adormecer também."
    ]
  },
  "natureza-2": {
    caption: "Fomos ver o pôr do sol ao castelo e chegámos dez minutos atrasados. Ficou o candeeiro, a muralha e a promessa de voltar amanhã.",
    comments: [
      "Dez minutos de atraso é praticamente pontual em horário português.",
      "O candeeiro é o protagonista. O castelo é figurante.",
      "Amanhã leva despertador e lanche. O pôr do sol não espera por ninguém."
    ]
  },
  "natureza-3": {
    caption: "Choveu a viagem toda e, de repente, isto. O condutor recusou-se a parar para a fotografia, por isso fica assim mesmo, pelo para-brisas.",
    comments: [
      "Seguiram o arco-íris? Preciso do pote de ouro antes do fim do mês.",
      "Condutor responsável, fotógrafo frustrado. Equilíbrio perfeito.",
      "Eu a tentar tirar fotos assim e só me sai o limpa-vidros."
    ]
  },
  "pessoas-1": {
    caption: "Piquenique de fim de verão. A regra era simples: cada um trazia uma coisa. Resultado: três saladas de massa, zero sobremesas e nenhum arrependimento.",
    comments: [
      "Três saladas de massa é o padrão nacional. Está tudo normal.",
      "Quem trouxe os croquetes merece promoção imediata.",
      "Parece uma reunião de equipa, mas com uma agenda muito melhor."
    ]
  },
  "pessoas-2": {
    caption: "Portugal a jogar, esplanada cheia, cerveja fresca. Durante noventa minutos fomos todos treinadores, árbitros e comentadores. No fim, só o empregado é que saiu a ganhar.",
    comments: [
      "Noventa minutos? Com descontos e discussão do VAR foram três horas.",
      "Melhor lugar da casa: perto da televisão e ainda mais perto da cozinha.",
      "Treinador de bancada é o desporto nacional, e ninguém me convence do contrário."
    ]
  },
  "pessoas-3": {
    caption: "Festas da vila e, no meio da praça, isto. Meia hora sem tirar os olhos. A minha mãe só repetia: «não te chegues muito perto».",
    comments: [
      "Eu a acender o grelhador: vinte minutos e uma caixa de fósforos. Ela: isto.",
      "A segurança no trabalho desta senhora está noutro nível.",
      "As senhoras ao fundo estão à espera da vez delas ou do extintor? 🔥"
    ]
  },

  // ---------- não-gémeas (texto próprio) ----------
  "real-cidade-1": {
    caption: "Saí do trabalho tarde, com zero paciência, e o céu de Lisboa decidiu fazer isto. Dez minutos no miradouro e já estava tudo perdoado.",
    comments: [
      "Lisboa a pedir desculpa pelo trânsito da manhã.",
      "O céu a fazer mais horas extra do que nós.",
      "Isto pedia música de fundo e uma imperial na mão."
    ]
  },
  "ai-cidade-1": {
    caption: "Segunda-feira, 7h40, comboio com vinte minutos de atraso. Pelo menos alguém nesta estação está fotogénico a esta hora.",
    comments: [
      "Vinte minutos de atraso é o novo «a horas».",
      "Comboio parado e tu em sessão fotográfica. Prioridades certíssimas.",
      "Este comboio já viu mais segundas-feiras do que todos nós juntos."
    ]
  },
  "real-comida-1": {
    caption: "Encontrámos este café escondido numa rua secundária. Croissant estaladiço, bebida com canela e uma sobremesa que parecia uma nuvem. Voltamos amanhã, já ficou decidido.",
    comments: [
      "Essa sobremesa tem mais seguidores do que eu, garanto.",
      "Duas bebidas e um croissant. Quem é que ficou a ver? 👀",
      "Partilha a morada ou considera esta amizade terminada."
    ]
  },
  "real-comida-2": {
    caption: "Domingo de chuva, receita da avó e um livro a meio. A ideia era guardar alguns para segunda-feira. A ideia não sobreviveu ao fim da tarde.",
    comments: [
      "Traz para a próxima aula. É para investigação científica do grupo.",
      "Receita da avó = receita que nunca vais conseguir replicar. Lei universal.",
      "Guardar para segunda-feira? Nem os brownies acreditaram nisso."
    ]
  },
  "real-comida-3": {
    caption: "Sexta-feira, 13h, a reunião acabou mais cedo. Há decisões que se tomam sozinhas: bifana, mostarda q.b. e uma imperial.",
    comments: [
      "Mostarda q.b. aqui significa «até deixar de ver a carne». Aprovado.",
      "Isto sim é um almoço de negócios.",
      "Esta bifana tem mais personalidade do que metade das apresentações deste semestre."
    ]
  },
  "ai-comida-1": {
    caption: "Almoço de domingo na tasca do costume. O senhor Joaquim já nem pergunta: polvo à lagareiro e jarro de tinto. Tradição é tradição.",
    comments: [
      "Pelas paredes, aposto que até o polvo é do Sporting.",
      "Batatas a murro e jarro de tinto: dieta mediterrânica no seu melhor.",
      "Senhor Joaquim, se estiver a ler isto, guarde-me uma mesa para domingo."
    ]
  },
  "ai-comida-2": {
    caption: "Disse que ia só tomar um café. Depois vi a montra. Bolo de cenoura com cerejas, pistáchio e gelado. O café arrefeceu, mas por boas razões.",
    comments: [
      "«Só um café» é a maior mentira que contamos a nós próprios.",
      "Cerejas, pistáchio E gelado? Alguém aqui não conhece a palavra moderação, e eu respeito.",
      "Isto não é um bolo, é um projeto de investimento."
    ]
  },
  "ai-comida-3": {
    caption: "Fim de semana no Porto e a primeira paragem foi obrigatória. Francesinha, batatas e uma cerveja. O passeio pela Ribeira pode esperar pela digestão.",
    comments: [
      "Ovo estrelado por cima é obrigatório. Quem disser o contrário não é de confiança.",
      "A digestão de uma francesinha dura mais do que um semestre de MBA.",
      "Molho a escorrer até ao prato: sinal de que foi feita com amor."
    ]
  }
};
