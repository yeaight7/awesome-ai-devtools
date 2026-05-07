<!-- GENERATED FILE: edit data/tools.yml, data/categories.yml, data/tags.yml, then run npm run generate. -->

# Awesome AI Devtools

A structured directory of AI tools for developers: coding agents, MCP, browser agents, agent skills, evals, observability, security, and self-hosted workflows.

## Why this exists

AI developer tooling changes quickly. This repository keeps tool entries in structured metadata so listings can be validated, sorted, generated, reviewed, and later filtered without turning the README into the source of truth.

The goal is not fake completeness or rankings. The goal is a useful, maintainable map of the AI developer tooling ecosystem.

## Quick navigation

- 27 seed tools
- 20 categories
- 16 tags
- [Comparison matrix](#comparison-matrix)
- [Categories](#categories)
- [Submit a tool](#submit-a-tool)

## Comparison matrix

| Tool | Categories | Interfaces | Deployment | Source model | License | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Aider | Coding agents | cli | local | unknown | Apache-2.0 | draft |
| Amazon Q Developer | Coding agents | cli, github-app, ide-extension | hybrid | unknown | unknown | draft |
| Amp | Coding agents | api, cli | hybrid | unknown | unknown | draft |
| Augment Code | Coding agents | cli, ide-extension | hybrid | unknown | unknown | draft |
| Bito AI Code Review Agent | Coding agents | github-app | cloud | unknown | unknown | draft |
| Claude Code | Coding agents, Terminal agents | cli | hybrid | proprietary | unknown | reviewed |
| Cline | Browser agents, Coding agents, IDE assistants | browser, cli, ide | hybrid | open-source | Apache-2.0 | reviewed |
| CodeRabbit | Coding agents | cli, github-app, ide-extension | hybrid | unknown | unknown | draft |
| Continue | AI code review tools, IDE assistants, Repo automation tools | cli, ide | hybrid | open-source | Apache-2.0 | reviewed |
| Cursor | Coding agents, IDE assistants | cli, desktop, ide | hybrid | proprietary | unknown | reviewed |
| Factory Droid | Coding agents | api, cli, desktop-app | hybrid | unknown | unknown | draft |
| Gemini CLI | Coding agents | cli, mcp-client | local | unknown | Apache-2.0 | draft |
| Gemini Code Assist | Coding agents | github-app, ide-extension | cloud | unknown | unknown | draft |
| GitHub Copilot | AI code review tools, IDE assistants | github-app, ide, web | hosted | proprietary | unknown | reviewed |
| Junie | Coding agents | cli, ide-extension | hybrid | unknown | unknown | draft |
| Langfuse | Agent evals, Agent observability, Self-hosted AI dev stacks | api, web | hybrid | open-source | MIT except enterprise folders | reviewed |
| MCP Inspector | MCP tooling | cli, mcp, web | local | open-source | unknown | reviewed |
| OpenAI Codex CLI | Coding agents, Terminal agents | cli | hybrid | open-source | Apache-2.0 | reviewed |
| OpenCode | Coding agents | cli, desktop-app, github-app, ide-extension, mcp-client | local | unknown | MIT | draft |
| Qodo | Coding agents | github-app, ide-extension | cloud | unknown | unknown | draft |
| Qwen Code | Coding agents | cli | local | unknown | Apache-2.0 | draft |
| Refact.ai | Coding agents | ide-extension, web-app | hybrid | unknown | unknown | draft |
| Roo Code | Coding agents | cli, ide-extension, web-app | hybrid | unknown | Apache-2.0 | draft |
| Sweep | Coding agents | ide-extension | hybrid | unknown | unknown | draft |
| Tabby | Coding agents | api, ide-extension | self-hosted | unknown | unknown | draft |
| Windsurf Editor | Coding agents | desktop-app | hybrid | unknown | unknown | draft |
| Zed | Coding agents | desktop-app, mcp-client | local | unknown | unknown | draft |

## Categories

### Coding agents

Agentic tools that can inspect, modify, and reason about source code.

- [Aider](https://aider.chat/) - Open-source terminal pair programmer that edits tracked files in a local Git repository. _[website](https://aider.chat/) | [repo](https://github.com/Aider-AI/aider) | [docs](https://aider.chat/docs/)_

- [Amazon Q Developer](https://aws.amazon.com/q/developer/) - AWS coding assistant with IDE, CLI, and GitHub agents for coding, testing, review, and transformations. _[website](https://aws.amazon.com/q/developer/) | [docs](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/what-is.html)_

- [Amp](https://ampcode.com/) - Terminal-centric coding agent with deep codebase context, editor links, and automation-oriented SDK features. _[website](https://ampcode.com/) | [docs](https://ampcode.com/manual)_

- [Augment Code](https://www.augmentcode.com/) - Repo-aware coding agent for editors and terminal that edits files, uses tools, and understands large codebases. _[website](https://www.augmentcode.com/) | [docs](https://docs.augmentcode.com/introduction)_

- [Bito AI Code Review Agent](https://bito.ai/product/ai-code-review-agent/) - Repository review agent for GitHub, GitLab, and Bitbucket pull or merge request workflows. _[website](https://bito.ai/product/ai-code-review-agent/) | [docs](https://docs.bito.ai/ai-code-reviews-in-git/install-run-using-bito-cloud/guide-for-github)_

- [Claude Code](https://code.claude.com/docs/en/setup) - Anthropic coding agent for terminal workflows that can read code, edit files, run commands, and use project context. _[website](https://code.claude.com/docs/en/setup) | [docs](https://code.claude.com/docs/en/setup)_

- [Cline](https://docs.cline.bot/introduction/overview) - Open-source coding agent for editor workflows with file edits, terminal commands, browser use, and MCP-based tool extension. _[website](https://docs.cline.bot/introduction/overview) | [repo](https://github.com/cline/cline) | [docs](https://docs.cline.bot/introduction/overview)_

- [CodeRabbit](https://coderabbit.ai/) - AI code review agent for pull requests, local IDE review, and terminal-based review workflows. _[website](https://coderabbit.ai/) | [docs](https://docs.coderabbit.ai/)_

- [Cursor](https://cursor.com/) - AI code editor built around chat, codebase context, agents, rules, MCP, and terminal-assisted development workflows. _[website](https://cursor.com/) | [docs](https://cursor.com/docs)_

- [Factory Droid](https://factory.ai/) - Coding agent platform with CLI, desktop, and headless automation for code changes, review, and CI workflows. _[website](https://factory.ai/) | [docs](https://docs.factory.ai/welcome)_

- [Gemini CLI](https://developers.google.com/gemini-code-assist/docs/gemini-cli) - Open-source terminal coding agent that uses tool calls and MCP servers to work on repository tasks. _[website](https://developers.google.com/gemini-code-assist/docs/gemini-cli) | [repo](https://github.com/google-gemini/gemini-cli) | [docs](https://developers.google.com/gemini-code-assist/docs/gemini-cli)_

- [Gemini Code Assist](https://developers.google.com/gemini-code-assist) - Google's coding assistant for IDEs and GitHub with agent mode, PR summaries, and code review. _[website](https://developers.google.com/gemini-code-assist) | [docs](https://developers.google.com/gemini-code-assist/docs/overview)_

- [Junie](https://www.jetbrains.com/junie/) - JetBrains coding agent for IDEs and terminal that plans, edits, tests, and reviews project changes. _[website](https://www.jetbrains.com/junie/) | [repo](https://github.com/JetBrains/junie) | [docs](https://www.jetbrains.com/help/ai-assistant/junie-agent.html)_

- [OpenAI Codex CLI](https://github.com/openai/codex) - Local terminal coding agent from OpenAI that can inspect code, edit files, and run commands in a developer workspace. _[website](https://github.com/openai/codex) | [repo](https://github.com/openai/codex) | [docs](https://developers.openai.com/codex/cli/)_

- [OpenCode](https://opencode.ai/) - Open-source AI coding agent for terminal, desktop, IDE, and GitHub repository workflows. _[website](https://opencode.ai/) | [repo](https://github.com/anomalyco/opencode) | [docs](https://opencode.ai/docs/)_

- [Qodo](https://www.qodo.ai/) - Code review and IDE assistant product focused on reviewing diffs, tests, and repository context. _[website](https://www.qodo.ai/) | [docs](https://docs.qodo.ai/)_

- [Qwen Code](https://qwen.ai/) - Open-source terminal coding agent optimized for Qwen models and large repository tasks. _[website](https://qwen.ai/) | [repo](https://github.com/QwenLM/qwen-code)_

- [Refact.ai](https://refact.ai/) - Coding agent for IDEs and enterprises that can automate coding, debugging, testing, and documentation tasks. _[website](https://refact.ai/) | [docs](https://docs.refact.ai/)_

- [Roo Code](https://roocode.com/) - Open-source coding agent for VS Code and cloud agents that can code, review, and automate repository tasks. _[website](https://roocode.com/) | [repo](https://github.com/RooCodeInc/Roo-Code) | [docs](https://docs.roocode.com/)_

- [Sweep](https://sweep.dev/) - JetBrains-focused coding assistant with agent mode, repo edits, AI code review, and MCP integration. _[website](https://sweep.dev/) | [docs](https://docs.sweep.dev/)_

- [Tabby](https://www.tabbyml.com/) - Self-hosted AI coding assistant for teams that want private code assistance and repository-aware development. _[website](https://www.tabbyml.com/) | [repo](https://github.com/TabbyML/tabby) | [docs](https://tabby.tabbyml.com/docs/)_

- [Windsurf Editor](https://windsurf.com/) - AI code editor with repo-aware agent workflows for multi-file edits and developer automation. _[website](https://windsurf.com/) | [docs](https://docs.windsurf.com/)_

- [Zed](https://zed.dev/) - Code editor with built-in agent workflows, external agent support, and MCP-connected coding assistance. _[website](https://zed.dev/) | [repo](https://github.com/zed-industries/zed) | [docs](https://zed.dev/releases/stable/0.233.5)_

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

- 2026-05-07: [Aider](https://aider.chat/)
- 2026-05-07: [Amazon Q Developer](https://aws.amazon.com/q/developer/)
- 2026-05-07: [Amp](https://ampcode.com/)
- 2026-05-07: [Augment Code](https://www.augmentcode.com/)
- 2026-05-07: [Bito AI Code Review Agent](https://bito.ai/product/ai-code-review-agent/)

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

