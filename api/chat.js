// api/chat.js
// Serverless function da Vercel. Fica em /api/chat e é chamada pelo widget
// do site via fetch('/api/chat'). A chave da API NUNCA aparece no navegador:
// ela vive só aqui, lida da variável de ambiente ANTHROPIC_API_KEY.

const SYSTEM_PROMPT = `Você é o assistente virtual da Nexa Machine, site da Nexa Máquinas e Soluções Industriais.

SOBRE A EMPRESA:
- Especializada na venda e revenda de máquinas CNC: Centros de Usinagem CNC, Tornos CNC e Centros de Furação.
- Localizada em Indaiatuba, SP (R. Alberto Magnusson, 362 - Comercial Vitória Martini).
- Atende e entrega para todo o Brasil, com transportadoras especializadas em equipamentos industriais.
- Mais de 500 vendas realizadas. Referência no setor de máquinas CNC.
- Garantia total de 12 meses a partir da entrega técnica em todas as máquinas.
- Oferece instalação e treinamento operacional no local do cliente.
- Prazo médio de entrega: 15 a 45 dias úteis após a compra (varia conforme equipamento e localização).
- Em alguns casos aceita máquinas usadas como parte do pagamento (permuta), sujeito a avaliação.
- Horário de atendimento: Segunda a sexta, 07:25h às 17:18h.
- Contatos: telefone/WhatsApp (19) 99724-7498, time de vendas (19) 98806-6290, e-mail contato@nexamachine.com.br.

COMO RESPONDER:
- Responda sempre em português do Brasil, de forma direta, simpática e profissional.
- Respostas curtas (2-4 frases). Isso é um chat, não um e-mail.
- Use apenas as informações acima. Nunca invente preços, especificações técnicas exatas, prazos específicos fora do que foi informado, ou disponibilidade de estoque.
- Para orçamentos, preços, condições de pagamento ou especificações técnicas detalhadas de uma máquina específica, oriente o visitante a falar com o time de vendas pelo WhatsApp (19) 98806-6290 ou preencher o formulário de contato no site.
- Se não souber a resposta ou a pergunta estiver fora do escopo da Nexa, seja honesto e direcione para o WhatsApp ou e-mail.
- Não responda sobre assuntos não relacionados à Nexa Machine ou seus produtos.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY não configurada no ambiente da Vercel.');
    return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
  }

  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Requisição inválida.' });
  }

  // Limites simples de proteção: não deixa o histórico crescer demais
  // e corta mensagens absurdamente longas (evita abuso/custo alto).
  const safeMessages = messages
    .slice(-12)
    .filter(m => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (safeMessages.length === 0) {
    return res.status(400).json({ error: 'Requisição inválida.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: safeMessages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro da API Anthropic:', data);
      return res.status(502).json({ error: 'Não foi possível obter uma resposta agora.' });
    }

    const reply = data?.content?.find(block => block.type === 'text')?.text
      || 'Desculpe, não consegui gerar uma resposta. Tente novamente ou fale com nosso time pelo WhatsApp.';

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Erro ao chamar a API da Anthropic:', err);
    return res.status(500).json({ error: 'Erro interno ao processar sua mensagem.' });
  }
}







function initCarousel(selector) {
  const carousel = document.querySelector(selector);
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('img');
  const prevBtn = carousel.querySelector('.prev');
  const nextBtn = carousel.querySelector('.next');

  let index = 0;
  const total = slides.length;

  function updateCarousel() {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  function nextSlide() {
    index = (index + 1) % total;
    updateCarousel();
  }

  function prevSlide() {
    index = (index - 1 + total) % total;
    updateCarousel();
  }

  // Navegação manual
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // Troca automática a cada 5 segundos
  let autoplay = setInterval(nextSlide, 5000);

  // Reinicia o tempo quando o usuário clicar nos botões
  function restartAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(nextSlide, 5000);
  }

  if (nextBtn) nextBtn.addEventListener('click', restartAutoplay);
  if (prevBtn) prevBtn.addEventListener('click', restartAutoplay);

  // Pausa quando o mouse estiver sobre o carrossel
  carousel.addEventListener('mouseenter', () => clearInterval(autoplay));

  // Retoma quando o mouse sair
  carousel.addEventListener('mouseleave', () => {
    autoplay = setInterval(nextSlide, 5000);
  });
}

// Inicializa os carrosséis
initCarousel('.hero-carousel');
initCarousel('.machines-carousel');

document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.parentElement;
    const isOpen = item.classList.contains('open');

    // Fecha todos
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

    // Abre o clicado (se não estava aberto)
    if (!isOpen) item.classList.add('open');
  });
});