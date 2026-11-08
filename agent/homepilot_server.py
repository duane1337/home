from __future__ import annotations
import ctypes, hashlib, hmac, json, logging, os, subprocess, time
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
ROOT=Path(__file__).resolve().parent
CONFIG_PATH,APPS_PATH=ROOT/"config.json",ROOT/"apps.json"
logging.basicConfig(level=logging.INFO,format="%(asctime)s %(levelname)s %(message)s",handlers=[logging.FileHandler(ROOT/"homepilot-server.log",encoding="utf-8")])
log=logging.getLogger("homepilot")
def read_json(path:Path)->dict[str,Any]:
 with path.open("r",encoding="utf-8") as f: data=json.load(f)
 if not isinstance(data,dict): raise ValueError(f"{path.name} must be a JSON object")
 return data
def validate_init_data(raw:str,token:str,owner_id:int):
 if not raw or len(raw)>8192: raise HTTPException(401,"Open HomePilot from its Telegram bot.")
 pairs=dict(parse_qsl(raw,keep_blank_values=True)); received=pairs.pop("hash",None)
 if not received: raise HTTPException(401,"Telegram authorization hash is missing.")
 check="\n".join(f"{k}={v}" for k,v in sorted(pairs.items()))
 secret=hmac.new(b"WebAppData",token.encode(),hashlib.sha256).digest()
 expected=hmac.new(secret,check.encode(),hashlib.sha256).hexdigest()
 if not hmac.compare_digest(expected,received): raise HTTPException(401,"Telegram authorization check failed.")
 try: auth_date,user=int(pairs.get("auth_date","0")),json.loads(pairs.get("user","{}"))
 except (ValueError,json.JSONDecodeError): raise HTTPException(401,"Invalid Telegram session.")
 if time.time()-auth_date>86400 or auth_date>time.time()+60: raise HTTPException(401,"Telegram session expired. Reopen the Mini App.")
 if int(user.get("id",0))!=owner_id: raise HTTPException(403,"This HomePilot instance belongs to another Telegram account.")
 return user
def authorize(header:str|None):
 if not CONFIG_PATH.exists(): raise HTTPException(503,"Create agent/config.json from config.example.json.")
 cfg=read_json(CONFIG_PATH); token=cfg.get("bot_token"); owner=int(cfg.get("owner_id",0))
 if not token or owner<=0: raise HTTPException(503,"Configure bot_token and owner_id in agent/config.json.")
 if not header or not header.startswith("tma "): raise HTTPException(401,"Telegram session missing. Open this app from Telegram.")
 return validate_init_data(header[4:],token,owner)
def run_action(action:str,payload:dict[str,Any]):
 apps=read_json(APPS_PATH) if APPS_PATH.exists() else {}
 if action=="app.launch":
  key=payload.get("app_id"); entry=apps.get(key) if isinstance(key,str) else None
  if not isinstance(entry,dict) or not isinstance(entry.get("path"),str): raise HTTPException(400,"Application is not configured.")
  target=os.path.expandvars(entry["path"])
  if not os.path.isfile(target): raise HTTPException(404,f"Executable not found: {target}")
  args=entry.get("args",[])
  if not isinstance(args,list) or not all(isinstance(x,str) for x in args): raise HTTPException(400,"Invalid app arguments.")
  subprocess.Popen([target,*args],cwd=os.path.dirname(target),close_fds=True); return {"message":f"Launched {entry.get('name',key)}"}
 keys={"media.playPause":0xB3,"media.next":0xB0,"media.previous":0xB1,"media.volume.mute":0xAD}
 if action in keys:
  ctypes.windll.user32.keybd_event(keys[action],0,0,0); ctypes.windll.user32.keybd_event(keys[action],0,2,0); return {"message":"Media key sent"}
 if action=="media.volume.set":
  value=payload.get("value")
  if not isinstance(value,int) or not 0<=value<=100: raise HTTPException(400,"Volume must be 0-100.")
  from pycaw.pycaw import AudioUtilities
  AudioUtilities.GetSpeakers().EndpointVolume.SetMasterVolumeLevelScalar(value/100.0,None); return {"message":f"Volume set to {value}%"}
 if action=="system.lock":
  if not ctypes.windll.user32.LockWorkStation(): raise HTTPException(500,"Windows refused to lock.")
  return {"message":"Workstation locked"}
 if action in ("system.sleep","system.hibernate"):
  ctypes.windll.powrprof.SetSuspendState(action=="system.hibernate",True,False); return {"message":action}
 raise HTTPException(400,"Unsupported action.")
app=FastAPI(title="HomePilot Local",docs_url=None,redoc_url=None)
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_methods=["GET","POST"],allow_headers=["Authorization","Content-Type"])
class Command(BaseModel):
 action:str=Field(min_length=1,max_length=64)
 payload:dict[str,Any]=Field(default_factory=dict)
@app.get("/api/health")
def health(authorization:str|None=Header(default=None)):
 user=authorize(authorization); return {"product":"HomePilot","version":"0.2.0","agent":{"status":"online"},"user":{"id":user["id"]},"capabilities":{"apps":True,"media":True,"power":True}}
@app.post("/api/command")
def command(body:Command,authorization:str|None=Header(default=None)):
 user=authorize(authorization); result=run_action(body.action,body.payload)
 log.info("Command %s completed for owner %s",body.action,user["id"])
 return {"id":str(int(time.time()*1000)),"status":"completed","delivered":True,"result":result}
