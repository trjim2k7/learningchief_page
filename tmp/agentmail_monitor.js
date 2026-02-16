#!/usr/bin/env node
const path = require('path');

function loadSdk() {
  try {
    return require('agentmail');
  } catch (_) {
    try {
      return require(path.join(__dirname, '../learningchief_page/learningchief-platform/node_modules/agentmail'));
    } catch (_) {
      return null;
    }
  }
}

(async () => {
  const sdk = loadSdk();
  if (!sdk) {
    console.log('NO_REPLY');
    return;
  }

  const { AgentMailClient } = sdk;
  if (typeof AgentMailClient !== 'function') {
    console.log('NO_REPLY');
    return;
  }

  const apiKey = process.env.AGENTMAIL_API_KEY;
  const inboxId = process.env.AGENTMAIL_INBOX_ID;
  if (!apiKey || !inboxId) {
    console.log('NO_REPLY');
    return;
  }

  const allowed = new Set(['trjim2k5@gmail.com', 'dim.triant@gmail.com']);
  const sinceMs = Date.now() - 60 * 60 * 1000;

  try {
    const client = new AgentMailClient({ apiKey });
    const resp = await client.inboxes.messages.list(inboxId, { limit: 25 });
    const messages = resp?.messages || [];

    const inbound = messages.filter((m) => {
      const ts = new Date(m.createdAt || m.receivedAt || m.updatedAt || m.sentAt || 0).getTime();
      const from = (m.from && m.from.email) || (Array.isArray(m.from) && m.from[0]?.email) || '';
      return from && ts >= sinceMs;
    });

    if (!inbound.length) {
      console.log('NO_REPLY');
      return;
    }

    const lines = inbound.slice(0, 5).map((m) => {
      const from = (m.from && m.from.email) || (Array.isArray(m.from) && m.from[0]?.email) || 'unknown';
      const subject = m.subject || '(no subject)';
      const tsRaw = m.createdAt || m.receivedAt || m.updatedAt || m.sentAt || '';
      const t = tsRaw ? new Date(tsRaw).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : 'unknown time';
      const flag = allowed.has(from.toLowerCase()) ? '' : ' ⚠️ non-allowlisted sender';
      return `• ${from} — ${subject} — ${t}${flag}`;
    });

    console.log(`You have ${inbound.length} new AgentMail message(s) in the last hour:\n${lines.join('\n')}`);
  } catch (e) {
    console.log('NO_REPLY');
  }
})();
