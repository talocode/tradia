# Tradia changelog

## [0.1.1] - BYOK setup release

Release type: Patch release

Highlights:
- Added bring-your-own-key setup flow
- Added local config support
- Added config/doctor commands
- Improved first-run onboarding
- Mock mode works without credentials
- Users can provide their own Unusual Whales API key for live data
- Fixed package version/path resolution after npm install

Security:
- No API key is bundled
- User keys stay local
- Secrets are masked in output
- No hosted app required

Install:
- `npx tradia`
- `npm install -g tradia`
- `tradia`

Live provider setup:
- `export UNUSUAL_WHALES_API_KEY=your_key`
- `export MARKET_INTELLIGENCE_PROVIDER=unusual_whales`
- `tradia brief`

Mock mode:
- `tradia config provider mock`
- `tradia brief`

## [0.1.0] - Initial terminal release

Release type: Initial release

Highlights:
- First TradiaAI terminal app
- Mock market intelligence provider
- Basic commands: brief, ticker, flow, dark-pool, congress, insider, confluence, config
- NPM binary: tradia
- Local-first terminal workflow
