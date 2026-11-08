# HomePilot Windows Agent

The agent runs in the logged-in Windows session and maintains one outbound WebSocket. It does not poll and requires no router port forwarding.

## First run

1. Install Python 3.11 or newer.
2. Copy `config.example.json` to `config.json` and set the deployed relay URL plus the same agent secret configured in Cloudflare.
3. Copy `apps.example.json` to `apps.json`. Check executable paths on this PC.
4. Run `start-agent.bat`. It creates a local virtual environment and installs dependencies on first launch.
5. Keep the terminal open while testing.

After a successful manual start, run PowerShell as your normal Windows user and execute `install-autostart.ps1` to start the agent at login. Remove it with `uninstall-autostart.ps1`.

## Supported commands

Allow-listed app launch, media play/pause/next/previous/mute, Windows lock, sleep and hibernate. No arbitrary shell execution. Restart, shutdown, process termination, exact volume control and live system metrics are not implemented.

The agent is an interactive user-session process, not a Windows service. Local `config.json`, `apps.json`, virtual environment and logs must never be committed.
