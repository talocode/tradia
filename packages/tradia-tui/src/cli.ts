import { Command } from 'commander';
import { APP_NAME, APP_TAGLINE, DISCLAIMER } from './lib/disclaimer.js';
import { loadEnvironment } from './lib/env.js';
import { runInteractive } from './menu.js';
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

loadEnvironment();

const program = new Command();

program
  .name('tradia')
  .description(`${APP_NAME} — ${APP_TAGLINE}`)
  .addHelpText('after', `\n${DISCLAIMER}\n`)
  .version('0.1.0');

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

program
  .command('config')
  .description('Show provider configuration status')
  .action(() => {
    console.log(runConfig());
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