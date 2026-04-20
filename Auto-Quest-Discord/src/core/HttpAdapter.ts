import { DefaultRestOptions, type ResponseLike } from '@discordjs/rest';
import { Constants } from './Constants.js';

type RequestInit = Parameters<typeof DefaultRestOptions.makeRequest>[1];

export async function makeRequest(url: string, init: RequestInit): Promise<ResponseLike> {
  if (init.headers) {
    const headers = new Headers(init.headers as Record<string, string>);

    if (headers.has('User-Agent')) {
      headers.set('User-Agent', Constants.USER_AGENT);
    }

    const auth = headers.get('Authorization');
    if (auth?.startsWith('Bot ')) {
      headers.set('Authorization', auth.replace('Bot ', ''));
    }

    for (const [key, value] of Object.entries(Constants.EXTRA_HEADERS)) {
      headers.append(key, value);
    }

    headers.append('x-super-properties', Constants.SuperProperties);
    init.headers = headers;
  }

  return DefaultRestOptions.makeRequest(url, init);
}
