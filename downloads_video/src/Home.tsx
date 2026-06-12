import React, { useState} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Page = 'home' | 'download' | 'history' | 'about' | 'settings';
type Platform = 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'facebook' | 'instagram_story' | 'facebook_story';
type Quality = '4k' | '1080p' | '720p' | '480p' | '360p' | 'audio';

interface DownloadItem {
  id: string;
  platform: Platform;
  url: string;
  filename: string;
  status: 'done' | 'failed';
  size: string;
  date: string;
  quality: Quality;
  thumb: string;
}

interface Settings {
  defaultQuality: Quality;
  autoDownload: boolean;
  darkMode: boolean;
  notificationsEnabled: boolean;
  defaultPlatform: Platform;
  downloadPath: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { name: 'YouTube',           key: 'youtube'          as Platform, icon: '▶', color: '#FF0000', bg: '#fff0f0', desc: 'Videos, Shorts & Playlists' },
  { name: 'TikTok',            key: 'tiktok'           as Platform, icon: '♪', color: '#010101', bg: '#f0f0f0', desc: 'Trending Videos'             },
  { name: 'Instagram',         key: 'instagram'        as Platform, icon: '◈', color: '#C13584', bg: '#fdf0f8', desc: 'Posts & Reels'               },
  { name: 'Twitter / X',       key: 'twitter'          as Platform, icon: '✕', color: '#000000', bg: '#f5f5f5', desc: 'Tweets with Media'           },
  { name: 'Facebook',          key: 'facebook'         as Platform, icon: 'f', color: '#1877F2', bg: '#f0f5ff', desc: 'Videos & Posts'              },
  { name: 'IG Stories',        key: 'instagram_story'  as Platform, icon: '○', color: '#F56040', bg: '#fff5f0', desc: 'Story Highlights'            },
  { name: 'FB Stories',        key: 'facebook_story'   as Platform, icon: '◎', color: '#1877F2', bg: '#f0f5ff', desc: 'Story Content'               },
];

const QUALITIES: { key: Quality; label: string; badge: string }[] = [
  { key: '4k',    label: '4K Ultra HD', badge: '4K'   },
  { key: '1080p', label: '1080p Full HD', badge: 'FHD' },
  { key: '720p',  label: '720p HD',     badge: 'HD'   },
  { key: '480p',  label: '480p SD',     badge: 'SD'   },
  { key: '360p',  label: '360p Low',   badge: 'LQ'   },
  { key: 'audio', label: 'Audio Only',  badge: '♪'    },
];

const URL_PATTERNS: Record<Platform, RegExp> = {
  youtube:          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)[^"&?/\s]{11}/,
  tiktok:           /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
  instagram:        /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/[\w-]+/,
  instagram_story:  /(?:https?:\/\/)?(?:www\.)?instagram\.com\/stories\/[\w.-]+/,
  twitter:          /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[\w]+\/status\/\d+/,
  facebook:         /(?:https?:\/\/)?(?:www\.|web\.|m\.)?(?:facebook\.com\/(?:share\/[rvp]\/[\w-]+|watch\/?\?v=\d+|reel\/\d+|[\w.-]+\/videos\/|[\w.-]+\/posts\/|video\.php\?v=\d+)|fb\.watch\/[\w-]+)/,
  facebook_story:   /(?:https?:\/\/)?(?:www\.)?facebook\.com\/stories\/\d+/,
};

