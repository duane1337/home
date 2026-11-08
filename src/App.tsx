import { useEffect, useMemo, useState } from 'react'
import { getHome, queueCommand, getApiUrl, setApiUrl } from './lib/serverless'
import {
  AppWindow, AudioLines, ChevronRight, CirclePower, Command, Disc3,
  ExternalLink, Home, Lock, Monitor, Moon, MoreHorizontal, Play, Plus,
  Power, RefreshCw, Search, Settings2, SkipBack, SkipForward,
  SlidersHorizontal, Volume2, VolumeX, X,
} from 'lucide-react'

type Tab = 'home' | 'apps' | 'media' | 'system' | 'settings'
type AppItem = { name: string; subtitle: string; icon: string; color: string; favorite: boolean }

const initialApps: AppItem[] = [
  { name: 'Spotify', subtitle: 'Music', icon: 'S', color: '#1ed760', favorite: true },
  { name: 'Steam', subtitle: 'Games', icon: '⌁', color: '#91a8c5', favorite: true },
  { name: 'Discord', subtitle: 'Communication', icon: '◈', color: '#8997ff', favorite: true },
  { name: 'Chrome', subtitle: 'Browser', icon: '◉', color: '#e7b85a', favorite: false },
  { name: 'Telegram', subtitle: 'Messaging', icon: '➤', color: '#58b8e9', favorite: false },
  { name: 'Explorer', subtitle: 'Files', icon: '▰', color: '#d4b36c', favorite: false },
]

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'apps', label: 'Apps', icon: AppWindow },
  { id: 'media', label: 'Media', icon: AudioLines },
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'settings', label: 'Settings', icon: Settings2 },
]

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [apps, setApps] = useState(initialApps)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')
  const [accent, setAccent] = useState('#8f263f')
  const [font, setFont] = useState('Inter')
  const [volume, setVolume] = useState(42)
  const [playing, setPlaying] = useState(false)
  const [pcOnline, setPcOnline] = useState(false)
  const [serverUrl, setServerUrl] = useState(getApiUrl())

  useEffect(() => {
    getHome().then(state => setPcOnline(state.agent.status === 'online')).catch(() => setPcOnline(false))
  }, [])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const filteredApps = useMemo(
    () => apps.filter((app) => app.name.toLowerCase().includes(query.toLowerCase())),
    [apps, query],
  )

  const sendCommand = async (action: string, payload: Record<string, unknown> = {}) => {
    try {
      const result = await queueCommand(action, payload)
      if (result.delivered) notify('Command sent to your PC')
      else notify(result.reason === 'AGENT_OFFLINE' ? 'Windows agent is offline' : 'Command queued. Check connection settings.')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Command failed')
    }
  }
  const runAction = (name: string, action: string) => {
    if (action !== 'Launch') return notify('This action is not available yet')
    const appIds: Record<string, string> = { Spotify: 'spotify', Steam: 'steam', Discord: 'discord', Chrome: 'chrome' }
    const appId = appIds[name]
    if (!appId) return notify(name + ' is not configured in the Windows agent')
    void sendCommand('app.launch', { app_id: appId })
  }
  const toggleFavorite = (name: string) =>
    setApps((current) => current.map((app) => app.name === name ? { ...app, favorite: !app.favorite } : app))

  return (
    <div className="app-shell" style={{ '--accent': accent, fontFamily: font === 'Inter' ? 'Inter, system-ui, sans-serif' : font } as React.CSSProperties}>
      <header className="topbar">
        <div className="brand-mark"><Command size={17} strokeWidth={2.4} /></div>
        <div className="brand-copy"><span className="brand-name">homepilot</span><span className="brand-caption">PERSONAL CONTROL</span></div>
        <button className="icon-button top-action" onClick={() => setTab('settings')} aria-label="Settings"><SlidersHorizontal size={18} /></button>
      </header>

      <main className="content">
        {tab === 'home' && <>
          <section className="welcome-row">
            <div><p className="eyebrow">CONTROL CENTER</p><h1>Your space.</h1><p className="muted">Everything within reach.</p></div>
            <div className={pcOnline ? "offline-pill online" : "offline-pill"}><span /> {pcOnline ? "Online" : "Offline"}</div>
          </section>
          <section className="pc-card">
            <div className="pc-card-top"><div className="pc-icon"><Monitor size={21} /></div><span className="card-kicker">YOUR COMPUTER</span><MoreHorizontal size={19} className="subtle-icon" /></div>
            <div className="pc-title-row"><div><h2>DESKTOP</h2><p>Windows workstation</p></div><div className={pcOnline ? "status-label online" : "status-label"}><span /> {pcOnline ? "ONLINE" : "OFFLINE"}</div></div>
            <div className="pc-divider" />
            <div className="pc-footer"><span>{pcOnline ? "Agent connected" : "Agent disconnected"}</span><button className="text-button" onClick={() => notify('PC is offline')}>Details <ChevronRight size={15} /></button></div>
          </section>
          <section className="section-block">
            <div className="section-heading"><div><p className="eyebrow">QUICK ACCESS</p><h2>Favorites</h2></div><button className="link-button" onClick={() => setTab('apps')}>All apps <ChevronRight size={15} /></button></div>
            <div className="app-grid">{apps.filter(a => a.favorite).map(app => <AppTile key={app.name} app={app} onClick={() => runAction(app.name, 'Launch')} />)}</div>
          </section>
          <section className="section-block media-preview">
            <div className="section-heading"><div><p className="eyebrow">NOW PLAYING</p><h2>Media</h2></div><button className="link-button" onClick={() => setTab('media')}>Open player <ChevronRight size={15} /></button></div>
            <div className="media-inline"><div className="album-placeholder"><Disc3 size={24} /></div><div className="track-copy"><strong>No active session</strong><span>Start playing something on your PC</span></div><button className="round-control" onClick={() => void sendCommand('media.playPause')}><Play size={16} fill="currentColor" /></button></div>
          </section>
        </>}

        {tab === 'apps' && <>
          <PageHeading eyebrow="LIBRARY" title="Applications" subtitle="Your desktop, one tap away." />
          <label className="search-box"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find an application" /><span>⌘ K</span></label>
          <div className="app-list">{filteredApps.map(app => <div className="app-row" key={app.name}><AppIcon app={app} /><div className="app-row-copy"><strong>{app.name}</strong><span>{app.subtitle}</span></div><button className={app.favorite ? 'favorite active' : 'favorite'} onClick={() => toggleFavorite(app.name)} aria-label="Toggle favorite">★</button><button className="launch-button" onClick={() => runAction(app.name, 'Launch')}>Open</button><button className="more-button" onClick={() => runAction(app.name, 'More actions')}><MoreHorizontal size={19} /></button></div>)}</div>
          <button className="add-app" onClick={() => notify('Custom app setup will be available after agent pairing')}><Plus size={18} /> Add application</button>
        </>}

        {tab === 'media' && <>
          <PageHeading eyebrow="LISTENING ROOM" title="Media" subtitle="Control playback across Windows." />
          <div className="player-card"><div className="large-album"><Disc3 size={54} strokeWidth={1.1} /></div><p className="eyebrow center">WINDOWS MEDIA SESSION</p><h2 className="empty-track">Nothing playing</h2><p className="muted center">Start playback on your computer to see track details here.</p><div className="progress-track"><span /></div><div className="player-controls"><button onClick={() => void sendCommand('media.previous')}><SkipBack size={22} /></button><button className="play-main" onClick={() => { setPlaying(!playing); void sendCommand('media.playPause') }}>{playing ? <AudioLines size={23} /> : <Play size={22} fill="currentColor" />}</button><button onClick={() => void sendCommand('media.next')}><SkipForward size={22} /></button></div></div>
          <div className="volume-card"><div className="volume-head"><div><Volume2 size={18} /><strong>System volume</strong></div><span>{volume}%</span></div><input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))} onMouseUp={() => void sendCommand("media.volume.set", { value: volume })} onTouchEnd={() => void sendCommand("media.volume.set", { value: volume })} /><div className="volume-foot"><button onClick={() => void sendCommand("media.volume.mute")}><VolumeX size={16} /><span>Toggle mute</span></button><span>Windows master volume</span></div></div>
        </>}

        {tab === 'system' && <>
          <PageHeading eyebrow="SYSTEM" title="Power controls" subtitle="Manage your Windows session." />
          <div className="system-notice"><div className="notice-icon"><Power size={19} /></div><div><strong>{pcOnline ? "Computer is connected" : "Computer is offline"}</strong><span>{pcOnline ? "Windows agent is ready for commands." : "Start the Windows agent to enable power actions."}</span></div></div>
          <div className="power-list">
            <PowerRow icon={Lock} title="Lock computer" description="Lock your Windows session" onClick={() => void sendCommand('system.lock')} />
            <PowerRow icon={Moon} title="Sleep" description="Put the computer into sleep mode" onClick={() => void sendCommand('system.sleep')} />
            <PowerRow icon={CirclePower} title="Hibernate" description="Save session and power off" onClick={() => void sendCommand('system.hibernate')} />
            <PowerRow icon={RefreshCw} title="Restart" description="Restart Windows" danger onClick={() => notify('Restart is disabled in this build')} />
            <PowerRow icon={Power} title="Shut down" description="Turn off the computer" danger onClick={() => notify('Shutdown is disabled in this build')} />
          </div>
        </>}

        {tab === 'settings' && <>
          <PageHeading eyebrow="PREFERENCES" title="Settings" subtitle="Make HomePilot feel like yours." />
          <div className="settings-group"><p className="eyebrow">APPEARANCE</p><div className="setting-row"><div><strong>Accent color</strong><span>Choose a subtle highlight</span></div><div className="swatches">{['#8f263f', '#a46a36', '#526d83', '#68745b', '#77717f'].map(color => <button key={color} className={accent === color ? 'swatch selected' : 'swatch'} style={{ background: color }} onClick={() => setAccent(color)} aria-label={color} />)}</div></div><div className="setting-row"><div><strong>Font</strong><span>Interface typography</span></div><select value={font} onChange={e => setFont(e.target.value)}><option>Inter</option><option>Arial</option><option>Georgia</option></select></div></div>
          <div className="settings-group"><p className="eyebrow">CONNECTION</p><div className="setting-row"><div><strong>HomePilot server URL</strong><span>HTTPS address from your Cloudflare Tunnel</span></div><input aria-label="HomePilot server URL" value={serverUrl} onChange={e => setServerUrl(e.target.value)} onBlur={() => { setApiUrl(serverUrl); getHome().then(state => setPcOnline(state.agent.status === "online")).catch(error => notify(error instanceof Error ? error.message : "Connection failed")); notify("Server URL saved") }} placeholder="https://your-tunnel.trycloudflare.com" /></div><div className="setting-row"><div><strong>Windows server</strong><span>{pcOnline ? 'Connected to this device' : 'Not paired with this device'}</span></div><span className="tag-offline">OFFLINE</span></div><div className="setting-row"><div><strong>Telegram account</strong><span>Authenticated through your Telegram session</span></div><ExternalLink size={16} className="subtle-icon" /></div></div>
          <div className="settings-group"><p className="eyebrow">ABOUT</p><div className="setting-row"><div><strong>HomePilot</strong><span>Early access · v0.1.0</span></div><span className="version-tag">0.1.0</span></div></div>
        </>}
      </main>

      <nav className="bottom-nav">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? 'nav-item active' : 'nav-item'} onClick={() => setTab(id)}><Icon size={19} strokeWidth={tab === id ? 2.3 : 1.8} /><span>{label}</span></button>)}</nav>
      {toast && <div className="toast"><span className="toast-dot" />{toast}<button onClick={() => setToast('')}><X size={14} /></button></div>}
    </div>
  )
}

function AppIcon({ app }: { app: AppItem }) {
  return <div className="app-icon" style={{ '--app-color': app.color } as React.CSSProperties}><span>{app.icon}</span></div>
}
function AppTile({ app, onClick }: { app: AppItem; onClick: () => void }) {
  return <button className="app-tile" onClick={onClick}><AppIcon app={app} /><span>{app.name}</span><span className="tile-dot" /></button>
}
function PageHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <section className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{subtitle}</p></section>
}
function PowerRow({ icon: Icon, title, description, danger, onClick }: { icon: typeof Lock; title: string; description: string; danger?: boolean; onClick: () => void }) {
  return <button className="power-row" onClick={onClick}><div className={danger ? 'power-icon danger' : 'power-icon'}><Icon size={18} /></div><div><strong>{title}</strong><span>{description}</span></div><ChevronRight size={17} className="subtle-icon" /></button>
}

export default App
