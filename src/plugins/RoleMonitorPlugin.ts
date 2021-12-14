import { Plugin } from '../types';
import { TEST_GUILD_IDS } from '../utils/constants';

const MUTED_ROLE_ID = '870041655368110161';
const CUBE_ROLE_ID = '557816418133999626';

export const RoleMonitorPlugin: Plugin = (client) => {
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
      if (TEST_GUILD_IDS.includes(newMember.guild.id)) {
        const wasMuted = oldMember.roles.cache.has(MUTED_ROLE_ID);
        const isMuted = newMember.roles.cache.has(MUTED_ROLE_ID);
        if (wasMuted !== isMuted) {
          if (isMuted) {
            await newMember.roles.remove(CUBE_ROLE_ID);
          } else {
            await newMember.roles.add(CUBE_ROLE_ID);
          }
        }
      }
    } catch (err) {
      client.emit('error', err);
    }
  });
};
