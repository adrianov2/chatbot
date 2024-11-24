const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inicializando o cliente
const client = new Client({
    authStrategy: new LocalAuth()
});

// Catálogo de produtos
const catalogo = [
    { id: 1, nome: 'Sistema de Rifa Online', preco: 1.500, descricao: 'Rifa online premiun.' },
    { id: 2, nome: 'Criação de Site', preco: 250.00, descricao: 'Loja virtual pronta, 100% personalizada.' },
    { id: 3, nome: 'Ferramenta de Chatbot', preco: 150, descricao: 'Automatização de atendimentos para seu negócio.' },
    { id: 4, nome: 'Bot de Sinais - Jogos de Cassino para telegram', preco: 150, descricao: 'Análise e sinais para cassinos online para telegram.' },
    { id: 5, nome: 'Robo IQ Option e Exnova', preco: 800.00, descricao: 'Automatização para de trading.' },
    { id: 6, nome: 'Bot Telegram IQ Option e Exnova', preco: 400.00, descricao: 'Bot para automação de trading no Telegram.' },
    { id: 7, nome: 'PLR Premium', preco: 39.99, descricao: 'Pacotes de conteúdo digital para revenda.' },
    { id: 8, nome: 'Sistema Delivery Web', preco: 500.00, descricao: 'Tem seu propio delivery web na palma da mão.' },
    { id: 9, nome: 'Cassino Online', preco: 2.500, descricao: 'Plataforma completa para cassino online.' },
    { id: 10, nome: 'Chatbot WhatsApp', preco: 150, descricao: 'Automatização de atendimentos no WhatsApp.' },
];

// Links de pagamento para cada produto
const linksPagamento = {
    1: 'https://mpago.la/1KtXJQw',  
    2: 'https://mpago.la/1EUC44h',  
    3: 'https://mpago.la/1C4LeUR',  
    4: 'https://mpago.la/1Mo5CUr',  
    5: 'https://mpago.la/2bWzNto',  
    6: 'https://mpago.la/1TU3jmK',  
    7: 'https://mpago.la/1Jqzeyk',  
    8: 'https://mpago.la/31piEJf',  
    9: 'https://mpago.la/2dwCQaw',  
    10: 'https://mpago.la/2miq6N7', 
};

// Palavras-chave para iniciar o bot
const palavrasChave = ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'quero comprar', 'venda', 'interesse', 'catalogo', 'produtos'];

// Controle de estado por cliente
let estados = {};

// Função para obter o nome do cliente
const obterNomeCliente = async (from) => {
    const contato = await client.getContactById(from);
    return contato.pushname || 'Cliente';
};

// Função para exibir o catálogo
const montarCatalogo = () => {
    let resposta = '🎉 Confira o nosso catálogo exclusivo de softwares!\n\n';
    catalogo.forEach(produto => {
        resposta += `🔢 *${produto.id}.* ${produto.nome} - *R$ ${produto.preco}*\n📝 ${produto.descricao}\n\n`;
    });
    resposta += '📲 Digite o número do produto para saber mais.\n↩️ *Voltar* para o menu principal.';
    return resposta;
};

// Menu principal
const enviarMenuPrincipal = () => {
    return '👇 Escolha uma opção:\n' +
        '1️⃣ - Ver catálogo de produtos\n' +
        '2️⃣ - Falar com um atendente humano\n' +
        '3️⃣ - Sair do atendimento';
};

