---
title: "Restore private modes after hosted artifact download"
date: "2026-10-18"
topics: ["hosted-maintenance", "automatic-knowledge-maintenance"]
issue: 'https://github.com/jfusco/brain/issues/45'
issues: ['https://github.com/jfusco/brain/issues/45']
---

# Restore private modes after hosted artifact download

The follow-up real hosted run 39136696915 correctly failed the existing runtime guard with “Private storage permissions are too broad.” Actions restored the operational checkpoint into a newly created state directory with default broader modes. The failure and missing downstream receipt remain evidence; neither is relabeled successful.

Bootstrap now re-establishes owner-only modes on its owned `.state`, `previous` and `hosted` directories and their regular artifact files, rejecting symlinks/non-directory roots before proceeding. The privacy guard is unchanged. Local private fallback remains active until real checkpoint restoration, publication and fresh verification pass. No private inbox or backup was uploaded.

Rollback reverts the scoped bootstrap hardening; preserve previous failed receipts and source evidence. No fabricated warnings, fixtures or tests were added.
