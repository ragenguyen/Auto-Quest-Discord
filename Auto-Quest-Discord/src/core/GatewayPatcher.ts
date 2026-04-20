import { WebSocketShard } from '@discordjs/ws';
import { GatewayOpcodes, type GatewaySendPayload } from 'discord-api-types/v10';
import { Constants } from './Constants.js';
import { Logger } from '@ui/Logger.js';

const logger = Logger.create('GatewayPatcher');

export function applyGatewayPatch(): void {
  const originalSend = WebSocketShard.prototype.send;

  WebSocketShard.prototype.send = async function (payload: GatewaySendPayload) {
    if (payload.op === GatewayOpcodes.Identify) {
      logger.debug('Patching IDENTIFY payload with client properties');
      payload.d = {
        token: payload.d.token,
        properties: {
          ...Constants.Properties,
          is_fast_connect: false,
          gateway_connect_reasons: 'AppSkeleton',
        },
        capabilities: 0,
        intents: payload.d.intents,
        presence: payload.d.presence,
        compress: payload.d.compress,
        client_state: {
          guild_versions: {},
        },
      } as typeof payload.d;
    }

    return originalSend.call(this, payload);
  };

  logger.debug('Gateway identify patch applied');
}
