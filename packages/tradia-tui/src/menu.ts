import * as readline from 'readline';
import { isFirstRun } from './lib/credentials.js';
import { formatDisclaimer, formatHomeMenu } from './lib/format.js';
import { getProviderStatus } from './market-intelligence/index.js';
import { runWelcomeSetup } from './commands/setup.js';
import {
  runBrief,
  runConfig,
  runCongress,
  runConfluence,
  runDarkPool,
  runFlow,
  runInsider,
  runTicker,
} from './commands.js';

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

async function promptSymbol(rl: readline.Interface): Promise<string | null> {
  const symbol = await ask(rl, 'Enter ticker symbol (e.g. NVDA): ');
  return symbol || null;
}

export async function runInteractive(): Promise<void> {
  if (await isFirstRun()) {
    const shouldContinue = await runWelcomeSetup();
    if (!shouldContinue) {
      return;
    }
  }

  const rl = createInterface();
  const status = await getProviderStatus();

  console.log(formatDisclaimer());
  if (status.message) {
    console.log(status.message);
  }
  console.log(formatHomeMenu());

  try {
    while (true) {
      const choice = await ask(rl, '\nSelect option (1-9): ');

      try {
        let output: string | null = null;

        switch (choice) {
          case '1':
            output = await runBrief();
            break;
          case '2': {
            const symbol = await promptSymbol(rl);
            if (!symbol) {
              console.log('Symbol required.');
              break;
            }
            output = await runTicker(symbol);
            break;
          }
          case '3': {
            const symbol = await promptSymbol(rl);
            if (!symbol) {
              console.log('Symbol required.');
              break;
            }
            output = await runFlow(symbol);
            break;
          }
          case '4': {
            const symbol = await promptSymbol(rl);
            if (!symbol) {
              console.log('Symbol required.');
              break;
            }
            output = await runDarkPool(symbol);
            break;
          }
          case '5': {
            const symbol = await promptSymbol(rl);
            if (!symbol) {
              console.log('Symbol required.');
              break;
            }
            output = await runCongress(symbol);
            break;
          }
          case '6': {
            const symbol = await promptSymbol(rl);
            if (!symbol) {
              console.log('Symbol required.');
              break;
            }
            output = await runInsider(symbol);
            break;
          }
          case '7': {
            const symbol = await promptSymbol(rl);
            if (!symbol) {
              console.log('Symbol required.');
              break;
            }
            const dir = await ask(rl, 'Direction (bullish/bearish, optional): ');
            const direction =
              dir === 'bullish' || dir === 'bearish' ? dir : undefined;
            output = await runConfluence(symbol, direction);
            break;
          }
          case '8':
            output = await runConfig();
            break;
          case '9':
            console.log('Goodbye.');
            return;
          default:
            console.log('Invalid option. Enter 1-9.');
        }

        if (output) {
          console.log(output);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${message}`);
      }
    }
  } finally {
    rl.close();
  }
}