const MOCK_HISTORY: DownloadItem[] = [
  { id: '1', platform: 'youtube', url: 'https://youtube.com/watch?v=abc', filename: 'Big Buck Bunny.mp4',        status: 'done',   size: '128 MB', date: '2026-05-13', quality: '1080p', thumb: '' },
  { id: '2', platform: 'tiktok',  url: 'https://tiktok.com/@x/video/1',  filename: 'Dance Challenge.mp4',       status: 'done',   size: '14 MB',  date: '2026-05-12', quality: '720p',  thumb: '' },
  { id: '3', platform: 'instagram',url: 'https://instagram.com/p/abc',    filename: 'IG Reel.mp4',               status: 'failed', size: '—',      date: '2026-05-12', quality: '720p',  thumb: '' },
  { id: '4', platform: 'twitter', url: 'https://x.com/user/status/1',    filename: 'Twitter Clip.mp4',          status: 'done',   size: '22 MB',  date: '2026-05-11', quality: '480p',  thumb: '' },
  { id: '5', platform: 'facebook',url: 'https://facebook.com/p/v/1',     filename: 'FB Video.mp4',              status: 'done',   size: '55 MB',  date: '2026-05-10', quality: '1080p', thumb: '' },
  { id: '6', platform: 'youtube', url: 'https://youtube.com/watch?v=xyz', filename: 'Nature Documentary.mp4',   status: 'done',   size: '340 MB', date: '2026-05-09', quality: '4k',    thumb: '' },
];

const platformColor = (k: Platform) => PLATFORMS.find(p => p.key === k)?.color ?? '#999';
const platformName  = (k: Platform) => PLATFORMS.find(p => p.key === k)?.name  ?? k;
const platformIcon  = (k: Platform) => PLATFORMS.find(p => p.key === k)?.icon  ?? '?';

// ─── Shared UI Components ─────────────────────────────────────────────────────

const Badge: React.FC<{ color?: string; children: React.ReactNode }> = ({ color = '#6366f1', children }) => (
  <span style={{
    background: color + '18',
    color,
    border: `1px solid ${color}33`,
    padding: '2px 10px',
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  }}>{children}</span>
);

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; className?: string }> = ({ children, style, className }) => (
  <div className={className} style={{
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(18px)',
    borderRadius: 20,
    border: '1.5px solid rgba(255,255,255,0.9)',
    boxShadow: '0 4px 32px rgba(80,60,180,0.07), 0 1.5px 6px rgba(0,0,0,0.04)',
    padding: 28,
    ...style,
  }}>{children}</div>
);

