import "server-only";

export async function notifyNewDecree(text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_FROM_EMAIL;
  const to = process.env.NOTIFICATION_TO_EMAIL;
  if (!apiKey || !from || !to) return;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Novo decreto da Yasmin 👑",
        text: `Um novo decreto foi salvo no palácio:\n\n${text}\n\nAbra o painel administrativo para responder.`,
      }),
    });
    if (!response.ok) console.error("Resend recusou a notificação:", response.status);
  } catch (error) {
    console.error("Falha opcional ao enviar e-mail:", error);
  }
}
