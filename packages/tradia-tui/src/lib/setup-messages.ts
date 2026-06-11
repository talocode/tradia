export const WELCOME_MESSAGE =
  'Welcome to TradiaAI TUI. Use mock mode now, or connect your own Unusual Whales API key for live smart-money data.';

export const LOCAL_KEY_WARNING =
  'Your key is stored locally on this machine. Do not share your ~/.tradia/config.json.';

export const MISSING_KEY_MESSAGE =
  'Unusual Whales provider selected but no API key is configured. Run `tradia init` or set UNUSUAL_WHALES_API_KEY.';

export const API_KEY_HELP = [
  'How to get an Unusual Whales API key:',
  '  1. Visit https://unusualwhales.com/settings/api-dashboard',
  '  2. Sign in or create an account',
  '  3. Create an API key in the API dashboard',
  '  4. Run `tradia init` and paste your key, or set:',
  '     export UNUSUAL_WHALES_API_KEY=your_key',
  '     export MARKET_INTELLIGENCE_PROVIDER=unusual_whales',
].join('\n');

export class SetupRequiredError extends Error {
  constructor(message = MISSING_KEY_MESSAGE) {
    super(message);
    this.name = 'SetupRequiredError';
  }
}