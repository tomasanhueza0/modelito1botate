import { handleTelegramUpdate } from '../lib/telegram';

export async function handleWebhook(request: Request) {
  try {
    const update = await request.json();
    await handleTelegramUpdate(update);
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response('Error', { status: 500 });
  }
}