import { useEffect, useState } from 'react';

const COOKIE_KEY = 'cookie_preferences';

const defaultPreferences = {
  analytics: false,
};

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      setVisible(true);
    } else {
      const parsed = JSON.parse(stored);
      setPreferences(parsed);
      applyConsent(parsed);
    }
  }, []);

  const applyConsent = (prefs) => {
    if (!window.gtag) return;

    window.gtag('consent', 'update', {
      analytics_storage: prefs.analytics ? 'granted' : 'denied',
      ad_storage: 'denied',
    });
  };

  const savePreferences = (prefs) => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(prefs));
    applyConsent(prefs);
    setVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    const prefs = { analytics: true };
    savePreferences(prefs);
  };

  const denyAll = () => {
    const prefs = { analytics: false };
    savePreferences(prefs);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto bg-card border rounded-lg shadow-xl p-5 z-50">
      {!showSettings ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            We use cookies to improve user experience and analyze website traffic.
            You can manage your preferences at any time.
          </p>

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={denyAll}
              className="px-4 py-2 border rounded-md text-sm"
            >
              Deny
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 border rounded-md text-sm"
            >
              Settings
            </button>

            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Accept All
            </button>
          </div>
        </>
      ) : (
        <>
          <h4 className="text-sm font-semibold mb-3">Cookie Preferences</h4>

          <label className="flex items-center justify-between mb-4">
            <span className="text-sm">
              Analytics Cookies
              <br />
              <span className="text-xs text-muted-foreground">
                Help us understand how visitors interact with the site.
              </span>
            </span>
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={(e) =>
                setPreferences({ ...preferences, analytics: e.target.checked })
              }
            />
          </label>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => savePreferences(preferences)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Save Preferences
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CookieConsent;
