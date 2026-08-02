import type { CompanionReply } from '@/lib/companion';

function getCompanionApiUrl(): string {
  const configured = import.meta.env.VITE_COMPANION_API_URL as string | undefined;
  if (configured) return configured;
  return import.meta.env.DEV ? 'http://127.0.0.1:5178/api/companion' : '/api/companion';
}

export async function fetchCompanionReply(userText: string): Promise<CompanionReply> {
  try {
    const response = await fetch(getCompanionApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: userText }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM companion request failed: ${errorText}`);
    }

    return response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Unable to reach the companion API: ${message}`);
  }
}
