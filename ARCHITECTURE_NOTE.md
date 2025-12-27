# Architecture Notes

Research Date: 2025-12-28

## Overview

This document summarizes the research on Spotify, Apple Music, and YouTube Music APIs, and the architectural decisions made for unified implementation patterns.

---

## 1. API Characteristics by Service

### Apple Music

| Item | Details |
|------|---------|
| Official API | Yes (Apple Music API) |
| Authentication | JWT (Developer Token) + Music User Token |
| Public Data Access | Developer Token only |
| Playback | MusicKit JS required (DRM: FairPlay) |
| Rate Limit | 20 req/s per user |

**Developer Token:**
- JWT signed with private key (.p8)
- Expiration: max 180 days (can be shortened)
- Requires Team ID and Key ID

**Music User Token:**
- Required for user library access
- Automatically managed by MusicKit JS

### Spotify

| Item | Details |
|------|---------|
| Official API | Yes (Web API) |
| Authentication | OAuth 2.0 + PKCE |
| Public Data Access | User authentication required |
| Playback | Web Playback SDK required (Premium only) |
| Commercial Use | Requires prior approval (2025~: organizations only) |

**OAuth 2.0 PKCE:**
- PKCE required from November 2025
- No Client Secret needed (browser-friendly)
- User logs in to Spotify for authorization

**Commercial Approval Reality:**
- Reviews take 3-6 months (reported)
- No response in many cases
- Individual developers cannot apply since 2025

### YouTube Music

| Item | Details |
|------|---------|
| Official API | None (YouTube Data API available) |
| Authentication | API Key / OAuth 2.0 |
| Public Data Access | API Key sufficient |
| Playback | iframe embed (plays as video) |
| Quota | 10,000 units/day |

**API Key:**
- Static string (cannot be short-lived like JWT)
- Referer restriction available (can be spoofed)
- If leaked, quota can be consumed by attackers

**Service Account (JWT) for YouTube Data API:**
- Not supported (`NoLinkedYouTubeAccount` error)
- Only YouTube Content ID API supports it (for content owners)

---

## 2. Server-side vs Browser-side

### Playback Constraints

All 3 services prohibit server-side audio playback.

| Service | Reason |
|---------|--------|
| Apple Music | FairPlay DRM, MusicKit JS required |
| Spotify | DRM, Web Playback SDK required |
| YouTube | iframe embed only (200x200px minimum) |

### Credential Exposure Risk

| Service | Exposed | Risk | Mitigation |
|---------|---------|------|------------|
| Apple Music | Developer Token (JWT) | Medium | Short-lived + rotation |
| Spotify | None (OAuth) | Low | User auth, no dev secrets exposed |
| YouTube | API Key | High | Referer restriction (incomplete) |

---

## 3. Architectural Decisions

### Architecture

```
Apple Music  [Browser] ──JWT(short-lived)──→ [Apple API]
                ↑ Session management + rotation

Spotify      [Browser] ──OAuth/PKCE──→ [Spotify API]
                ↑ User authentication

YouTube      [Browser] → [Server] ──API Key──→ [YouTube API]
                           ↑ Hidden
```

### Rationale

- **Apple Music**: Short-lived JWT (1 hour) + rotation provides practical protection
- **Spotify**: OAuth PKCE is user authentication, no developer secrets exposed
- **YouTube**: Static API Key requires server-side hiding

---

## 4. Apple Music Token Rotation Design

```
Session start
    ↓
Token issued (1 hour expiry)
    ↓
MusicKit instance A plays music
    ↓
48 minutes elapsed (80%)
    ↓
New token acquired → MusicKit instance B created (background)
    ↓
User plays next track
    ↓
Instance B used (no lag)
    ↓
Instance A abandoned
```

---

## 5. References

### Apple Music
- [Apple Music API](https://developer.apple.com/documentation/applemusicapi/)
- [MusicKit JS](https://developer.apple.com/documentation/musickitjs)
- [Generating Developer Tokens](https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens)

### Spotify
- [Web API](https://developer.spotify.com/documentation/web-api)
- [Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk)
- [Authorization Code with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [Developer Policy](https://developer.spotify.com/policy)

### YouTube
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [iframe Player API](https://developers.google.com/youtube/iframe_api_reference)
- [Authentication](https://developers.google.com/youtube/v3/guides/authentication)

### Unofficial
- [ytmusicapi (Python)](https://github.com/sigma67/ytmusicapi) - Unofficial YouTube Music API
