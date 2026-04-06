# CLAUDE.md

This file provides guidance to Claude Code when working in the Claude-Github repository.

## Purpose

This repository is the home for the **Claude-Github agent team** — a multi-agent system for managing GitHub operations through coordinated specialist agents.

## Environment

- **Experimental agent teams** are enabled via `.claude/settings.json` (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`).
- The `gh` CLI is available and authenticated. Use it (and `gh api`) for all GitHub operations.

## Agent Team

Agents are defined in `.claude/agents/`. The user speaks only to the **orchestrator**.

| Agent | Responsibilities |
|---|---|
| `orchestrator` | Entry point — decomposes requests and delegates to specialists |
| `repo-manager` | Repos, branches, settings, webhooks, collaborators |
| `issues-tracker` | Issues, labels, milestones, project boards |
| `pr-manager` | Pull requests, reviews, merges |
| `actions-manager` | GitHub Actions workflows, CI/CD, secrets |

## Agent Workflow Pattern

- Orchestrator decomposes the user's request and assigns tasks in ID order (lowest first).
- Specialists execute GitHub operations and report state back to the orchestrator.
- Orchestrator aggregates results and responds to the user.
- Shut down teammates with `SendMessage {type: "shutdown_request"}` when work is complete, then call `TeamDelete`.

## Rules

- Always confirm before destructive operations (delete repo/branch, force-push, bulk-close issues).
- Never merge PRs or push to main without explicit user approval.
- Never expose secret values — reference secret names only.