const GlassNav: React.FC<{ page: Page; setPage: (p: Page) => void; dark: boolean; setDark: (v: boolean) => void }> = ({ page, setPage, dark, setDark }) => {
  const navItems: { key: Page; label: string; icon: string }[] = [
    { key: 'home',     label: 'Home',     icon: '⌂'  },
    { key: 'download', label: 'Download', icon: '↓'  },
    // { key: 'history',  label: 'History',  icon: '⧗'  },
    { key: 'about',    label: 'About',    icon: '◉'  },
    { key: 'settings', label: 'Settings', icon: '⚙'  },
  ];
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: dark ? 'rgba(14,12,24,0.88)' : 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(24px)',
      borderBottom: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
      padding: '0 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 62,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, color: '#fff', fontSize: 14, letterSpacing: -0.5,
        }}>VM</div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: dark ? '#e8e3ff' : '#1a0a3e' }}>
          VideoMaster
        </span>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {navItems.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)} style={{
            padding: '6px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
            background: page === n.key
              ? 'linear-gradient(135deg,#7c3aed22,#2563eb22)'
              : 'transparent',
            color: page === n.key
              ? (dark ? '#a78bfa' : '#5b21b6')
              : (dark ? '#9ca3af' : '#6b7280'),
            borderBottom: page === n.key ? '2px solid #7c3aed' : '2px solid transparent',
            transition: 'all 0.18s',
          }}>
            <span style={{ marginRight: 5 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>

      <button onClick={() => setDark(!dark)} style={{
        background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        border: 'none', borderRadius: 50, width: 36, height: 36,
        cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {dark ? '☀' : '☽'}
      </button>
    </nav>
  );
};

// ─── PAGE: Home ───────────────────────────────────────────────────────────────

const HomePage: React.FC<{ setPage: (p: Page) => void; dark: boolean }> = ({ setPage, dark }) => {
  const stats = [
    { val: '50M+', label: 'Downloads', icon: '↓' },
    { val: '7',    label: 'Platforms',  icon: '◈' },
    { val: '4K',   label: 'Max Quality',icon: '◉' },
    { val: '0',    label: 'Ads',        icon: '✕' },
  ];
  const features = [
    { icon: '⚡', title: 'Instant Downloads', desc: 'Optimised pipeline gets you video files in seconds, not minutes.' },
    { icon: '🔒', title: 'Zero Tracking',     desc: 'No logs, no analytics, no fingerprinting. Your downloads stay yours.' },
    { icon: '🎯', title: 'Any Quality',        desc: 'From 360p to 4K UHD — pick exactly what you need.' },
    { icon: '♾',  title: 'No Limits',         desc: 'Download as many videos as you want. Free. Forever.' },
    { icon: '◈',  title: '7 Platforms',        desc: 'YouTube, TikTok, Instagram, Twitter, Facebook and more.' },
    { icon: '◎',  title: 'Audio Extraction',   desc: 'Strip just the audio track in high quality MP3 format.' },
  ];

  const c = dark;
  const bg = c ? '#0e0c18' : '#f7f5ff';
  const txt = c ? '#e8e3ff' : '#1a0a3e';
  const sub = c ? '#9ca3af' : '#6b7280';

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '60px 32px', fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ maxWidth: 860, margin: '0 auto 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '6px 16px',
          background: '#7c3aed18', border: '1px solid #7c3aed33', borderRadius: 99 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: '#7c3aed', display: 'inline-block' }} />
          <span style={{ color: '#7c3aed', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            No watermarks · No login
          </span>
        </div>

        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(48px,7vw,88px)', fontWeight: 900, lineHeight: 1.08,
          color: txt, letterSpacing: '-0.04em', margin: '0 0 24px' }}>
          Download Any Video<br />
          <span style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            From Anywhere
          </span>
        </h1>

        <p style={{ color: sub, fontSize: 20, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
          The fastest, cleanest way to save videos from YouTube, TikTok, Instagram and more — with zero compromise on quality or privacy.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setPage('download')} style={{
            padding: '14px 36px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff',
            fontWeight: 700, fontSize: 16, fontFamily: "'DM Sans',sans-serif",
            boxShadow: '0 8px 32px #7c3aed44',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 14px 40px #7c3aed55'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 8px 32px #7c3aed44'; }}
          >
            Start Downloading ↓
          </button>
          <button onClick={() => setPage('about')} style={{
            padding: '14px 36px', borderRadius: 14, cursor: 'pointer',
            background: 'transparent', border: `1.5px solid ${c ? '#ffffff22' : '#0000001a'}`,
            color: txt, fontWeight: 600, fontSize: 16, fontFamily: "'DM Sans',sans-serif",
          }}>
            Learn More
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 900, margin: '0 auto 80px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
        {stats.map(s => (
          <Card key={s.val} style={{ textAlign: 'center', padding: '28px 16px', background: c ? 'rgba(255,255,255,0.04)' : undefined, border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 900, color: txt, letterSpacing: '-0.04em' }}>{s.val}</div>
            <div style={{ color: sub, fontSize: 13, fontWeight: 500 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Platform strip */}
      <div style={{ maxWidth: 900, margin: '0 auto 80px' }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 34, fontWeight: 800, color: txt, textAlign: 'center', marginBottom: 32, letterSpacing: '-0.03em' }}>
          Supported Platforms
        </h2>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {PLATFORMS.map(p => (
            <div key={p.key} onClick={() => setPage('download')} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
              background: c ? 'rgba(255,255,255,0.05)' : p.bg,
              border: `1.5px solid ${p.color}33`,
              borderRadius: 14, cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${p.color}33`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              <span style={{ width: 32, height: 32, borderRadius: 9, background: p.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15 }}>{p.icon}</span>
              <span style={{ color: txt, fontWeight: 600, fontSize: 14 }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 34, fontWeight: 800, color: txt, textAlign: 'center', marginBottom: 32, letterSpacing: '-0.03em' }}>
          Why VideoMaster?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {features.map(f => (
            <Card key={f.title} style={{ background: c ? 'rgba(255,255,255,0.04)' : undefined, border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined }}>
              <div style={{ fontSize: 34, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: txt, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{f.title}</h3>
              <p style={{ color: sub, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── PAGE: Download ───────────────────────────────────────────────────────────

const DownloadPage: React.FC<{ dark: boolean; defaultPlatform: Platform; defaultQuality: Quality }> = ({ dark, defaultPlatform, defaultQuality }) => {
  const [platform, setPlatform] = useState<Platform>(defaultPlatform);
  const [url, setUrl]           = useState('');
  const [quality, setQuality]   = useState<Quality>(defaultQuality);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy]         = useState(false);
  const [phase, setPhase]       = useState<'idle'|'fetch'|'dl'>('idle');

  const c = dark;
  const bg = c ? '#0e0c18' : '#f7f5ff';
  const txt = c ? '#e8e3ff' : '#1a0a3e';
  const sub = c ? '#9ca3af' : '#6b7280';
  const inputBg = c ? 'rgba(255,255,255,0.05)' : '#fff';
  const borderCol = c ? 'rgba(255,255,255,0.1)' : '#e5e7eb';

  const validate = (): boolean => {
    if (!url.trim()) { setError('Please enter a URL.'); return false; }
    try { new URL(url); } catch { setError('Enter a valid URL.'); return false; }
    if (!URL_PATTERNS[platform].test(url)) {
      setError(`That doesn't look like a valid ${platformName(platform)} URL.`);
      return false;
    }
    return true;
  };

  const download = () => {
    setError(null); setSuccess(null); setProgress(0);
    if (!validate()) return;
    setBusy(true); setPhase('fetch');

    // Simulate fetching metadata
    setTimeout(() => {
      setPhase('dl');
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `http://127.0.0.1:8000/download/${platform}/`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.responseType = 'blob';
      xhr.onprogress = e => { if (e.lengthComputable) setProgress((e.loaded / e.total) * 100); };
      xhr.onload = () => {
        setBusy(false); setPhase('idle');
        if (xhr.status === 200) {
          const blob = new Blob([xhr.response], { type: 'video/mp4' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `${platform}_${Date.now()}.mp4`;
          document.body.appendChild(a); a.click(); a.remove();
          setSuccess('Video saved successfully!');
          setUrl(''); setProgress(0);
        } else {
          setError('Download failed. Check the URL and try again.');
        }
      };
      xhr.onerror = () => { setBusy(false); setPhase('idle'); setError('Network error. Please try again.'); };
      xhr.send(JSON.stringify({ url }));
    }, 900);
  };

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '48px 32px', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 900, color: txt, marginBottom: 8, letterSpacing: '-0.04em' }}>
          Download a Video
        </h1>
        <p style={{ color: sub, marginBottom: 40, fontSize: 15 }}>Select a platform, paste your link, choose quality — done.</p>

        {/* Platform grid */}
        <Card style={{ marginBottom: 24, background: c ? 'rgba(255,255,255,0.04)' : undefined, border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", color: txt, fontSize: 16, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
            1. Platform
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {PLATFORMS.map(p => {
              const active = platform === p.key;
              return (
                <button key={p.key} onClick={() => setPlatform(p.key)} style={{
                  padding: '14px 10px', borderRadius: 14, border: `2px solid ${active ? p.color : (c ? 'rgba(255,255,255,0.08)' : '#e5e7eb')}`,
                  background: active ? `${p.color}15` : 'transparent',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: active ? p.color : (c ? 'rgba(255,255,255,0.08)' : '#f3f4f6'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
                    color: active ? '#fff' : (c ? '#9ca3af' : '#6b7280'), fontWeight: 900, fontSize: 16 }}>
                    {p.icon}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: active ? p.color : (c ? '#9ca3af' : '#6b7280') }}>{p.name}</div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* URL input */}
        <Card style={{ marginBottom: 24, background: c ? 'rgba(255,255,255,0.04)' : undefined, border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", color: txt, fontSize: 16, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
            2. Video URL
          </h2>
          <div style={{ position: 'relative' }}>
            <input
              type="url"
              placeholder={`Paste your ${platformName(platform)} URL here…`}
              value={url}
              onChange={e => { setUrl(e.target.value); setError(null); }}
              disabled={busy}
              style={{
                width: '100%', padding: '14px 48px 14px 18px', borderRadius: 12,
                border: `1.5px solid ${error ? '#ef4444' : borderCol}`,
                background: inputBg, color: txt, fontSize: 15,
                fontFamily: "'DM Sans',sans-serif", outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { if (!error) e.target.style.borderColor = '#7c3aed'; }}
              onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : borderCol; }}
            />
            {url && (
              <button onClick={() => { setUrl(''); setError(null); }} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: sub, fontSize: 18,
              }}>✕</button>
            )}
          </div>

          {error && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10,
              background: '#ef444418', border: '1px solid #ef444433', color: '#ef4444', fontSize: 13, fontWeight: 600 }}>
              ⚠ {error}
            </div>
          )}
          {success && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10,
              background: '#22c55e18', border: '1px solid #22c55e33', color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
              ✓ {success}
            </div>
          )}
        </Card>

        {/* Quality */}
        <Card style={{ marginBottom: 24, background: c ? 'rgba(255,255,255,0.04)' : undefined, border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", color: txt, fontSize: 16, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
            3. Quality
          </h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {QUALITIES.map(q => {
              const active = quality === q.key;
              return (
                <button key={q.key} onClick={() => setQuality(q.key)} style={{
                  padding: '10px 20px', borderRadius: 10,
                  border: `1.5px solid ${active ? '#7c3aed' : borderCol}`,
                  background: active ? '#7c3aed18' : 'transparent',
                  color: active ? '#7c3aed' : (c ? '#9ca3af' : '#6b7280'),
                  fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: "'DM Sans',sans-serif",
                }}>
                  <span style={{ fontWeight: 900, marginRight: 6, color: active ? '#7c3aed' : '#94a3b8' }}>{q.badge}</span>
                  {q.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Progress */}
        {busy && (
          <Card style={{ marginBottom: 24, background: c ? 'rgba(255,255,255,0.04)' : undefined, border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: sub, fontSize: 13, fontWeight: 600 }}>
                {phase === 'fetch' ? '⟳ Fetching video info…' : `⬇ Downloading… ${progress.toFixed(1)}%`}
              </span>
              <span style={{ color: '#7c3aed', fontSize: 13, fontWeight: 700 }}>{progress.toFixed(0)}%</span>
            </div>
            <div style={{ height: 8, background: c ? 'rgba(255,255,255,0.08)' : '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: phase === 'fetch'
                  ? 'linear-gradient(90deg, #7c3aed, #2563eb, #7c3aed)'
                  : 'linear-gradient(90deg,#7c3aed,#2563eb)',
                width: phase === 'fetch' ? '100%' : `${progress}%`,
                transition: 'width 0.3s',
                backgroundSize: phase === 'fetch' ? '200% 100%' : undefined,
                animation: phase === 'fetch' ? 'shimmer 1.5s infinite' : undefined,
              }} />
            </div>
          </Card>
        )}

        <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

        {/* Download button */}
        <button onClick={download} disabled={busy || !url} style={{
          width: '100%', padding: '16px', borderRadius: 16, border: 'none', cursor: busy || !url ? 'not-allowed' : 'pointer',
          background: busy || !url ? (c ? 'rgba(255,255,255,0.06)' : '#f3f4f6') : 'linear-gradient(135deg,#7c3aed,#2563eb)',
          color: busy || !url ? (c ? '#4b5563' : '#9ca3af') : '#fff',
          fontWeight: 800, fontSize: 16, fontFamily: "'Syne',sans-serif", letterSpacing: '-0.01em',
          boxShadow: busy || !url ? 'none' : '0 8px 32px #7c3aed44',
          transition: 'all 0.2s',
        }}>
          {busy ? '⟳  Processing…' : '⬇  Download Video'}
        </button>
      </div>
    </div>
  );
};

// ─── PAGE: History ────────────────────────────────────────────────────────────

const HistoryPage: React.FC<{ dark: boolean }> = ({ dark }) => {
  const [items, setItems] = useState<DownloadItem[]>(MOCK_HISTORY);
  const [filter, setFilter] = useState<'all' | Platform | 'done' | 'failed'>('all');

  const c = dark;
  const bg = c ? '#0e0c18' : '#f7f5ff';
  const txt = c ? '#e8e3ff' : '#1a0a3e';
  const sub = c ? '#9ca3af' : '#6b7280';

  const filtered = items.filter(i => {
    if (filter === 'all') return true;
    if (filter === 'done' || filter === 'failed') return i.status === filter;
    return i.platform === filter;
  });

  const clearAll = () => setItems([]);
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const filterOpts = [
    { key: 'all' as const, label: 'All' },
    { key: 'done' as const, label: '✓ Done' },
    { key: 'failed' as const, label: '✕ Failed' },
    ...PLATFORMS.map(p => ({ key: p.key as any, label: p.name })),
  ];

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '48px 32px', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 900, color: txt, marginBottom: 6, letterSpacing: '-0.04em' }}>
              Download History
            </h1>
            <p style={{ color: sub, fontSize: 14 }}>{items.length} total downloads</p>
          </div>
          {items.length > 0 && (
            <button onClick={clearAll} style={{
              padding: '8px 18px', borderRadius: 10, border: '1.5px solid #ef444444',
              background: '#ef444410', color: '#ef4444', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
            }}>Clear All</button>
          )}
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {filterOpts.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '7px 16px', borderRadius: 99, border: 'none', cursor: 'pointer',
              background: filter === f.key ? '#7c3aed' : (c ? 'rgba(255,255,255,0.07)' : '#fff'),
              color: filter === f.key ? '#fff' : (c ? '#9ca3af' : '#6b7280'),
              fontWeight: 700, fontSize: 12, fontFamily: "'DM Sans',sans-serif",
              boxShadow: filter === f.key ? '0 2px 12px #7c3aed44' : 'none',
              border: filter === f.key ? 'none' : `1.5px solid ${c ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
            } as React.CSSProperties}>{f.label}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 60, background: c ? 'rgba(255,255,255,0.04)' : undefined, border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
            <p style={{ color: sub, fontSize: 16 }}>No downloads yet</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(item => {
              const color = platformColor(item.platform);
              const qualBadge = QUALITIES.find(q => q.key === item.quality)?.badge ?? item.quality;
              return (
                <Card key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px',
                  background: c ? 'rgba(255,255,255,0.04)' : undefined,
                  border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined,
                }}>
                  {/* Platform icon */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`,
                    border: `1.5px solid ${color}33`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 20, fontWeight: 900, color, flexShrink: 0 }}>
                    {platformIcon(item.platform)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: txt, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.filename}
                      </span>
                      <Badge color={item.status === 'done' ? '#22c55e' : '#ef4444'}>
                        {item.status}
                      </Badge>
                      <Badge color={color}>{qualBadge}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: 16, color: sub, fontSize: 12 }}>
                      <span>{platformName(item.platform)}</span>
                      <span>{item.size}</span>
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <button onClick={() => remove(item.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: sub,
                    fontSize: 16, padding: 6, borderRadius: 8,
                    transition: 'color 0.15s, background 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = '#ef444412'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = sub; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                  >✕</button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PAGE: About ──────────────────────────────────────────────────────────────

const AboutPage: React.FC<{ dark: boolean }> = ({ dark }) => {
  const c = dark;
  const bg = c ? '#0e0c18' : '#f7f5ff';
  const txt = c ? '#e8e3ff' : '#1a0a3e';
  const sub = c ? '#9ca3af' : '#6b7280';

  const steps = [
    { n: '01', title: 'Paste the URL', desc: 'Copy the link from any supported platform and paste it into the download box.' },
    { n: '02', title: 'Choose Quality', desc: 'Select your preferred resolution — from 360p to 4K, or audio-only.' },
    { n: '03', title: 'Download', desc: 'Hit the button. Your file is fetched and streamed directly to your device.' },
  ];

  const tech = ['yt-dlp', 'Django REST', 'React', 'TypeScript', 'Tailwind CSS'];

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '48px 32px', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 900, color: txt, marginBottom: 8, letterSpacing: '-0.04em' }}>
          About VideoMaster
        </h1>
        <p style={{ color: sub, fontSize: 16, lineHeight: 1.7, maxWidth: 600, marginBottom: 48 }}>
          VideoMaster is a privacy-first, open-source video downloader built on top of yt-dlp and a Django REST backend. No accounts, no ads, no nonsense.
        </p>

        {/* How it works */}
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: txt, marginBottom: 24, letterSpacing: '-0.03em' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 56 }}>
          {steps.map(s => (
            <Card key={s.n} style={{ background: c ? 'rgba(255,255,255,0.04)' : undefined, border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 40, fontWeight: 900,
                color: '#7c3aed', opacity: 0.25, marginBottom: 12, lineHeight: 1 }}>{s.n}</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: txt, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ color: sub, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
            </Card>
          ))}
        </div>

        {/* Privacy */}
        <Card style={{ marginBottom: 32, background: c ? 'rgba(255,255,255,0.04)' : undefined, border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: txt, marginBottom: 16, letterSpacing: '-0.03em' }}>
            🔒 Privacy Commitment
          </h2>
          <ul style={{ color: sub, fontSize: 14, lineHeight: 2.2, margin: 0, paddingLeft: 20 }}>
            <li>No user accounts required — ever.</li>
            <li>Downloaded files are streamed directly to you; nothing is stored server-side.</li>
            <li>No analytics, no telemetry, no third-party trackers.</li>
            <li>Temporary files are deleted immediately after the download response.</li>
          </ul>
        </Card>

        {/* Tech stack */}
        <Card style={{ background: c ? 'rgba(255,255,255,0.04)' : undefined, border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: txt, marginBottom: 16, letterSpacing: '-0.03em' }}>
            ⚙ Tech Stack
          </h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {tech.map(t => <Badge key={t} color="#7c3aed">{t}</Badge>)}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── PAGE: Settings ───────────────────────────────────────────────────────────

const SettingsPage: React.FC<{ settings: Settings; setSettings: (s: Settings) => void; dark: boolean }> = ({ settings, setSettings, dark }) => {
  const update = <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings({ ...settings, [k]: v });

  const c = dark;
  const bg = c ? '#0e0c18' : '#f7f5ff';
  const txt = c ? '#e8e3ff' : '#1a0a3e';
  const sub = c ? '#9ca3af' : '#6b7280';
  const inputBg = c ? 'rgba(255,255,255,0.05)' : '#fff';
  const borderCol = c ? 'rgba(255,255,255,0.1)' : '#e5e7eb';

  const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)} style={{
      width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer',
      background: value ? '#7c3aed' : (c ? 'rgba(255,255,255,0.12)' : '#d1d5db'),
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 99, background: '#fff',
        position: 'absolute', top: 3, left: value ? 25 : 3,
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  );

  const Row: React.FC<{ label: string; desc?: string; children: React.ReactNode }> = ({ label, desc, children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0',
      borderBottom: `1px solid ${c ? 'rgba(255,255,255,0.05)' : '#f3f4f6'}` }}>
      <div>
        <div style={{ color: txt, fontWeight: 600, fontSize: 14 }}>{label}</div>
        {desc && <div style={{ color: sub, fontSize: 12, marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );

  const Select: React.FC<{ value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }> = ({ value, onChange, options }) => (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${borderCol}`,
      background: inputBg, color: txt, fontSize: 13, fontWeight: 600, cursor: 'pointer',
      fontFamily: "'DM Sans',sans-serif", outline: 'none',
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '48px 32px', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 900, color: txt, marginBottom: 8, letterSpacing: '-0.04em' }}>
          Settings
        </h1>
        <p style={{ color: sub, fontSize: 15, marginBottom: 40 }}>Customise your VideoMaster experience.</p>

        {/* Appearance */}
        <Card style={{ marginBottom: 24, background: c ? 'rgba(255,255,255,0.04)' : undefined, border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", color: txt, fontSize: 16, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>
            Appearance
          </h2>
          <Row label="Dark Mode" desc="Switch between light and dark theme">
            <Toggle value={settings.darkMode} onChange={v => update('darkMode', v)} />
          </Row>
        </Card>

        {/* Downloads */}
        <Card style={{ marginBottom: 24, background: c ? 'rgba(255,255,255,0.04)' : undefined, border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", color: txt, fontSize: 16, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>
            Downloads
          </h2>
          <Row label="Default Quality" desc="Pre-selected quality on the download page">
            <Select value={settings.defaultQuality} onChange={v => update('defaultQuality', v as Quality)}
              options={QUALITIES.map(q => ({ value: q.key, label: q.label }))} />
          </Row>
          <Row label="Default Platform" desc="Platform selected when opening Downloads">
            <Select value={settings.defaultPlatform} onChange={v => update('defaultPlatform', v as Platform)}
              options={PLATFORMS.map(p => ({ value: p.key, label: p.name }))} />
          </Row>
          <Row label="Auto-start Download" desc="Begin downloading immediately after URL is validated">
            <Toggle value={settings.autoDownload} onChange={v => update('autoDownload', v)} />
          </Row>
          <Row label="Download Path" desc="Local folder to save files">
            <input value={settings.downloadPath} onChange={e => update('downloadPath', e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${borderCol}`,
                background: inputBg, color: txt, fontSize: 13, width: 200, fontFamily: "'DM Sans',sans-serif", outline: 'none' }} />
          </Row>
        </Card>

        {/* Notifications */}
        <Card style={{ background: c ? 'rgba(255,255,255,0.04)' : undefined, border: c ? '1.5px solid rgba(255,255,255,0.07)' : undefined }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", color: txt, fontSize: 16, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>
            Notifications
          </h2>
          <Row label="Download Notifications" desc="Show a notification when a download completes">
            <Toggle value={settings.notificationsEnabled} onChange={v => update('notificationsEnabled', v)} />
          </Row>
        </Card>

        {/* Reset */}
        <div style={{ marginTop: 32, textAlign: 'right' }}>
          <button onClick={() => setSettings({
            defaultQuality: '1080p', autoDownload: false, darkMode: false,
            notificationsEnabled: true, defaultPlatform: 'youtube', downloadPath: '~/Downloads',
          })} style={{
            padding: '10px 24px', borderRadius: 12, border: `1.5px solid ${borderCol}`,
            background: 'transparent', color: sub, fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── App Shell ────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [settings, setSettings] = useState<Settings>({
    defaultQuality: '1080p',
    autoDownload: false,
    darkMode: false,
    notificationsEnabled: true,
    defaultPlatform: 'youtube',
    downloadPath: '~/Downloads',
  });

  // Sync dark mode changes from settings page back to app
  const handleSetSettings = (s: Settings) => {
    setSettings(s);
  };

  const dark = settings.darkMode;

  return (
    <div
        style={{
          fontFamily: "'DM Sans',sans-serif",
          background: dark ? '#0e0c18' : '#f7f5ff',
          minHeight: '100vh',
        }}
      >
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
      <GlassNav page={page} setPage={setPage} dark={dark} setDark={d => setSettings(s => ({ ...s, darkMode: d }))} />

      {page === 'home'     && <HomePage     setPage={setPage} dark={dark} />}
      {page === 'download' && <DownloadPage dark={dark} defaultPlatform={settings.defaultPlatform} defaultQuality={settings.defaultQuality} />}
      {/* {page === 'history'  && <HistoryPage  dark={dark} />} */}
      {page === 'about'    && <AboutPage    dark={dark} />}
      {page === 'settings' && <SettingsPage settings={settings} setSettings={handleSetSettings} dark={dark} />}
    </div>
  );
};

export default App;