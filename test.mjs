// Self-check: labels override the English placeholders.
import assert from 'node:assert';
import { extractBridgeEvent, setLabels } from './bridge_helpers.js';
const msg = { key: { id: 'x', remoteJid: 'g@g.us' }, message: { locationMessage: { name: 'X' } } };
const run = () => extractBridgeEvent({ msg, chatId: 'g@g.us', senderId: 'a@s.whatsapp.net', senderNumber: 'a', isGroup: true,
  downloadMedia: async () => Buffer.from(''), cacheDirs: {} });
assert.equal((await run()).body, '[Location: X]');
setLabels({ location: 'מיקום' });
assert.equal((await run()).body, '[מיקום: X]');
console.log('ok');