// Evento de mensagem recebida
client.on('message', async message => {
    try {
        const texto = message.body.toLowerCase().trim();
        const nomeCliente = await obterNomeCliente(message.from);
        const estadoAtual = estados[message.from]?.estado || 'inicial';

        if (estadoAtual === 'inicial') {
            estados[message.from] = { estado: 'menu' };
            message.reply(
                `🎉 *Olá, ${nomeCliente}! Seja muito bem-vindo(a) à nossa loja de softwares!* 😊\n\n` +
                `💻 *Eu sou o seu assistente virtual* e estou aqui para ajudar você a encontrar as melhores soluções digitais para seus projetos e negócios. 🚀\n\n` +
                `📲 *Siga-nos no Instagram*: https://www.instagram.com/dri.tec/#\n` +
                `🌐 *Visite nosso site*: https://dritec.netlify.app\n\n` +
                enviarMenuPrincipal()
            );

        } else if (estadoAtual === 'menu' && texto === '1') {
            estados[message.from] = { estado: 'catalogo' };
            message.reply(montarCatalogo());
        } else if (estadoAtual === 'catalogo') {
            if (texto === 'voltar') {
                estados[message.from] = { estado: 'menu' };
                message.reply(enviarMenuPrincipal());
            } else if (catalogo.some(produto => texto == produto.id.toString())) {
                const produto = catalogo.find(p => texto == p.id.toString());
                estados[message.from] = { estado: 'email', produto };
                message.reply(
                    `📦 *Produto:* ${produto.nome}\n💰 *Preço:* R$ ${produto.preco}\n✅ *Descrição:* ${produto.descricao}\n\n` +
                    'Por favor, envie o seu email para prosseguir.\n↩️ *Voltar* para o catálogo.'
                );
            } else {
                message.reply('❌ Opção inválida. Por favor, escolha um número válido ou digite *voltar* para retornar.');
            }
        } else if (estadoAtual === 'email') {
            if (texto === 'voltar') {
                estados[message.from] = { estado: 'catalogo' };
                message.reply(montarCatalogo());
            } else {
                estados[message.from].email = texto;
                const produto = estados[message.from].produto; 
                const linkPagamento = linksPagamento[produto.id]; 

                estados[message.from].estado = 'pagamento';
                message.reply(
                    `💳 Obrigado! Aqui está o link para pagamento do produto *${produto.nome}*:\n` +
                    `${linkPagamento}\n\n` +
                    'Após realizar o pagamento, envie o comprovante para confirmação.\n↩️ *Voltar* para alterar o email.'
                );
            }
        } else if (estadoAtual === 'pagamento') {
            if (texto === 'voltar') {
                estados[message.from] = { estado: 'email' };
                message.reply('Por favor, envie novamente o seu email.\n↩️ *Voltar* para o catálogo.');
            } else {
                estados[message.from].comprovante = texto;
                estados[message.from].estado = 'finalizado';
                message.reply(
                    `🎉 Compra confirmada com sucesso, ${nomeCliente}! Você adquiriu o produto *${estados[message.from].produto.nome}*.\n\n` +
                    '💡 Estamos felizes em ajudar com seus projetos. Qualquer dúvida, estamos à disposição!'
                );
            }
        } else if (texto === '2') {
            estados[message.from] = { estado: 'atendente' };
            message.reply('👨‍💼 Um de nossos atendentes estará com você em instantes! ⏳');
        } else if (texto === '3' || texto === 'sair') {
            estados[message.from] = null;
            message.reply(`👋 Até logo, ${nomeCliente}! Fique à vontade para voltar quando precisar. 😃`);
        } else {
            message.reply(
                `😕 Não entendi sua mensagem, ${nomeCliente}. Escolha uma opção do menu abaixo:\n` + enviarMenuPrincipal()
            );
        }
    } catch (error) {
        console.error('Erro ao processar a mensagem:', error);
    }
});

// Evento de QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code gerado! Escaneie com o WhatsApp para iniciar.');
});

// Evento de cliente pronto
client.on('ready', () => {
    console.log('O assistente está pronto para atender!');
});

// Evento de autenticação bem-sucedida
client.on('authenticated', () => {
    console.log('Autenticação bem-sucedida!');
});

// Evento de desconexão
client.on('disconnected', reason => {
    console.log('Cliente desconectado:', reason);
});

// Inicializar o cliente
client.initialize();
