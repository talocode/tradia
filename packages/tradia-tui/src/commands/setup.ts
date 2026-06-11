import * as readline from 'readline';
import { resetCredentialsCache, resolveCredentials } from '../lib/credentials.js';
import {
  clearApiKey,
  getConfigPath,
  saveConfig,
  setApiKey,
  setProvider,
  toPublicConfig,
  loadConfig,
} from '../lib/config.js';
import { containsFullApiKey, maskApiKey } from '../lib/key-mask.js';
import {
  API_KEY_HELP,
  LOCAL_KEY_WARNING,
  WELCOME_MESSAGE,
} from '../lib/setup-messages.js';
import { formatDoctor, formatProviderStatus, formatWelcomeMenu } from '../lib/format.js';
import { getProviderStatus } from '../market-intelligence/index.js';
import { PACKAGE_VERSION } from '../lib/version.js';

function createInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl: readline.Interface, prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

async function promptHidden(rl: readline.Interface, prompt: string): Promise<string> {
  return ask(rl, prompt);
}

export async function runInit(): Promise<string> {
  const rl = createInterface();
  try {
    console.log(WELCOME_MESSAGE);
    console.log('');
    const choice = await ask(
      rl,
      'Choose: 1) Mock mode  2) Add Unusual Whales API key  3) Setup instructions  4) Cancel: '
    );

    switch (choice) {
      case '1': {
        await setProvider('mock');
        resetCredentialsCache();
        return 'Configured for mock mode. Run `tradia brief` to try it.';
      }
      case '2': {
        const key = await promptHidden(rl, 'Paste your Unusual Whales API key: ');
        if (!key) {
          throw new Error('API key is required to continue setup.');
        }
        await setApiKey(key);
        await setProvider('unusual_whales');
        resetCredentialsCache();
        return [
          'Unusual Whales API key saved locally.',
          LOCAL_KEY_WARNING,
          `Config: ${getConfigPath()}`,
          `Key: ${maskApiKey(key)}`,
        ].join('\n');
      }
      case '3':
        return API_KEY_HELP;
      case '4':
        return 'Setup cancelled.';
      default:
        throw new Error('Invalid option. Run `tradia init` to try again.');
    }
  } finally {
    rl.close();
  }
}

export async function runDoctor(): Promise<string> {
  const creds = await resolveCredentials();
  const config = await loadConfig();
  const maskedKey = maskApiKey(creds.apiKey);

  return formatDoctor({
    version: PACKAGE_VERSION,
    provider: creds.provider,
    configuredProvider: creds.configuredProvider,
    apiKeyConfigured: Boolean(creds.apiKey),
    keySource: creds.keySource,
    configPath: creds.configPath,
    mockMode: creds.mockMode,
    maskedKey,
    hasConfigFile: Boolean(config),
  });
}

export async function runConfigStatus(): Promise<string> {
  const status = await getProviderStatus();
  const creds = await resolveCredentials();
  return formatProviderStatus(status, maskApiKey(creds.apiKey));
}

export async function runSetKey(apiKey?: string): Promise<string> {
  let key = apiKey?.trim();
  if (!key) {
    const rl = createInterface();
    try {
      key = await promptHidden(rl, 'Paste your Unusual Whales API key: ');
    } finally {
      rl.close();
    }
  }

  if (!key) {
    throw new Error('API key is required.');
  }

  await setApiKey(key);
  await setProvider('unusual_whales');
  resetCredentialsCache();

  return [
    'API key saved locally.',
    LOCAL_KEY_WARNING,
    `Config: ${getConfigPath()}`,
    `Key: ${maskApiKey(key)}`,
  ].join('\n');
}

export async function runClearKey(): Promise<string> {
  const existing = await loadConfig();
  const previousKey = existing?.unusualWhalesApiKey;
  await clearApiKey();
  resetCredentialsCache();
  const output = 'API key removed from local config.';
  if (previousKey && output.includes(previousKey)) {
    throw new Error('Unexpected key leak in clear-key output.');
  }
  return output;
}

export async function runSetProvider(providerArg: string): Promise<string> {
  const provider = providerArg === 'unusual_whales' ? 'unusual_whales' : 'mock';
  const saved = await setProvider(provider);
  resetCredentialsCache();
  return `Provider set to ${saved.provider}. Config: ${getConfigPath()}`;
}

export async function runConfigShow(): Promise<string> {
  const config = await loadConfig();
  const creds = await resolveCredentials();
  const lines = [
    ...(await runConfigStatus()).split('\n'),
    '',
    'Local config:',
    config ? JSON.stringify(toPublicConfig(config), null, 2) : '(not created)',
    creds.apiKey ? `Masked key: ${maskApiKey(creds.apiKey)}` : 'Masked key: (not set)',
  ];
  const joined = lines.join('\n');
  if (containsFullApiKey(joined, creds.apiKey)) {
    throw new Error('Config output leaked full API key.');
  }
  return joined;
}

export async function runWelcomeSetup(): Promise<boolean> {
  const rl = createInterface();
  try {
    console.log(WELCOME_MESSAGE);
    console.log(formatWelcomeMenu());

    const choice = await ask(rl, '\nSelect option (1-4): ');
    switch (choice) {
      case '1': {
        await setProvider('mock');
        resetCredentialsCache();
        console.log('Continuing in mock mode.');
        return true;
      }
      case '2': {
        const key = await promptHidden(rl, 'Paste your Unusual Whales API key: ');
        if (!key) {
          console.log('API key required.');
          return false;
        }
        await setApiKey(key);
        await setProvider('unusual_whales');
        resetCredentialsCache();
        console.log(LOCAL_KEY_WARNING);
        console.log(`Saved to ${getConfigPath()}`);
        return true;
      }
      case '3':
        console.log(API_KEY_HELP);
        return false;
      case '4':
        console.log('Goodbye.');
        return false;
      default:
        console.log('Invalid option. Enter 1-4.');
        return false;
    }
  } finally {
    rl.close();
  }
}