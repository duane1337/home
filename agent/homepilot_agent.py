from __future__ import annotations

import asyncio
import ctypes
import json
import logging
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

import websockets

ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "config.json"
APPS_PATH = ROOT / "apps.json"
LOG_PATH = ROOT / "homepilot-agent.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.FileHandler(LOG_PATH, encoding="utf-8"), logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger("homepilot")


def read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValueError(f"{path.name} must contain a JSON object")
    return value


def press_key(vk: int) -> None:
    user32 = ctypes.windll.user32
    user32.keybd_event(vk, 0, 0, 0)
    user32.keybd_event(vk, 0, 2, 0)


def execute(command: dict[str, Any], apps: dict[str, Any]) -> dict[str, Any]:
    action = command.get("action")
    payload = command.get("payload") or {}
    if not isinstance(payload, dict):
        raise ValueError("Invalid payload")

    if action == "app.launch":
        app_id = payload.get("app_id")
        if not isinstance(app_id, str) or app_id not in apps:
            raise ValueError("Application is not allow-listed")
        entry = apps[app_id]
        if not isinstance(entry, dict) or not isinstance(entry.get("path"), str):
            raise ValueError("Invalid application configuration")
        target = os.path.expandvars(entry["path"])
        if not Path(target).is_file():
            raise FileNotFoundError(f"Executable not found: {target}")
        args = entry.get("args", [])
        if not isinstance(args, list) or not all(isinstance(x, str) for x in args):
            raise ValueError("Invalid application arguments")
        subprocess.Popen([target, *args], cwd=str(Path(target).parent), close_fds=True)
        return {"message": f"Launched {entry.get('name', app_id)}"}

    media_keys = {
        "media.playPause": 0xB3,
        "media.next": 0xB0,
        "media.previous": 0xB1,
        "media.volume.mute": 0xAD,
    }
    if action in media_keys:
        press_key(media_keys[action])
        return {"message": "Media key sent"}

    if action == "system.lock":
        if not ctypes.windll.user32.LockWorkStation():
            raise OSError("Windows refused to lock the workstation")
        return {"message": "Workstation locked"}

    if action == "system.sleep":
        ctypes.windll.powrprof.SetSuspendState(False, True, False)
        return {"message": "Sleep requested"}

    if action == "system.hibernate":
        ctypes.windll.powrprof.SetSuspendState(True, True, False)
        return {"message": "Hibernate requested"}

    raise ValueError(f"Unsupported action: {action}")


async def run() -> None:
    if sys.platform != "win32":
        raise RuntimeError("HomePilot Agent currently supports Windows only")
    if not CONFIG_PATH.exists() or not APPS_PATH.exists():
        raise FileNotFoundError("Copy config.example.json to config.json and apps.example.json to apps.json first")

    config = read_json(CONFIG_PATH)
    apps = read_json(APPS_PATH)
    relay_url = config.get("relay_url")
    secret = config.get("agent_secret")
    if not isinstance(relay_url, str) or not relay_url.startswith("wss://"):
        raise ValueError("config.json relay_url must be a wss:// URL")
    if not isinstance(secret, str) or len(secret) < 32 or secret.startswith("GENERATE_"):
        raise ValueError("Set a random agent_secret of at least 32 characters in config.json")

    delay = max(1, int(config.get("reconnect_min_seconds", 2)))
    max_delay = max(delay, int(config.get("reconnect_max_seconds", 30)))
    headers = {"Authorization": f"Bearer {secret}"}

    while True:
        try:
            log.info("Connecting to relay")
            async with websockets.connect(
                relay_url,
                additional_headers=headers,
                ping_interval=20,
                ping_timeout=20,
                close_timeout=5,
                max_size=64 * 1024,
            ) as socket:
                log.info("Connected")
                delay = max(1, int(config.get("reconnect_min_seconds", 2)))
                async for raw in socket:
                    command: dict[str, Any] = {}
                    try:
                        message = json.loads(raw)
                        if not isinstance(message, dict) or message.get("type") != "command":
                            continue
                        command = message
                        if int(command.get("expires_at", 0)) < int(time.time()):
                            raise TimeoutError("Command expired")
                        result = execute(command, apps)
                        ack = {"type": "ack", "id": command.get("id"), "status": "completed", "result": result, "completed_at": int(time.time())}
                    except Exception as exc:
                        log.exception("Command failed")
                        ack = {"type": "ack", "id": command.get("id"), "status": "failed", "error": str(exc)[:300], "completed_at": int(time.time())}
                    await socket.send(json.dumps(ack, ensure_ascii=False))
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("Relay connection lost")
        log.info("Reconnecting in %s seconds", delay)
        await asyncio.sleep(delay)
        delay = min(max_delay, delay * 2)


if __name__ == "__main__":
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        log.info("Stopped by user")
    except Exception:
        log.exception("Agent could not start")
        raise
