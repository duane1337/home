# HomePilot Windows Agent prototype

Runs in the logged-in Windows session and holds one outbound WebSocket. It does not poll.

1. Install Python 3.11+.
2. Copy `config.example.json` to `config.json`; set the deployed relay URL and agent secret.
3. Copy `apps.example.json` to `apps.json`; verify executable paths on this PC.
4. Install: `py -m pip install -r requirements.txt`.
5. Run: `py homepilot_agent.py`.

Implemented prototype actions: launch allow-listed apps, media play/pause/next/previous/mute, lock, sleep and hibernate. Restart/shutdown and arbitrary shell commands are deliberately disabled. Focus/close/restart and exact volume are future work. Do not run as a Windows service; interactive user session is required.

Never commit local `config.json` or `apps.json`.
