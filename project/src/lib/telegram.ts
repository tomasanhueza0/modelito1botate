const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error('Missing Telegram Bot Token');
}

if (!WEBHOOK_URL) {
  throw new Error('Missing Webhook URL');
}

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Setup webhook
export async function setupWebhook() {
  try {
    const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `${WEBHOOK_URL}/api/webhook`,
        allowed_updates: ['message', 'callback_query'],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to set webhook');
    }

    const result = await response.json();
    console.log('Webhook setup result:', result);
    return result;
  } catch (error) {
    console.error('Error setting up webhook:', error);
    throw error;
  }
}

export async function sendTelegramMessage(chatId: string, text: string) {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send Telegram message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

export async function sendTelegramButtons(
  chatId: string,
  text: string,
  options: string[]
) {
  try {
    const keyboard = {
      inline_keyboard: options.map(option => [{
        text: option,
        callback_data: option
      }])
    };

    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_markup: keyboard,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send Telegram message with buttons');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message with buttons:', error);
    throw error;
  }
}

// Function to handle incoming updates from Telegram
export async function handleTelegramUpdate(update: any) {
  // Handle callback queries (button clicks)
  if (update.callback_query) {
    const chatId = update.callback_query.message.chat.id;
    const data = update.callback_query.data;
    const userId = update.callback_query.from.id;
    
    // Handle different button responses
    switch (data) {
      case 'Fotos':
      case 'Modelaje':
      case 'Publicidad':
        await handleWorkTypeSelection(chatId, userId, data);
        break;
      case 'Mañana':
      case 'Tarde':
      case 'Noche':
        await handleAvailabilitySelection(chatId, userId, data);
        break;
      // Add more cases as needed
    }
    return;
  }

  // Handle text messages
  if (update.message?.text) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    const userId = update.message.from.id;

    if (text === '/start') {
      await startRegistration(chatId);
    } else {
      await handleTextInput(chatId, userId, text);
    }
  }
}

async function startRegistration(chatId: string) {
  await sendTelegramMessage(
    chatId,
    '¡Hola! 👋 ¿Cómo te llamas?'
  );
}

async function handleWorkTypeSelection(chatId: string, userId: string, workType: string) {
  // Save work type to database
  try {
    const { error } = await supabase
      .from('models')
      .update({ work_type: [workType] })
      .eq('telegram_id', userId);

    if (error) throw error;

    // Ask for zone
    await sendTelegramButtons(
      chatId,
      '¿En qué zona?',
      ['Palermo', 'Recoleta', 'Belgrano', 'San Telmo', 'Puerto Madero']
    );
  } catch (error) {
    console.error('Error saving work type:', error);
    await sendTelegramMessage(
      chatId,
      '❌ Hubo un error. Por favor, intenta nuevamente.'
    );
  }
}

async function handleAvailabilitySelection(chatId: string, userId: string, availability: string) {
  // Save availability to database
  try {
    const { error } = await supabase
      .from('models')
      .update({ availability: [availability] })
      .eq('telegram_id', userId);

    if (error) throw error;

    await sendTelegramMessage(
      chatId,
      '✅ ¡Registro completado! Te notificaremos cuando haya trabajos que coincidan con tus preferencias.'
    );
  } catch (error) {
    console.error('Error saving availability:', error);
    await sendTelegramMessage(
      chatId,
      '❌ Hubo un error. Por favor, intenta nuevamente.'
    );
  }
}

async function handleTextInput(chatId: string, userId: string, text: string) {
  // Check if this is the name input
  const existingUser = await supabase
    .from('models')
    .select('name')
    .eq('telegram_id', userId)
    .single();

  if (!existingUser.data?.name) {
    // Save name and ask for work type
    try {
      const { error } = await supabase
        .from('models')
        .insert([
          {
            telegram_id: userId,
            name: text,
          }
        ]);

      if (error) throw error;

      await sendTelegramButtons(
        chatId,
        '¿Qué tipo de trabajo buscas?',
        ['Fotos', 'Modelaje', 'Publicidad']
      );
    } catch (error) {
      console.error('Error saving name:', error);
      await sendTelegramMessage(
        chatId,
        '❌ Hubo un error. Por favor, intenta nuevamente.'
      );
    }
  }
}