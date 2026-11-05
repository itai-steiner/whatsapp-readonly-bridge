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
   - `curl localhost:3000/groups`: your groups (id, name)

Message fields: `messageId, chatId, senderId, senderName, chatName, isGroup, body, hasMedia,
mediaType, mediaUrls, quotedText, timestamp`. Groups end in `@g.us`.

## Customize (groups and language)

Copy `config.example.json` to `config.json` (or pass `--config path`). Everything is optional.

- **Groups**: off by default. Set `"groups": {"read": true}` to read group messages.
  `include` = only these groups (id like `1203...@g.us` or exact group name), empty = all groups.
  `exclude` = skip these. Find ids/names with `curl localhost:3000/groups` (needs a linked session).
  Group messages from others bypass the `self-chat` / `WHATSAPP_ALLOWED_USERS` filters; your own group messages are ignored.
- **Language**: `"labels"` overrides the placeholder texts in message bodies (`[Location: ...]`,
  `[image received]`, polls, contacts...). See `config.he.example.json` (Hebrew). Message text itself is never translated.
- Other changes: edit `bridge.js` (HTTP API and filtering) and `bridge_helpers.js` (message parsing). `npm test` runs a small self-check.

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
