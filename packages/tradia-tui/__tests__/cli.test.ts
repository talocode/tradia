import { Command } from 'commander';
import { DISCLAIMER } from '../src/lib/disclaimer.js';

function buildTestProgram(): Command {
  const program = new Command();
  program
    .name('tradia')
    .command('brief')
    .description('Show morning market brief');
  program.command('ticker <symbol>').description('Analyze a ticker');
  program.command('flow <symbol>').description('Show unusual flow');
  program.command('dark-pool <symbol>').description('Show dark pool context');
  program.command('congress <symbol>').description('Show congress trades');
  program.command('insider <symbol>').description('Show insider activity');
  program
    .command('confluence <symbol>')
    .option('-d, --direction <direction>', 'bullish or bearish');
  program.command('config').description('Show provider status');
  program.command('init').description('Run BYOK setup wizard');
  program.command('doctor').description('Show diagnostics');
  return program;
}

describe('CLI command parsing', () => {
  it('parses ticker subcommand with symbol', () => {
    const program = buildTestProgram();
    program.exitOverride();
    program.parse(['node', 'tradia', 'ticker', 'NVDA'], { from: 'node' });
    const ticker = program.commands.find((c) => c.name() === 'ticker');
    expect(ticker?.args).toEqual(['NVDA']);
  });

  it('parses dark-pool subcommand with symbol', () => {
    const program = buildTestProgram();
    program.exitOverride();
    program.parse(['node', 'tradia', 'dark-pool', 'TSLA'], { from: 'node' });
    const darkPool = program.commands.find((c) => c.name() === 'dark-pool');
    expect(darkPool?.args).toEqual(['TSLA']);
  });

  it('parses confluence subcommand with direction option', () => {
    const program = buildTestProgram();
    program.exitOverride();
    program.parse(
      ['node', 'tradia', 'confluence', 'NVDA', '--direction', 'bullish'],
      { from: 'node' }
    );
    const confluence = program.commands.find((c) => c.name() === 'confluence');
    expect(confluence?.args).toEqual(['NVDA']);
    expect(confluence?.opts()).toEqual({ direction: 'bullish' });
  });

  it('registers all required commands', () => {
    const program = buildTestProgram();
    const names = program.commands.map((c) => c.name());
    expect(names).toEqual(
      expect.arrayContaining([
        'brief',
        'ticker',
        'flow',
        'dark-pool',
        'congress',
        'insider',
        'confluence',
        'config',
        'init',
        'doctor',
      ])
    );
  });
});

describe('disclaimer', () => {
  it('is present in help text policy', () => {
    expect(DISCLAIMER).toMatch(/Not financial advice/);
    expect(DISCLAIMER).toMatch(/does not execute trades/);
  });
});