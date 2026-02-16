# LearningChief Platform Integration

This directory imports the full LearningChief app (frontend + backend) from `trjim2k7/learningchief`.

## Run locally

```bash
cd learningchief-platform
cp .env.example .env
npm install
npm run start
```

Then open: `http://localhost:3080`

## Notes
- Frontend includes worksheet generation, interactive mode, gamification, progress dashboard, and smart marker UI.
- AI features require `GEMINI_API_KEY`.
- This is integrated alongside the mirrored marketing site in `learningchief.com/`.

## Suggested deployment structure
- `/` -> marketing mirror/static site
- `/app` -> proxy to Node app (`learningchief-platform` server)
- `/api` -> Node backend routes
