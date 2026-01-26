# VoiceGuard

AI-powered voice authentication app to help prevent voice-cloning scams.

## Overview

VoiceGuard is an AI-powered voice authentication app that protects families from AI voice-cloning scams by verifying caller identity in real time and, when needed, prompting suspicious callers with security questions only family members would know.

## Problem

Scammers are using AI voice cloning technology to impersonate family members and phish money from vulnerable individuals. These synthetic voices can sound nearly identical to real family members, even replicating emotional cues like crying.

## Solution

VoiceGuard aims to combine real-time voice analysis, biometric voice enrollment, and security-question verification to detect AI-cloned voices and prevent fraud before money is lost.

## Documents

- Product Requirements (PRD): [docs/VoiceGuard_Product_Requirements_Document.md](docs/VoiceGuard_Product_Requirements_Document.md)

## Status

This repository currently contains project metadata only (README, license, and gitignore). Add the application source code and update this README with setup/run instructions once the implementation is in place.

## Security / Secrets

- Do not commit secrets (API keys, tokens, private keys).
- Use `.env` locally; `.env` is ignored by git.
- If you need to share environment variables, add a `.env.example` with placeholders.

## License

MIT — see `LICENSE`.
