import { Command } from 'commander';
import { APP_NAME, APP_TAGLINE, DISCLAIMER } from './lib/disclaimer.js';
import { loadEnvironment } from './lib/env.js';
import { PACKAGE_VERSION } from './lib/version.js';
import { runInteractive } from './menu.js';
import {
  runBrief,
  runCongress,
  runConfluence,
  runDarkPool,
  runFlow,
  runInsider,
  runTicker,
} from './commands.js';
import {
  runClearKey,
  runConfigShow,
  runConfigStatus,
  runDoctor,
  runInit,
  runSetKey,
  runSetProvider,
} from './commands/setup.js';

loadEnvironment();

const program = new Command();

program
  .name('tradia')
  .description(`${APP_NAME} — ${APP_TAGLINE}`)
  .addHelpText('after', `\n${DISCLAIMER}\n`)
  .version(PACKAGE_VERSION);

program
  .command('init')
  .description('Run BYOK setup wizard')
  .action(async () => {
    console.log(await runInit());
  });

program
  .command('doctor')
  .description('Show environment and configuration diagnostics')
  .action(async () => {
    console.log(await runDoctor());
  });

const configCmd = program
  .command('config')
  .description('Show or manage local configuration');

configCmd
  .command('status')
  .description('Show provider configuration status')
  .action(async () => {
    console.log(await runConfigStatus());
  });

configCmd
  .command('set-key')
  .description('Store your Unusual Whales API key locally')
  .option('--key <key>', 'API key value')
  .action(async (options: { key?: string }) => {
    console.log(await runSetKey(options.key));
  });

configCmd
  .command('clear-key')
  .description('Remove stored API key from local config')
  .action(async () => {
    console.log(await runClearKey());
  });

configCmd
  .command('provider')
  .description('Set market intelligence provider')
  .argument('<name>', 'mock or unusual_whales')
  .action(async (name: string) => {
    if (name !== 'mock' && name !== 'unusual_whales') {
      throw new Error('Provider must be mock or unusual_whales');
    }
    console.log(await runSetProvider(name));
  });

configCmd.action(async () => {
  console.log(await runConfigShow());
});

program
  .command('brief', { isDefault: false })
  .description('Show morning market brief')
  .action(async () => {
    console.log(await runBrief());
  });

program
  .command('ticker <symbol>')
  .description('Analyze a ticker')
  .action(async (symbol: string) => {
    console.log(await runTicker(symbol));
  });

program
  .command('flow <symbol>')
  .description('Show unusual options flow for a ticker')
  .action(async (symbol: string) => {
    console.log(await runFlow(symbol));
  });

program
  .command('dark-pool <symbol>')
  .description('Show dark pool context for a ticker')
  .action(async (symbol: string) => {
    console.log(await runDarkPool(symbol));
  });

program
  .command('congress <symbol>')
  .description('Show congressional trades for a ticker')
  .action(async (symbol: string) => {
    console.log(await runCongress(symbol));
  });

program
  .command('insider <symbol>')
  .description('Show insider activity for a ticker')
  .action(async (symbol: string) => {
    console.log(await runInsider(symbol));
  });

program
  .command('confluence <symbol>')
  .description('Show bullish/bearish confluence for a ticker')
  .option('-d, --direction <direction>', 'bullish or bearish')
  .action(async (symbol: string, options: { direction?: string }) => {
    const direction =
      options.direction === 'bullish' || options.direction === 'bearish'
        ? options.direction
        : undefined;
    console.log(await runConfluence(symbol, direction));
  });

program.action(async () => {
  await runInteractive();
});

export async function main(): Promise<void> {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}