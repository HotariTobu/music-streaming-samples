# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Bun monorepo for exploring and comparing music streaming service APIs (Spotify, Apple Music, YouTube Music).

### Goals

- Understand the commonalities and differences between each service's API
- Establish abstraction patterns to handle multiple services in a unified way
- Build a foundation for cross-platform music applications

### Target Features

- Authentication (OAuth)
- Search (songs, artists, albums)
- Playback control (play, pause, skip)
- Playlist management (fetch, create, edit, migrate between services)
- Library management (favorites, saved songs)
- Cross-service search and unified player interface

Each subproject has its own CLAUDE.md with detailed guidance.

## Project Management

- `ROADMAP.json` - High-level phase progress (root)
- `<subproject>/TASKS.json` - Detailed task management per subproject

## Subprojects

- `spotify/` - Spotify API sample (port 22222)
- `apple-music/` - Apple Music API sample (port 11111)
- `youtube-music/` - YouTube Music API sample (port 33333)

## LLM Documentation

- `llms-txt/` - API documentation for LLM consumption (each folder has index.md)
  - `apple-music-api/` - MusicKit JS v3 documentation

## Rules

- At session start, check recent commits to understand current progress
- All writing must be in English
- When using WebSearch, always use the current date
- For ambiguous instructions, confirm understanding with the user before proceeding

## Commit Message Format

Use structured format for session continuity:

```
[<phase-id>/<step-id>] <short description>

## Done
- What was accomplished

## Notes
- Context, decisions, gotchas

## Next
- [ ] Upcoming tasks
```
