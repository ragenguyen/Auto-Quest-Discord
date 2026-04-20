import { randomUUID } from 'node:crypto';

export class Constants {
  static readonly USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) discord/1.0.9215 Chrome/138.0.7204.251 ' +
    'Electron/37.6.0 Safari/537.36';

  static readonly Properties = {
    os: 'Windows',
    browser: 'Discord Client',
    device: '',
    release_channel: 'stable',
    client_version: '1.0.9215',
    os_version: '10.0.19045',
    os_arch: 'x64',
    app_arch: 'x64',
    system_locale: 'en-US',
    has_client_mods: false,
    client_launch_id: randomUUID(),
    browser_user_agent: Constants.USER_AGENT,
    browser_version: '37.6.0',
    os_sdk_version: '19045',
    client_build_number: 471091,
    native_build_number: 72186,
    client_event_source: null,
    launch_signature: randomUUID(),
    client_heartbeat_session_id: randomUUID(),
    client_app_state: 'focused',
  } as const;

  static get SuperProperties(): string {
    return Buffer.from(JSON.stringify(Constants.Properties)).toString('base64');
  }

  static readonly EXTRA_HEADERS: Record<string, string> = {
    'accept-language': 'vi',
    origin: 'https://discord.com',
    pragma: 'no-cache',
    priority: 'u=1, i',
    referer: 'https://discord.com/channels/@me',
    'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'x-debug-options': 'bugReporterEnabled',
    'x-discord-locale': 'en-US',
    'x-discord-timezone': 'Asia/Saigon',
  } as const;

  static readonly EXCLUDED_QUEST_IDS = new Set<string>(['1412491570820812933']);
}
