<!-- GENERATED FILE: edit data/tools.yml, data/categories.yml, data/tags.yml, then run npm run generate. -->

# Awesome AI Devtools

<p align="center"><strong>The open-source map of the AI developer tooling ecosystem.</strong></p>

<p align="center">Window-shop coding agents, IDE assistants, MCP tooling, evals, observability, security, and self-hosted AI dev stacks.</p>

<p align="center"><code>27 tools</code> <code>14 active shelves</code> <code>metadata-first</code> <code>generated README</code></p>

## Why this exists

AI developer tooling changes quickly. This directory keeps entries in structured metadata so the public view can stay polished while the data remains sortable, reviewable, and validation-backed.

No rankings. No launch hype. Just a clean storefront for discovering tools worth a closer look.

## Storefront

| Shelf | What you will find | Tools |
| --- | --- | ---: |
| [Coding agents](#coding-agents) | Agentic tools that can inspect, modify, and reason about source code. | 18 |
| [Terminal agents](#terminal-agents) | AI developer tools primarily operated from a command-line interface. | 12 |
| [IDE assistants](#ide-assistants) | AI assistants embedded in editors or IDEs for coding workflows. | 17 |
| [Browser agents](#browser-agents) | Tools that can inspect, drive, or test browser-based developer workflows. | 1 |
| [MCP clients](#mcp-clients) | Applications and agents that connect to Model Context Protocol servers. | 6 |
| [MCP tooling](#mcp-tooling) | Developer tools for building, testing, debugging, or managing MCP systems. | 1 |
| [Agent observability](#agent-observability) | Tools for tracing, monitoring, and debugging agent or LLM application behavior. | 1 |
| [Agent evals](#agent-evals) | Evaluation frameworks and systems for agents, LLM apps, and developer workflows. | 1 |
| [Self-hosted AI dev stacks](#self-hosted-ai-dev-stacks) | Self-hostable platforms and infrastructure for AI developer workflows. | 3 |
| [Local LLM developer tools](#local-llm-developer-tools) | Tools that help developers run or integrate local models in coding workflows. | 1 |
| [Repo automation tools](#repo-automation-tools) | AI tools that automate repository checks, changes, pull requests, or maintenance. | 9 |
| [AI code review tools](#ai-code-review-tools) | AI-assisted tools for reviewing changes, pull requests, and code quality. | 10 |
| [Documentation agents](#documentation-agents) | AI tools that generate, maintain, or reason over developer documentation. | 1 |
| [Test generation agents](#test-generation-agents) | AI tools that create, improve, or maintain automated tests. | 4 |

## Browse The Shelves

### Coding agents

Agentic tools that can inspect, modify, and reason about source code.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [Aider](https://aider.chat/) | Open-source terminal pair programmer that edits tracked files in a local Git repository. | CLI · Local | [Website](https://aider.chat/) / [Docs](https://aider.chat/docs/) / [Repo](https://github.com/Aider-AI/aider) |
| [Amazon Q Developer](https://aws.amazon.com/q/developer/) | AWS coding assistant with IDE, CLI, and GitHub agents for coding, testing, review, and transformations. | CLI · GitHub app · IDE extension · Hybrid | [Website](https://aws.amazon.com/q/developer/) / [Docs](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/what-is.html) |
| [Amp](https://ampcode.com/) | Terminal-centric coding agent with deep codebase context, editor links, and automation-oriented SDK features. | API · CLI · Hybrid | [Website](https://ampcode.com/) / [Docs](https://ampcode.com/manual) |
| [Augment Code](https://www.augmentcode.com/) | Repo-aware coding agent for editors and terminal that edits files, uses tools, and understands large codebases. | CLI · IDE extension · Hybrid | [Website](https://www.augmentcode.com/) / [Docs](https://docs.augmentcode.com/introduction) |
| [Claude Code](https://code.claude.com/docs/en/setup) | Anthropic coding agent for terminal workflows that can read code, edit files, run commands, and use project context. | CLI · Hybrid | [Website](https://code.claude.com/docs/en/setup) / [Docs](https://code.claude.com/docs/en/setup) |
| [Cline](https://docs.cline.bot/introduction/overview) | Open-source coding agent for editor workflows with file edits, terminal commands, browser use, and MCP-based tool extension. | Browser · CLI · IDE · Hybrid | [Website](https://docs.cline.bot/introduction/overview) / [Docs](https://docs.cline.bot/introduction/overview) / [Repo](https://github.com/cline/cline) |
| [Cursor](https://cursor.com/) | AI code editor built around chat, codebase context, agents, rules, MCP, and terminal-assisted development workflows. | CLI · Desktop · IDE · Hybrid | [Website](https://cursor.com/) / [Docs](https://cursor.com/docs) |
| [Factory Droid](https://factory.ai/) | Coding agent platform with CLI, desktop, and headless automation for code changes, review, and CI workflows. | API · CLI · Desktop app · Hybrid | [Website](https://factory.ai/) / [Docs](https://docs.factory.ai/welcome) |
| [Gemini CLI](https://developers.google.com/gemini-code-assist/docs/gemini-cli) | Open-source terminal coding agent that uses tool calls and MCP servers to work on repository tasks. | CLI · MCP client · Local | [Website](https://developers.google.com/gemini-code-assist/docs/gemini-cli) / [Docs](https://developers.google.com/gemini-code-assist/docs/gemini-cli) / [Repo](https://github.com/google-gemini/gemini-cli) |
| [Gemini Code Assist](https://developers.google.com/gemini-code-assist) | Google's coding assistant for IDEs and GitHub with agent mode, PR summaries, and code review. | GitHub app · IDE extension · Cloud | [Website](https://developers.google.com/gemini-code-assist) / [Docs](https://developers.google.com/gemini-code-assist/docs/overview) |
| [Junie](https://www.jetbrains.com/junie/) | JetBrains coding agent for IDEs and terminal that plans, edits, tests, and reviews project changes. | CLI · IDE extension · Hybrid | [Website](https://www.jetbrains.com/junie/) / [Docs](https://www.jetbrains.com/help/ai-assistant/junie-agent.html) / [Repo](https://github.com/JetBrains/junie) |
| [OpenAI Codex CLI](https://github.com/openai/codex) | Local terminal coding agent from OpenAI that can inspect code, edit files, and run commands in a developer workspace. | CLI · Hybrid | [Website](https://github.com/openai/codex) / [Docs](https://developers.openai.com/codex/cli/) / [Repo](https://github.com/openai/codex) |
| [OpenCode](https://opencode.ai/) | Open-source AI coding agent for terminal, desktop, IDE, and GitHub repository workflows. | CLI · Desktop app · GitHub app · IDE extension · MCP client · Local | [Website](https://opencode.ai/) / [Docs](https://opencode.ai/docs/) / [Repo](https://github.com/anomalyco/opencode) |
| [Qwen Code](https://qwen.ai/) | Open-source terminal coding agent optimized for Qwen models and large repository tasks. | CLI · Local | [Website](https://qwen.ai/) / [Repo](https://github.com/QwenLM/qwen-code) |
| [Refact.ai](https://refact.ai/) | Coding agent for IDEs and enterprises that can automate coding, debugging, testing, and documentation tasks. | IDE extension · Web app · Hybrid | [Website](https://refact.ai/) / [Docs](https://docs.refact.ai/) |
| [Roo Code](https://roocode.com/) | Open-source coding agent for VS Code and cloud agents that can code, review, and automate repository tasks. | CLI · IDE extension · Web app · Hybrid | [Website](https://roocode.com/) / [Docs](https://docs.roocode.com/) / [Repo](https://github.com/RooCodeInc/Roo-Code) |
| [Sweep](https://sweep.dev/) | JetBrains-focused coding assistant with agent mode, repo edits, AI code review, and MCP integration. | IDE extension · Hybrid | [Website](https://sweep.dev/) / [Docs](https://docs.sweep.dev/) |
| [Windsurf Editor](https://windsurf.com/) | AI code editor with repo-aware agent workflows for multi-file edits and developer automation. | Desktop app · Hybrid | [Website](https://windsurf.com/) / [Docs](https://docs.windsurf.com/) |

### Terminal agents

AI developer tools primarily operated from a command-line interface.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [Aider](https://aider.chat/) | Open-source terminal pair programmer that edits tracked files in a local Git repository. | CLI · Local | [Website](https://aider.chat/) / [Docs](https://aider.chat/docs/) / [Repo](https://github.com/Aider-AI/aider) |
| [Amazon Q Developer](https://aws.amazon.com/q/developer/) | AWS coding assistant with IDE, CLI, and GitHub agents for coding, testing, review, and transformations. | CLI · GitHub app · IDE extension · Hybrid | [Website](https://aws.amazon.com/q/developer/) / [Docs](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/what-is.html) |
| [Amp](https://ampcode.com/) | Terminal-centric coding agent with deep codebase context, editor links, and automation-oriented SDK features. | API · CLI · Hybrid | [Website](https://ampcode.com/) / [Docs](https://ampcode.com/manual) |
| [Augment Code](https://www.augmentcode.com/) | Repo-aware coding agent for editors and terminal that edits files, uses tools, and understands large codebases. | CLI · IDE extension · Hybrid | [Website](https://www.augmentcode.com/) / [Docs](https://docs.augmentcode.com/introduction) |
| [Claude Code](https://code.claude.com/docs/en/setup) | Anthropic coding agent for terminal workflows that can read code, edit files, run commands, and use project context. | CLI · Hybrid | [Website](https://code.claude.com/docs/en/setup) / [Docs](https://code.claude.com/docs/en/setup) |
| [CodeRabbit](https://coderabbit.ai/) | AI code review agent for pull requests, local IDE review, and terminal-based review workflows. | CLI · GitHub app · IDE extension · Hybrid | [Website](https://coderabbit.ai/) / [Docs](https://docs.coderabbit.ai/) |
| [Factory Droid](https://factory.ai/) | Coding agent platform with CLI, desktop, and headless automation for code changes, review, and CI workflows. | API · CLI · Desktop app · Hybrid | [Website](https://factory.ai/) / [Docs](https://docs.factory.ai/welcome) |
| [Gemini CLI](https://developers.google.com/gemini-code-assist/docs/gemini-cli) | Open-source terminal coding agent that uses tool calls and MCP servers to work on repository tasks. | CLI · MCP client · Local | [Website](https://developers.google.com/gemini-code-assist/docs/gemini-cli) / [Docs](https://developers.google.com/gemini-code-assist/docs/gemini-cli) / [Repo](https://github.com/google-gemini/gemini-cli) |
| [Junie](https://www.jetbrains.com/junie/) | JetBrains coding agent for IDEs and terminal that plans, edits, tests, and reviews project changes. | CLI · IDE extension · Hybrid | [Website](https://www.jetbrains.com/junie/) / [Docs](https://www.jetbrains.com/help/ai-assistant/junie-agent.html) / [Repo](https://github.com/JetBrains/junie) |
| [OpenAI Codex CLI](https://github.com/openai/codex) | Local terminal coding agent from OpenAI that can inspect code, edit files, and run commands in a developer workspace. | CLI · Hybrid | [Website](https://github.com/openai/codex) / [Docs](https://developers.openai.com/codex/cli/) / [Repo](https://github.com/openai/codex) |
| [OpenCode](https://opencode.ai/) | Open-source AI coding agent for terminal, desktop, IDE, and GitHub repository workflows. | CLI · Desktop app · GitHub app · IDE extension · MCP client · Local | [Website](https://opencode.ai/) / [Docs](https://opencode.ai/docs/) / [Repo](https://github.com/anomalyco/opencode) |
| [Qwen Code](https://qwen.ai/) | Open-source terminal coding agent optimized for Qwen models and large repository tasks. | CLI · Local | [Website](https://qwen.ai/) / [Repo](https://github.com/QwenLM/qwen-code) |

### IDE assistants

AI assistants embedded in editors or IDEs for coding workflows.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [Amazon Q Developer](https://aws.amazon.com/q/developer/) | AWS coding assistant with IDE, CLI, and GitHub agents for coding, testing, review, and transformations. | CLI · GitHub app · IDE extension · Hybrid | [Website](https://aws.amazon.com/q/developer/) / [Docs](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/what-is.html) |
| [Augment Code](https://www.augmentcode.com/) | Repo-aware coding agent for editors and terminal that edits files, uses tools, and understands large codebases. | CLI · IDE extension · Hybrid | [Website](https://www.augmentcode.com/) / [Docs](https://docs.augmentcode.com/introduction) |
| [Cline](https://docs.cline.bot/introduction/overview) | Open-source coding agent for editor workflows with file edits, terminal commands, browser use, and MCP-based tool extension. | Browser · CLI · IDE · Hybrid | [Website](https://docs.cline.bot/introduction/overview) / [Docs](https://docs.cline.bot/introduction/overview) / [Repo](https://github.com/cline/cline) |
| [CodeRabbit](https://coderabbit.ai/) | AI code review agent for pull requests, local IDE review, and terminal-based review workflows. | CLI · GitHub app · IDE extension · Hybrid | [Website](https://coderabbit.ai/) / [Docs](https://docs.coderabbit.ai/) |
| [Continue](https://docs.continue.dev/) | Open-source AI code assistant and CLI for IDE agents, source-controlled checks, and customizable development workflows. | CLI · IDE · Hybrid | [Website](https://docs.continue.dev/) / [Docs](https://docs.continue.dev/) / [Repo](https://github.com/continuedev/continue) |
| [Cursor](https://cursor.com/) | AI code editor built around chat, codebase context, agents, rules, MCP, and terminal-assisted development workflows. | CLI · Desktop · IDE · Hybrid | [Website](https://cursor.com/) / [Docs](https://cursor.com/docs) |
| [Gemini Code Assist](https://developers.google.com/gemini-code-assist) | Google's coding assistant for IDEs and GitHub with agent mode, PR summaries, and code review. | GitHub app · IDE extension · Cloud | [Website](https://developers.google.com/gemini-code-assist) / [Docs](https://developers.google.com/gemini-code-assist/docs/overview) |
| [GitHub Copilot](https://github.com/features/copilot) | GitHub AI coding assistant for IDEs and GitHub workflows, including code suggestions, chat, and pull request support. | GitHub app · IDE · Web · Hosted | [Website](https://github.com/features/copilot) / [Docs](https://docs.github.com/en/copilot/overview-of-github-copilot/about-github-copilot) |
| [Junie](https://www.jetbrains.com/junie/) | JetBrains coding agent for IDEs and terminal that plans, edits, tests, and reviews project changes. | CLI · IDE extension · Hybrid | [Website](https://www.jetbrains.com/junie/) / [Docs](https://www.jetbrains.com/help/ai-assistant/junie-agent.html) / [Repo](https://github.com/JetBrains/junie) |
| [OpenCode](https://opencode.ai/) | Open-source AI coding agent for terminal, desktop, IDE, and GitHub repository workflows. | CLI · Desktop app · GitHub app · IDE extension · MCP client · Local | [Website](https://opencode.ai/) / [Docs](https://opencode.ai/docs/) / [Repo](https://github.com/anomalyco/opencode) |
| [Qodo](https://www.qodo.ai/) | Code review and IDE assistant product focused on reviewing diffs, tests, and repository context. | GitHub app · IDE extension · Cloud | [Website](https://www.qodo.ai/) / [Docs](https://docs.qodo.ai/) |
| [Refact.ai](https://refact.ai/) | Coding agent for IDEs and enterprises that can automate coding, debugging, testing, and documentation tasks. | IDE extension · Web app · Hybrid | [Website](https://refact.ai/) / [Docs](https://docs.refact.ai/) |
| [Roo Code](https://roocode.com/) | Open-source coding agent for VS Code and cloud agents that can code, review, and automate repository tasks. | CLI · IDE extension · Web app · Hybrid | [Website](https://roocode.com/) / [Docs](https://docs.roocode.com/) / [Repo](https://github.com/RooCodeInc/Roo-Code) |
| [Sweep](https://sweep.dev/) | JetBrains-focused coding assistant with agent mode, repo edits, AI code review, and MCP integration. | IDE extension · Hybrid | [Website](https://sweep.dev/) / [Docs](https://docs.sweep.dev/) |
| [Tabby](https://www.tabbyml.com/) | Self-hosted AI coding assistant for teams that want private code assistance and repository-aware development. | API · IDE extension · Self-hosted | [Website](https://www.tabbyml.com/) / [Docs](https://tabby.tabbyml.com/docs/) / [Repo](https://github.com/TabbyML/tabby) |
| [Windsurf Editor](https://windsurf.com/) | AI code editor with repo-aware agent workflows for multi-file edits and developer automation. | Desktop app · Hybrid | [Website](https://windsurf.com/) / [Docs](https://docs.windsurf.com/) |
| [Zed](https://zed.dev/) | Code editor with built-in agent workflows, external agent support, and MCP-connected coding assistance. | Desktop app · MCP client · Local | [Website](https://zed.dev/) / [Docs](https://zed.dev/releases/stable/0.233.5) / [Repo](https://github.com/zed-industries/zed) |

### Browser agents

Tools that can inspect, drive, or test browser-based developer workflows.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [Cline](https://docs.cline.bot/introduction/overview) | Open-source coding agent for editor workflows with file edits, terminal commands, browser use, and MCP-based tool extension. | Browser · CLI · IDE · Hybrid | [Website](https://docs.cline.bot/introduction/overview) / [Docs](https://docs.cline.bot/introduction/overview) / [Repo](https://github.com/cline/cline) |

### MCP clients

Applications and agents that connect to Model Context Protocol servers.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [Augment Code](https://www.augmentcode.com/) | Repo-aware coding agent for editors and terminal that edits files, uses tools, and understands large codebases. | CLI · IDE extension · Hybrid | [Website](https://www.augmentcode.com/) / [Docs](https://docs.augmentcode.com/introduction) |
| [Gemini CLI](https://developers.google.com/gemini-code-assist/docs/gemini-cli) | Open-source terminal coding agent that uses tool calls and MCP servers to work on repository tasks. | CLI · MCP client · Local | [Website](https://developers.google.com/gemini-code-assist/docs/gemini-cli) / [Docs](https://developers.google.com/gemini-code-assist/docs/gemini-cli) / [Repo](https://github.com/google-gemini/gemini-cli) |
| [OpenCode](https://opencode.ai/) | Open-source AI coding agent for terminal, desktop, IDE, and GitHub repository workflows. | CLI · Desktop app · GitHub app · IDE extension · MCP client · Local | [Website](https://opencode.ai/) / [Docs](https://opencode.ai/docs/) / [Repo](https://github.com/anomalyco/opencode) |
| [Roo Code](https://roocode.com/) | Open-source coding agent for VS Code and cloud agents that can code, review, and automate repository tasks. | CLI · IDE extension · Web app · Hybrid | [Website](https://roocode.com/) / [Docs](https://docs.roocode.com/) / [Repo](https://github.com/RooCodeInc/Roo-Code) |
| [Sweep](https://sweep.dev/) | JetBrains-focused coding assistant with agent mode, repo edits, AI code review, and MCP integration. | IDE extension · Hybrid | [Website](https://sweep.dev/) / [Docs](https://docs.sweep.dev/) |
| [Zed](https://zed.dev/) | Code editor with built-in agent workflows, external agent support, and MCP-connected coding assistance. | Desktop app · MCP client · Local | [Website](https://zed.dev/) / [Docs](https://zed.dev/releases/stable/0.233.5) / [Repo](https://github.com/zed-industries/zed) |

### MCP tooling

Developer tools for building, testing, debugging, or managing MCP systems.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) | Official visual and command-line testing tool for developing, inspecting, and debugging Model Context Protocol servers. | CLI · MCP · Web · Local | [Website](https://modelcontextprotocol.io/docs/tools/inspector) / [Docs](https://modelcontextprotocol.io/docs/tools/inspector) / [Repo](https://github.com/modelcontextprotocol/inspector) |

### Agent observability

Tools for tracing, monitoring, and debugging agent or LLM application behavior.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [Langfuse](https://langfuse.com/docs) | Open-source LLM engineering platform for observability, tracing, prompt management, datasets, and evaluations. | API · Web · Hybrid | [Website](https://langfuse.com/docs) / [Docs](https://langfuse.com/docs) / [Repo](https://github.com/langfuse/langfuse) |

### Agent evals

Evaluation frameworks and systems for agents, LLM apps, and developer workflows.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [Langfuse](https://langfuse.com/docs) | Open-source LLM engineering platform for observability, tracing, prompt management, datasets, and evaluations. | API · Web · Hybrid | [Website](https://langfuse.com/docs) / [Docs](https://langfuse.com/docs) / [Repo](https://github.com/langfuse/langfuse) |

### Self-hosted AI dev stacks

Self-hostable platforms and infrastructure for AI developer workflows.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [Langfuse](https://langfuse.com/docs) | Open-source LLM engineering platform for observability, tracing, prompt management, datasets, and evaluations. | API · Web · Hybrid | [Website](https://langfuse.com/docs) / [Docs](https://langfuse.com/docs) / [Repo](https://github.com/langfuse/langfuse) |
| [Refact.ai](https://refact.ai/) | Coding agent for IDEs and enterprises that can automate coding, debugging, testing, and documentation tasks. | IDE extension · Web app · Hybrid | [Website](https://refact.ai/) / [Docs](https://docs.refact.ai/) |
| [Tabby](https://www.tabbyml.com/) | Self-hosted AI coding assistant for teams that want private code assistance and repository-aware development. | API · IDE extension · Self-hosted | [Website](https://www.tabbyml.com/) / [Docs](https://tabby.tabbyml.com/docs/) / [Repo](https://github.com/TabbyML/tabby) |

### Local LLM developer tools

Tools that help developers run or integrate local models in coding workflows.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [Tabby](https://www.tabbyml.com/) | Self-hosted AI coding assistant for teams that want private code assistance and repository-aware development. | API · IDE extension · Self-hosted | [Website](https://www.tabbyml.com/) / [Docs](https://tabby.tabbyml.com/docs/) / [Repo](https://github.com/TabbyML/tabby) |

### Repo automation tools

AI tools that automate repository checks, changes, pull requests, or maintenance.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [Amazon Q Developer](https://aws.amazon.com/q/developer/) | AWS coding assistant with IDE, CLI, and GitHub agents for coding, testing, review, and transformations. | CLI · GitHub app · IDE extension · Hybrid | [Website](https://aws.amazon.com/q/developer/) / [Docs](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/what-is.html) |
| [Amp](https://ampcode.com/) | Terminal-centric coding agent with deep codebase context, editor links, and automation-oriented SDK features. | API · CLI · Hybrid | [Website](https://ampcode.com/) / [Docs](https://ampcode.com/manual) |
| [Bito AI Code Review Agent](https://bito.ai/product/ai-code-review-agent/) | Repository review agent for GitHub, GitLab, and Bitbucket pull or merge request workflows. | GitHub app · Cloud | [Website](https://bito.ai/product/ai-code-review-agent/) / [Docs](https://docs.bito.ai/ai-code-reviews-in-git/install-run-using-bito-cloud/guide-for-github) |
| [CodeRabbit](https://coderabbit.ai/) | AI code review agent for pull requests, local IDE review, and terminal-based review workflows. | CLI · GitHub app · IDE extension · Hybrid | [Website](https://coderabbit.ai/) / [Docs](https://docs.coderabbit.ai/) |
| [Continue](https://docs.continue.dev/) | Open-source AI code assistant and CLI for IDE agents, source-controlled checks, and customizable development workflows. | CLI · IDE · Hybrid | [Website](https://docs.continue.dev/) / [Docs](https://docs.continue.dev/) / [Repo](https://github.com/continuedev/continue) |
| [Factory Droid](https://factory.ai/) | Coding agent platform with CLI, desktop, and headless automation for code changes, review, and CI workflows. | API · CLI · Desktop app · Hybrid | [Website](https://factory.ai/) / [Docs](https://docs.factory.ai/welcome) |
| [Gemini Code Assist](https://developers.google.com/gemini-code-assist) | Google's coding assistant for IDEs and GitHub with agent mode, PR summaries, and code review. | GitHub app · IDE extension · Cloud | [Website](https://developers.google.com/gemini-code-assist) / [Docs](https://developers.google.com/gemini-code-assist/docs/overview) |
| [OpenCode](https://opencode.ai/) | Open-source AI coding agent for terminal, desktop, IDE, and GitHub repository workflows. | CLI · Desktop app · GitHub app · IDE extension · MCP client · Local | [Website](https://opencode.ai/) / [Docs](https://opencode.ai/docs/) / [Repo](https://github.com/anomalyco/opencode) |
| [Roo Code](https://roocode.com/) | Open-source coding agent for VS Code and cloud agents that can code, review, and automate repository tasks. | CLI · IDE extension · Web app · Hybrid | [Website](https://roocode.com/) / [Docs](https://docs.roocode.com/) / [Repo](https://github.com/RooCodeInc/Roo-Code) |

### AI code review tools

AI-assisted tools for reviewing changes, pull requests, and code quality.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [Amazon Q Developer](https://aws.amazon.com/q/developer/) | AWS coding assistant with IDE, CLI, and GitHub agents for coding, testing, review, and transformations. | CLI · GitHub app · IDE extension · Hybrid | [Website](https://aws.amazon.com/q/developer/) / [Docs](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/what-is.html) |
| [Bito AI Code Review Agent](https://bito.ai/product/ai-code-review-agent/) | Repository review agent for GitHub, GitLab, and Bitbucket pull or merge request workflows. | GitHub app · Cloud | [Website](https://bito.ai/product/ai-code-review-agent/) / [Docs](https://docs.bito.ai/ai-code-reviews-in-git/install-run-using-bito-cloud/guide-for-github) |
| [CodeRabbit](https://coderabbit.ai/) | AI code review agent for pull requests, local IDE review, and terminal-based review workflows. | CLI · GitHub app · IDE extension · Hybrid | [Website](https://coderabbit.ai/) / [Docs](https://docs.coderabbit.ai/) |
| [Continue](https://docs.continue.dev/) | Open-source AI code assistant and CLI for IDE agents, source-controlled checks, and customizable development workflows. | CLI · IDE · Hybrid | [Website](https://docs.continue.dev/) / [Docs](https://docs.continue.dev/) / [Repo](https://github.com/continuedev/continue) |
| [Factory Droid](https://factory.ai/) | Coding agent platform with CLI, desktop, and headless automation for code changes, review, and CI workflows. | API · CLI · Desktop app · Hybrid | [Website](https://factory.ai/) / [Docs](https://docs.factory.ai/welcome) |
| [Gemini Code Assist](https://developers.google.com/gemini-code-assist) | Google's coding assistant for IDEs and GitHub with agent mode, PR summaries, and code review. | GitHub app · IDE extension · Cloud | [Website](https://developers.google.com/gemini-code-assist) / [Docs](https://developers.google.com/gemini-code-assist/docs/overview) |
| [GitHub Copilot](https://github.com/features/copilot) | GitHub AI coding assistant for IDEs and GitHub workflows, including code suggestions, chat, and pull request support. | GitHub app · IDE · Web · Hosted | [Website](https://github.com/features/copilot) / [Docs](https://docs.github.com/en/copilot/overview-of-github-copilot/about-github-copilot) |
| [Junie](https://www.jetbrains.com/junie/) | JetBrains coding agent for IDEs and terminal that plans, edits, tests, and reviews project changes. | CLI · IDE extension · Hybrid | [Website](https://www.jetbrains.com/junie/) / [Docs](https://www.jetbrains.com/help/ai-assistant/junie-agent.html) / [Repo](https://github.com/JetBrains/junie) |
| [Qodo](https://www.qodo.ai/) | Code review and IDE assistant product focused on reviewing diffs, tests, and repository context. | GitHub app · IDE extension · Cloud | [Website](https://www.qodo.ai/) / [Docs](https://docs.qodo.ai/) |
| [Sweep](https://sweep.dev/) | JetBrains-focused coding assistant with agent mode, repo edits, AI code review, and MCP integration. | IDE extension · Hybrid | [Website](https://sweep.dev/) / [Docs](https://docs.sweep.dev/) |

### Documentation agents

AI tools that generate, maintain, or reason over developer documentation.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [Refact.ai](https://refact.ai/) | Coding agent for IDEs and enterprises that can automate coding, debugging, testing, and documentation tasks. | IDE extension · Web app · Hybrid | [Website](https://refact.ai/) / [Docs](https://docs.refact.ai/) |

### Test generation agents

AI tools that create, improve, or maintain automated tests.

| Tool | Good for | Experience | Links |
| --- | --- | --- | --- |
| [Amazon Q Developer](https://aws.amazon.com/q/developer/) | AWS coding assistant with IDE, CLI, and GitHub agents for coding, testing, review, and transformations. | CLI · GitHub app · IDE extension · Hybrid | [Website](https://aws.amazon.com/q/developer/) / [Docs](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/what-is.html) |
| [Junie](https://www.jetbrains.com/junie/) | JetBrains coding agent for IDEs and terminal that plans, edits, tests, and reviews project changes. | CLI · IDE extension · Hybrid | [Website](https://www.jetbrains.com/junie/) / [Docs](https://www.jetbrains.com/help/ai-assistant/junie-agent.html) / [Repo](https://github.com/JetBrains/junie) |
| [Qodo](https://www.qodo.ai/) | Code review and IDE assistant product focused on reviewing diffs, tests, and repository context. | GitHub app · IDE extension · Cloud | [Website](https://www.qodo.ai/) / [Docs](https://docs.qodo.ai/) |
| [Refact.ai](https://refact.ai/) | Coding agent for IDEs and enterprises that can automate coding, debugging, testing, and documentation tasks. | IDE extension · Web app · Hybrid | [Website](https://refact.ai/) / [Docs](https://docs.refact.ai/) |

## New Arrivals

- 2026-05-07: [Aider](https://aider.chat/)
- 2026-05-07: [Amazon Q Developer](https://aws.amazon.com/q/developer/)
- 2026-05-07: [Amp](https://ampcode.com/)
- 2026-05-07: [Augment Code](https://www.augmentcode.com/)
- 2026-05-07: [Bito AI Code Review Agent](https://bito.ai/product/ai-code-review-agent/)
- 2026-05-07: [Claude Code](https://code.claude.com/docs/en/setup)
- 2026-05-07: [Cline](https://docs.cline.bot/introduction/overview)
- 2026-05-07: [CodeRabbit](https://coderabbit.ai/)

## Submit a tool

Add or update one tool by editing `data/tools.yml`, then run:

```bash
npm run sort
npm run generate
npm test
```

Use official sources, keep descriptions factual, and leave uncertain metadata as `not specified` instead of guessing. See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/submission-guide.md](docs/submission-guide.md).

## Roadmap

- Keep the metadata schema small and strict.
- Add contribution-friendly seed coverage category by category.
- Build generated filters and richer comparison views after the data model settles.
- Design a future importer after the schema, validator, and generator have real usage.

