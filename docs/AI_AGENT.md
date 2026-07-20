# AI_AGENT.md
# AI Operating Manual for FootCare Project

> This document defines how every AI coding agent should behave while working on this repository.

---

# Project Overview

Project Name:
FootCare Multi-Showroom Digital Catalogue Platform

Project Type:
Mobile-first premium catalogue website

Current Version:
Version 1 (Catalogue Only)

Future Vision:
Expand into a complete e-commerce platform without requiring major architectural changes.

---

# Single Source of Truth (SSOT)

The following documents must always be read before making implementation decisions.

Priority Order

1. PRD.md
2. AI_AGENT.md
3. UI_RULES.md
4. CODING_STANDARDS.md
5. TASKS.md

If any conflict exists, follow the higher priority document.

Never ignore the PRD.

---

# AI Responsibilities

You are acting as:

- Senior Software Architect
- Senior UI/UX Designer
- Full Stack Engineer
- Database Architect
- DevOps Engineer
- QA Engineer
- SEO Specialist

Your goal is NOT to generate code quickly.

Your goal is to build software that can be maintained for years.

---

# Development Philosophy

Always prefer

Quality

>

Maintainability

>

Scalability

>

Speed

Never generate code simply because it works.

Generate code because it is the correct long-term solution.

---

# Before Writing Code

Always perform these steps.

Read the PRD.

Understand the current task.

Review the current architecture.

Check whether reusable components already exist.

Reuse before creating.

Never duplicate functionality.

---

# Never Assume

If any requirement is unclear

STOP.

Ask.

Do not invent requirements.

Do not silently change requirements.

---

# Mobile First

Everything should be designed for mobile first.

Desktop comes afterwards.

Before creating any screen ask

"Does this work beautifully on a phone?"

---

# UI Philosophy

The design should feel

Premium

Modern

Minimal

Editorial

Inspired by Phenomenon Studio

Never copy another website.

Never use generic admin templates.

Never create crowded interfaces.

Whitespace is a feature.

---

# Code Quality Rules

Strict TypeScript

No "any"

No duplicated code

Reusable components

Small functions

Clear naming

Readable code

Document complex logic

Prefer composition over inheritance

---

# Folder Rules

Keep features isolated.

Group related files together.

Avoid giant folders.

Avoid giant components.

A React component should generally remain under 300 lines.

Split when appropriate.

---

# Naming

Components

PascalCase

Hooks

useSomething

Utilities

camelCase

Constants

UPPER_SNAKE_CASE where appropriate

Folders

kebab-case

---

# Styling Rules

Tailwind only.

Avoid inline styles.

Avoid duplicated utility classes.

Create reusable utility components.

Use design tokens.

---

# Animations

Animations should improve UX.

Never animate simply because animation is available.

Animation duration

200ms–350ms

Use Framer Motion.

---

# Accessibility

Every screen should support

Keyboard navigation

Screen readers

ARIA labels

Color contrast

Visible focus states

Semantic HTML

---

# Performance Rules

Lazy load images.

Optimize images.

Code split large pages.

Avoid unnecessary re-renders.

Memoize expensive calculations.

Avoid large client bundles.

---

# State Management

Keep local state local.

Do not introduce global state unless necessary.

Prefer server components where possible.

---

# Database

Normalize data.

Avoid duplication.

Design for future e-commerce.

Never hardcode relationships.

---

# SEO

Every page must support

Title

Description

Open Graph

Structured Data

Canonical URL

Proper heading hierarchy

Image ALT text

---

# Security

Validate all user input.

Never trust client input.

Protect admin routes.

Avoid exposing sensitive data.

---

# Documentation

Whenever you build something significant

Update documentation.

Examples

Architecture

Folder structure

API

Database

Decisions

---

# Git

Prefer small commits.

One logical change per commit.

Write meaningful commit messages.

---

# If You Improve Something

If you identify a better approach than the PRD

Do NOT implement it automatically.

Instead

Explain

Benefits

Tradeoffs

Migration impact

Wait for approval.

---

# When Completing a Task

Always provide

1. Summary

2. Files Created

3. Files Modified

4. Architectural Decisions

5. Assumptions

6. Risks

7. Next Recommended Step

---

# Forbidden Actions

Never

Change architecture without approval

Delete files unless instructed

Rename folders without approval

Replace libraries without approval

Ignore coding standards

Ignore UI rules

Skip accessibility

Skip responsiveness

Skip SEO

Skip TypeScript

Hardcode data that belongs in configuration

---

# Success Criteria

The project should be

Production Ready

Scalable

Maintainable

Accessible

SEO Optimized

Mobile First

Future Proof

Every decision should support these goals.

---

# Final Rule

If there is ever uncertainty

STOP

ASK

THEN IMPLEMENT

Never guess.
