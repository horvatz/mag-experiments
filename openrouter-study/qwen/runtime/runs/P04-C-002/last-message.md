# OpenRouter Study Project - Pilot P04 Constitution

**Version**: 1.0.0 | **Ratified**: 2026-10-30 | **Commit Hash**: `2d4cf1a` | **Author**: Project Manager (Qwen3.5)

---

## 🌟 Project Mission

Enable fast, autonomous, and reliable study of OpenRouter's pricing models and API through a dedicated, lightweight web application that provides users with real-time data access, comprehensive pricing insights, and flexible data export capabilities.

---

## 🏛️ Core Principles

### I. Lean-First Architecture
- Follow the Lean methodology: define → implement → test → observe → iterate
- Components must be modular, testable, and independently deployable
- Use Vite for rapid development and hot-reloading

### II. Data-Driven Integrity
- All data must come from Official OpenRouter API endpoints
- Use `https://api.openrouter.ai/v1/models` to retrieve model metadata
- Ensure data integrity through input validation before rendering

### III. User-Centric Design
- UX must be streamlined for both technical and non-technical users
- Support multilingual interfaces (Slovenian by default)
- Provide clear error messages and fallback logic for API failures

### IV. Privacy & Security
- No personal data collection beyond application usage
- All API credentials stored only in environment variables (`.env.local`)
- No deployment outside the user-controlled environment (localhost only)

### V. Test-Driven Development
- New features require corresponding test cases
- Test coverage for critical paths (90%+)
- Automated tests run on every push to `main`

---

## 🚫 Non-Negotiable Rules

| Rule | Description |
|------|-------------|
| `NO_AUTO_AGENT_INIT` | Agents must not auto-start without explicit confirmation |
| `NO_DATA_POLLUTION` | Do not write to global settings or modify existing datasets |
| `NO_EXTERNAL_SERVICES` | No integration with third-party services beyond OpenRouter API |
| `LOCAHOST_ONLY` | Deployment restricted to local development environment |

---

## ⚙️ Technical Constraints

- **Frontend**: HTML + Tailwind CSS via Vite
- **Storage**: LocalStorage & IndexedDB for test data persistence
- **Date Handling**: UTC timestamps, user-display conversion via Intl.DateTimeFormat
- **Timeouts**: All API calls must timeout after 15000ms
- **Error Handling**: Graceful degradation with fallback UI messaging

---

## 📅 Version Control

- **Git Branching**: Use `zan/<name>` (e.g., `zan/P04-specify`)
- **No Pull Requests** during pilot phase
- **No remote commits** until final review

---

## 🧭 Next Steps

1. ✅ Constitution ratified
2. ⏳ Proceed to `[Next Step: Create Specification Document]`
3. 📌 Remaining time: **~18 minutes** for full execution

---

**Status**: ✅ Approved & Finalized
**Next Phase**: Specification & Planning

Would you like to proceed to the **Specification Phase ($speckit-specify)**?
