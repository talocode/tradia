# TradiaAI Marketing Skills Usage Guide

This project has been configured with the **Marketing Skills Pack** to assist AI coding agents (Gemini, Codex, Claude, etc.) in performing structured marketing tasks.

## Installation Details

- **Source:** [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)
- **Location:** `.agents/skills/`
- **Context File:** `.agents/product-marketing-context.md`

## What was installed

A pack of 41 specialized marketing skills covering:
- **Conversion Rate Optimization (CRO):** `page-cro`, `onboarding-cro`, `form-cro`.
- **Copywriting:** `copywriting`, `copy-editing`, `email-sequence`.
- **Strategy:** `launch-strategy`, `pricing-strategy`, `content-strategy`.
- **SEO:** `ai-seo`, `programmatic-seo`, `seo-audit`.
- **Research:** `customer-research`, `competitor-profiling`.

## How to use these skills

When interacting with an AI agent in this repository, you can ask it to use a specific skill. The agent will automatically reference the product context stored in `.agents/product-marketing-context.md` to ensure all output is aligned with TradiaAI's positioning.

### Example Prompts

#### Landing Page & CRO
> "Use the **page-cro** skill to audit the TradiaAI landing page for prop firm Forex traders."

#### Copywriting
> "Use the **copywriting** skill to rewrite the TradiaAI homepage hero section for higher conversion."

#### Pricing Strategy
> "Use the **pricing-strategy** skill to improve TradiaAI pricing for prop firm Forex traders."

#### Launch & Social
> "Use the **launch-strategy** skill to create a launch plan for TradiaAI on X."

#### SEO
> "Use the **seo-audit** skill to suggest programmatic SEO pages for 'AI trading journal', 'Forex trading journal', 'prop firm journal', and 'funded trader analytics' keywords."

#### Outreach
> "Use the **cold-email** skill to draft an outreach sequence for prop firm influencers."

## Updating Product Context

The foundation of these skills is the `.agents/product-marketing-context.md` file. If the product direction, target audience, or core messaging changes, update this file so the AI agents stay in sync.

You can ask an agent:
> "Use the **product-marketing-context** skill to update our positioning."
