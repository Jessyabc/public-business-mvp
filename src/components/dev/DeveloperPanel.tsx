import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppMode } from '@/contexts/AppModeContext';
import { useUserRoles } from '@/hooks/useUserRoles';

interface StylesheetInfo {
  href: string;
  disabled: boolean;
  ruleCount: number | string;
}

interface SelectorProbeResult {
  selector: string;
  found: boolean;
  computedStyles?: Record<string, string>;
  matchingRules?: Array<{ selectorText: string; source: string }>;
}

export function DeveloperPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [proofOfLife, setProofOfLife] = useState(false);
  const [stylesheets, setStylesheets] = useState<StylesheetInfo[]>([]);
  const [selectorInput, setSelectorInput] = useState('');
  const [probeResult, setProbeResult] = useState<SelectorProbeResult | null>(null);
  const { mode, setMode } = useAppMode();
  const navigate = useNavigate();
  const { isAdmin } = useUserRoles();
  
  const isDev = import.meta.env.DEV;
  const showCustomizeButton = isDev || isAdmin();

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Proof-of-life CSS injection
  useEffect(() => {
    const styleId = 'dev-panel-proof-of-life';
    if (proofOfLife) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = 'html { outline: 6px solid hotpink !important; }';
      document.head.appendChild(style);
    } else {
      const existing = document.getElementById(styleId);
      if (existing) existing.remove();
    }
    return () => {
      const existing = document.getElementById(styleId);
      if (existing) existing.remove();
    };
  }, [proofOfLife]);

  const loadStylesheets = () => {
    const sheets: StylesheetInfo[] = [];
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      let ruleCount: number | string = 0;
      try {
        ruleCount = sheet.cssRules?.length ?? 0;
      } catch {
        ruleCount = 'blocked (CORS)';
      }
      sheets.push({
        href: sheet.href || '(inline)',
        disabled: sheet.disabled,
        ruleCount,
      });
    }
    setStylesheets(sheets);
  };

  const forceReloadStylesheets = () => {
    const links = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
    links.forEach(link => {
      const url = new URL(link.href);
      url.searchParams.set('_cb', Date.now().toString());
      link.href = url.toString();
    });
    setTimeout(loadStylesheets, 500);
  };

  const runSelectorProbe = () => {
    if (!selectorInput.trim()) return;
    try {
      const el = document.querySelector(selectorInput);
      if (!el) {
        setProbeResult({ selector: selectorInput, found: false });
        return;
      }
      const computed = window.getComputedStyle(el);
      const props = ['display', 'position', 'color', 'background-color', 'font-size', 
                     'margin', 'padding', 'width', 'height', 'backdrop-filter', 'box-shadow'];
      const computedStyles: Record<string, string> = {};
      props.forEach(p => {
        computedStyles[p] = computed.getPropertyValue(p);
      });

      const matchingRules: Array<{ selectorText: string; source: string }> = [];
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        try {
          const rules = sheet.cssRules || [];
          for (let j = 0; j < Math.min(rules.length, 100); j++) {
            const rule = rules[j];
            if (rule instanceof CSSStyleRule) {
              try {
                if (el.matches(rule.selectorText)) {
                  matchingRules.push({
                    selectorText: rule.selectorText,
                    source: sheet.href || '(inline)',
                  });
                  if (matchingRules.length >= 12) break;
                }
              } catch {
                // Invalid selector
              }
            }
          }
          if (matchingRules.length >= 12) break;
        } catch {
          // CORS blocked
        }
      }
      setProbeResult({
        selector: selectorInput,
        found: true,
        computedStyles,
        matchingRules,
      });
    } catch (err) {
      setProbeResult({
        selector: selectorInput,
        found: false,
      });
    }
  };

  const exportDiagnostics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      mode,
      proofOfLife,
      environment: {
        userAgent: navigator.userAgent,
        href: window.location.href,
        NODE_ENV: process.env.NODE_ENV,
        VITE_ENV: import.meta.env,
      },
      stylesheets,
      lastProbeResult: probeResult,
      stylesheetUrls: Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
        .map(l => l.href),
      pageTitle: document.title,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (isOpen) loadStylesheets();
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 9999,
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 12,
          fontFamily: 'monospace',
        }}
        onClick={() => setIsOpen(true)}
      >
        Dev Console (Ctrl+Shift+D)
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 480,
        maxHeight: '80vh',
        overflowY: 'auto',
        zIndex: 9999,
        background: 'rgba(10, 15, 30, 0.95)',
        backdropFilter: 'blur(12px)',
        color: '#e0e0e0',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.2)',
        padding: 16,
        fontFamily: 'monospace',
        fontSize: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <strong style={{ fontSize: 14 }}>Owner Console</strong>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent',
            border: '1px solid #666',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      {/* Mode Switcher */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 4, fontWeight: 'bold' }}>Mode: {mode}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setMode('public')}
            style={{
              padding: '6px 12px',
              background: mode === 'public' ? '#0066cc' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Public
          </button>
          <button
            onClick={() => setMode('business')}
            style={{
              padding: '6px 12px',
              background: mode === 'business' ? '#0066cc' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Business
          </button>
        </div>
      </div>

      {/* Proof-of-Life */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={proofOfLife}
            onChange={(e) => setProofOfLife(e.target.checked)}
          />
          Proof-of-Life (hotpink outline)
        </label>
      </div>

      {/* Stylesheets */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 4, fontWeight: 'bold' }}>
          Stylesheets ({stylesheets.length})
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button
            onClick={loadStylesheets}
            style={{
              padding: '4px 8px',
              background: '#333',
              color: '#fff',
              border: '1px solid #666',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            Refresh
          </button>
          <button
            onClick={forceReloadStylesheets}
            style={{
              padding: '4px 8px',
              background: '#333',
              color: '#fff',
              border: '1px solid #666',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            Force Reload All
          </button>
        </div>
        <div
          style={{
            maxHeight: 150,
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.3)',
            padding: 8,
            borderRadius: 4,
            fontSize: 10,
          }}
        >
          {stylesheets.map((sheet, idx) => (
            <div key={idx} style={{ marginBottom: 4 }}>
              <div style={{ color: sheet.disabled ? '#888' : '#0cf' }}>
                {sheet.href}
              </div>
              <div style={{ color: '#aaa' }}>
                Rules: {sheet.ruleCount} | Disabled: {sheet.disabled ? 'Yes' : 'No'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selector Probe */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 4, fontWeight: 'bold' }}>Selector Probe</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="text"
            value={selectorInput}
            onChange={(e) => setSelectorInput(e.target.value)}
            placeholder="e.g. .glass-card"
            style={{
              flex: 1,
              padding: '4px 8px',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: '1px solid #666',
              borderRadius: 4,
            }}
            onKeyDown={(e) => e.key === 'Enter' && runSelectorProbe()}
          />
          <button
            onClick={runSelectorProbe}
            style={{
              padding: '4px 12px',
              background: '#0066cc',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Run
          </button>
        </div>
        {probeResult && (
          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              padding: 8,
              borderRadius: 4,
              fontSize: 10,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            {!probeResult.found ? (
              <div style={{ color: '#f66' }}>Element not found</div>
            ) : (
              <>
                <div style={{ marginBottom: 8, color: '#0cf' }}>Element found</div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Computed Styles:</strong>
                  {Object.entries(probeResult.computedStyles || {}).map(([k, v]) => (
                    <div key={k} style={{ marginLeft: 8 }}>
                      {k}: {v}
                    </div>
                  ))}
                </div>
                {probeResult.matchingRules && probeResult.matchingRules.length > 0 && (
                  <div>
                    <strong>Matching Rules:</strong>
                    {probeResult.matchingRules.map((rule, idx) => (
                      <div key={idx} style={{ marginLeft: 8, marginBottom: 4 }}>
                        <div style={{ color: '#0cf' }}>{rule.selectorText}</div>
                        <div style={{ color: '#aaa' }}>from: {rule.source}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Export */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {showCustomizeButton && (
          <button
            onClick={() => navigate('/customize')}
            style={{
              width: '100%',
              padding: '8px',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            🎨 Customize Theme
          </button>
        )}
        <button
          onClick={exportDiagnostics}
          style={{
            width: '100%',
            padding: '8px',
            background: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Export Diagnostics
        </button>
      </div>
    </div>
  );
}
