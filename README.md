<!-- GENERATED FILE: edit data/tools.yml, data/categories.yml, data/tags.yml, then run npm run generate. -->

# Awesome AI Devtools

A structured directory of AI tools for developers: coding agents, MCP, browser agents, agent skills, evals, observability, security, and self-hosted workflows.

## Why this exists

AI developer tooling changes quickly. This repository keeps tool entries in structured metadata so listings can be validated, sorted, generated, reviewed, and later filtered without turning the README into the source of truth.

The goal is not fake completeness or rankings. The goal is a useful, maintainable map of the AI developer tooling ecosystem.

## Quick navigation

- 8 seed tools
- 20 categories
- 16 tags
- [Comparison matrix](#comparison-matrix)
- [Categories](#categories)
- [Submit a tool](#submit-a-tool)

## Comparison matrix

| Tool | Categories | Interfaces | Deployment | Source model | License |
| --- | --- | --- | --- | --- | --- |
| Claude Code | Coding agents, Terminal agents | cli | hybrid | proprietary | unknown |
| Cline | Browser agents, Coding agents, IDE assistants | browser, cli, ide | hybrid | open-source | Apache-2.0 |
| Continue | AI code review tools, IDE assistants, Repo automation tools | cli, ide | hybrid | open-source | Apache-2.0 |
| Cursor | Coding agents, IDE assistants | cli, desktop, ide | hybrid | proprietary | unknown |
| GitHub Copilot | AI code review tools, IDE assistants | github-app, ide, web | hosted | proprietary | unknown |
| Langfuse | Agent evals, Agent observability, Self-hosted AI dev stacks | api, web | hybrid | open-source | MIT except enterprise folders |
| MCP Inspector | MCP tooling | cli, mcp, web | local | open-source | unknown |
| OpenAI Codex CLI | Coding agents, Terminal agents | cli | hybrid | open-source | Apache-2.0 |

## Categories

### Coding agents

Agentic tools that can inspect, modify, and reason about source code.

- [Claude Code](https://code.claude.com/docs/en/setup) - Anthropic coding agent for terminal workflows that can read code, edit files, run commands, and use project context. _[website](https://code.claude.com/docs/en/setup) | [docs](https://code.claude.com/docs/en/setup)_

- [Cline](https://docs.cline.bot/introduction/overview) - Open-source coding agent for editor workflows with file edits, terminal commands, browser use, and MCP-based tool extension. _[website](https://docs.cline.bot/introduction/overview) | [repo](https://github.com/cline/cline) | [docs](https://docs.cline.bot/introduction/overview)_

- [Cursor](https://cursor.com/) - AI code editor built around chat, codebase context, agents, rules, MCP, and terminal-assisted development workflows. _[website](https://cursor.com/) | [docs](https://cursor.com/docs)_

- [OpenAI Codex CLI](https://github.com/openai/codex) - Local terminal coding agent from OpenAI that can inspect code, edit files, and run commands in a developer workspace. _[website](https://github.com/openai/codex) | [repo](https://github.com/openai/codex) | [docs](https://developers.openai.com/codex/cli/)_

### Terminal agents

AI developer tools primarily operated from a command-line interface.

- [Claude Code](https://code.claude.com/docs/en/setup) - Anthropic coding agent for terminal workflows that can read code, edit files, run commands, and use project context. _[website](https://code.claude.com/docs/en/setup) | [docs](https://code.claude.com/docs/en/setup)_

- [OpenAI Codex CLI](https://github.com/openai/codex) - Local terminal coding agent from OpenAI that can inspect code, edit files, and run commands in a developer workspace. _[website](https://github.com/openai/codex) | [repo](https://github.com/openai/codex) | [docs](https://developers.openai.com/codex/cli/)_

### IDE assistants

AI assistants embedded in editors or IDEs for coding workflows.

- [Cline](https://docs.cline.bot/introduction/overview) - Open-source coding agent for editor workflows with file edits, terminal commands, browser use, and MCP-based tool extension. _[website](https://docs.cline.bot/introduction/overview) | [repo](https://github.com/cline/cline) | [docs](https://docs.cline.bot/introduction/overview)_

- [Continue](https://docs.continue.dev/) - Open-source AI code assistant and CLI for IDE agents, source-controlled checks, and customizable development workflows. _[website](https://docs.continue.dev/) | [repo](https://github.com/continuedev/continue) | [docs](https://docs.continue.dev/)_

- [Cursor](https://cursor.com/) - AI code editor built around chat, codebase context, agents, rules, MCP, and terminal-assisted development workflows. _[website](https://cursor.com/) | [docs](https://cursor.com/docs)_

- [GitHub Copilot](https://github.com/features/copilot) - GitHub AI coding assistant for IDEs and GitHub workflows, including code suggestions, chat, and pull request support. _[website](https://github.com/features/copilot) | [docs](https://docs.github.com/en/copilot/overview-of-github-copilot/about-github-copilot)_

### Browser agents

Tools that can inspect, drive, or test browser-based developer workflows.

- [Cline](https://docs.cline.bot/introduction/overview) - Open-source coding agent for editor workflows with file edits, terminal commands, browser use, and MCP-based tool extension. _[website](https://docs.cline.bot/introduction/overview) | [repo](https://github.com/cline/cline) | [docs](https://docs.cline.bot/introduction/overview)_

### MCP tooling

Developer tools for building, testing, debugging, or managing MCP systems.

- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) - Official visual and command-line testing tool for developing, inspecting, and debugging Model Context Protocol servers. _[website](https://modelcontextprotocol.io/docs/tools/inspector) | [repo](https://github.com/modelcontextprotocol/inspector) | [docs](https://modelcontextprotocol.io/docs/tools/inspector)_

### Agent observability

Tools for tracing, monitoring, and debugging agent or LLM application behavior.

- [Langfuse](https://langfuse.com/docs) - Open-source LLM engineering platform for observability, tracing, prompt management, datasets, and evaluations. _[website](https://langfuse.com/docs) | [repo](https://github.com/langfuse/langfuse) | [docs](https://langfuse.com/docs)_

### Agent evals

Evaluation frameworks and systems for agents, LLM apps, and developer workflows.

- [Langfuse](https://langfuse.com/docs) - Open-source LLM engineering platform for observability, tracing, prompt management, datasets, and evaluations. _[website](https://langfuse.com/docs) | [repo](https://github.com/langfuse/langfuse) | [docs](https://langfuse.com/docs)_

### Self-hosted AI dev stacks

Self-hostable platforms and infrastructure for AI developer workflows.

- [Langfuse](https://langfuse.com/docs) - Open-source LLM engineering platform for observability, tracing, prompt management, datasets, and evaluations. _[website](https://langfuse.com/docs) | [repo](https://github.com/langfuse/langfuse) | [docs](https://langfuse.com/docs)_

### Repo automation tools

AI tools that automate repository checks, changes, pull requests, or maintenance.

- [Continue](https://docs.continue.dev/) - Open-source AI code assistant and CLI for IDE agents, source-controlled checks, and customizable development workflows. _[website](https://docs.continue.dev/) | [repo](https://github.com/continuedev/continue) | [docs](https://docs.continue.dev/)_

### AI code review tools

AI-assisted tools for reviewing changes, pull requests, and code quality.

- [Continue](https://docs.continue.dev/) - Open-source AI code assistant and CLI for IDE agents, source-controlled checks, and customizable development workflows. _[website](https://docs.continue.dev/) | [repo](https://github.com/continuedev/continue) | [docs](https://docs.continue.dev/)_

- [GitHub Copilot](https://github.com/features/copilot) - GitHub AI coding assistant for IDEs and GitHub workflows, including code suggestions, chat, and pull request support. _[website](https://github.com/features/copilot) | [docs](https://docs.github.com/en/copilot/overview-of-github-copilot/about-github-copilot)_

### MCP servers

Model Context Protocol servers that expose tools, resources, or prompts.

_No seed entries yet._

### MCP clients

Applications and agents that connect to Model Context Protocol servers.

_No seed entries yet._

### Agent skill packs

Reusable instruction, workflow, or capability packs for coding agents.

_No seed entries yet._

### Prompt and workflow libraries

Collections of prompts, rules, playbooks, or reusable AI developer workflows.

_No seed entries yet._

### AI devtools security

Security tools and guidance for AI-assisted software development systems.

_No seed entries yet._

### Local LLM developer tools

Tools that help developers run or integrate local models in coding workflows.

_No seed entries yet._

### Data and ML coding assistants

AI coding tools focused on data, notebooks, machine learning, or analytics workflows.

_No seed entries yet._

### Documentation agents

AI tools that generate, maintain, or reason over developer documentation.

_No seed entries yet._

### Test generation agents

AI tools that create, improve, or maintain automated tests.

_No seed entries yet._

### DevOps and SRE agents

AI tools for infrastructure, deployment, operations, and reliability workflows.

_No seed entries yet._

## Recently added

- 2026-05-07: [Claude Code](https://code.claude.com/docs/en/setup)
- 2026-05-07: [Cline](https://docs.cline.bot/introduction/overview)
- 2026-05-07: [Continue](https://docs.continue.dev/)
- 2026-05-07: [Cursor](https://cursor.com/)
- 2026-05-07: [GitHub Copilot](https://github.com/features/copilot)

## Submit a tool

Add or update one tool by editing `data/tools.yml`, then run:

```bash
npm run sort
npm run generate
npm test
```

Use official sources, keep descriptions factual, and leave uncertain metadata as `unknown` instead of guessing. See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/submission-guide.md](docs/submission-guide.md).

## Roadmap

- Keep the metadata schema small and strict.
- Add contribution-friendly seed coverage category by category.
- Build generated filters and richer comparison views after the data model settles.
- Design a future importer after the schema, validator, and generator have real usage.

