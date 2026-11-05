# whatsapp-readonly-bridge

Read-only WhatsApp bridge (Node.js + [Baileys](https://github.com/WhiskeySockets/Baileys)).
It logs in as a linked device and exposes incoming messages over a local HTTP API.
**It can never write to WhatsApp**: messages, media, polls, locations, edits, typing
indicators and read receipts are all blocked.
Derived from the Hermes Agent WhatsApp bridge.

## For Claude Code / other agents: how to use

1. Setup (Node 18+): `npm install`
2. Link the device, once: `node bridge.js --pair-only --session ./session`
   and scan the QR code (WhatsApp > Linked devices). Ask the user to scan it. Never scan or guess.
3. Run: `node bridge.js --port 3000 --session ./session`
   (add `--mode bot` or `--mode self-chat`; default `self-chat`)
4. Read messages (the API listens on 127.0.0.1 only; the Host header must be loopback):
   - `curl localhost:3000/health`: connection state, queue length, `readOnly: true`
   - `curl localhost:3000/messages`: returns and **clears** the queue of new incoming messages (JSON array)
   - `curl localhost:3000/chat/<chatId>`: chat info

Message fields: `messageId, chatId, senderId, senderName, chatName, isGroup, body, hasMedia,
mediaType, mediaUrls, quotedText, timestamp`. Groups end in `@g.us`.

## Read-only guarantee (do not remove)

`bridge.js`: `READ_ONLY = true` middleware. Every non-GET/HEAD request (`/send`, `/edit`,
`/send-media`, `/send-poll`, `/send-location`, `/typing`, `/read`) returns
`{success: true, blocked: true}` and sends nothing. Keep it that way.
Verify: `curl -XPOST localhost:3000/send -H 'content-type: application/json' -d '{}'` must return `blocked: true`.

## Env vars (optional)

`WHATSAPP_ALLOWED_USERS` (comma-separated numbers), `WHATSAPP_DM_POLICY` (default `open`),
`WHATSAPP_MODE`, `WHATSAPP_DEBUG`, `HERMES_IMAGE_CACHE_DIR`, `HERMES_DOCUMENT_CACHE_DIR`, `HERMES_AUDIO_CACHE_DIR`.

## Privacy rules

- `session/` is the WhatsApp login. Never commit, copy or print it (it is in `.gitignore`).
- Never commit message contents, phone numbers or chat IDs.
- Messages are only held in memory until `/messages` is called.
