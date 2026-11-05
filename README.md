# whatsapp-readonly-bridge

Read-only WhatsApp bridge (Baileys). Receives messages; every outbound write
(messages, media, polls, edits, typing, read receipts) is blocked.
Derived from the Hermes Agent WhatsApp bridge.

    npm install && node bridge.js --port 3000 --session ./session

First run prints a QR code to link the device. `session/` holds your login: never commit it.
