import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { supabase } from '@/integrations/supabase/client';
import { resolveTheme } from '@/styles/theme';
import { toast } from 'sonner';
import { Save, RotateCcw, Eye, BookOpen } from 'lucide-react';

interface ThemeSettings {
  [key: string]: any;
  colors?: Record<string, string>;
  radii?: Record<string, string>;
  elevation?: Record<number, string>;
  effects?: Record<string, string>;
}

interface ModeThemeSettings {
  public: ThemeSettings;
  business: ThemeSettings;
}

const STORAGE_KEY = 'theme-customization';

export default function Customize() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mode: appMode, setMode: setAppMode } = useAppMode();
  const [editingMode, setEditingMode] = useState<'public' | 'business'>(appMode);
  const [settings, setSettings] = useState<ModeThemeSettings>({
    public: {},
    business: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Switch app mode when editing mode changes
  useEffect(() => {
    setAppMode(editingMode);
  }, [editingMode, setAppMode]);

  const loadSettings = async () => {
    try {
      // Try Supabase first
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('theme_settings')
          .eq('id', user.id)
          .single();

        if (!error && data?.theme_settings && typeof data.theme_settings === 'object') {
          const parsed = data.theme_settings as any;
          if (parsed.public || parsed.business) {
            setSettings({
              public: parsed.public || {},
              business: parsed.business || {},
            });
            applyTheme(parsed[editingMode] || {});
            setLoading(false);
            return;
          }
        }
      }

      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.public || parsed.business) {
          setSettings(parsed);
          applyTheme(parsed[editingMode] || {});
        }
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
      toast.error('Failed to load theme settings');
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (themeSettings: ThemeSettings) => {
    const root = document.documentElement.style;

    // Apply colors
    if (themeSettings.colors) {
      Object.entries(themeSettings.colors).forEach(([key, value]) => {
        root.setProperty(`--${key}`, value);
      });
    }

    // Apply radii
    if (themeSettings.radii) {
      Object.entries(themeSettings.radii).forEach(([key, value]) => {
        root.setProperty(`--radius-${key}`, value);
      });
    }

    // Apply elevation
    if (themeSettings.elevation) {
      Object.entries(themeSettings.elevation).forEach(([key, value]) => {
        root.setProperty(`--elevation-${key}`, value);
      });
    }

    // Apply glass effects
    if (themeSettings.effects) {
      Object.entries(themeSettings.effects).forEach(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.setProperty(`--${cssKey}`, value);
      });
    }
  };

  const handleModeSwitch = (mode: 'public' | 'business') => {
    setEditingMode(mode);
    applyTheme(settings[mode]);
  };

  const handlePreview = () => {
    applyTheme(settings[editingMode]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success(`${editingMode.charAt(0).toUpperCase() + editingMode.slice(1)} theme previewed locally`);
  };

  const handleSaveToAccount = async () => {
    if (!user) {
      toast.error('You must be logged in to save');
      return;
    }

    setSaving(true);
    try {
      // Use upsert to create row if it doesn't exist
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, theme_settings: settings as any });

      if (error) throw error;

      // Persist to localStorage as well
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      
      // Apply current theme and reload settings to pick up stored values
      applyTheme(settings[editingMode]);
      await loadSettings();
      
      toast.success('Both themes saved to your account');
    } catch (error) {
      console.error('Failed to save theme:', error);
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = async () => {
    const defaultPublicTheme = resolveTheme('public');
    const defaultBusinessTheme = resolveTheme('business');
    
    const defaultSettings: ModeThemeSettings = {
      public: {
        colors: { ...defaultPublicTheme.colors } as Record<string, string>,
        radii: { ...defaultPublicTheme.radii } as Record<string, string>,
        elevation: { ...defaultPublicTheme.elevation } as Record<number, string>,
        effects: Object.fromEntries(
          Object.entries(defaultPublicTheme.effects).map(([k, v]) => [k, String(v)])
        ) as Record<string, string>,
      },
      business: {
        colors: { ...defaultBusinessTheme.colors } as Record<string, string>,
        radii: { ...defaultBusinessTheme.radii } as Record<string, string>,
        elevation: { ...defaultBusinessTheme.elevation } as Record<number, string>,
        effects: Object.fromEntries(
          Object.entries(defaultBusinessTheme.effects).map(([k, v]) => [k, String(v)])
        ) as Record<string, string>,
      },
    };

    setSettings(defaultSettings);
    applyTheme(defaultSettings[editingMode]);
    localStorage.removeItem(STORAGE_KEY);

    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ theme_settings: {} })
          .eq('id', user.id);
      } catch (error) {
        console.error('Failed to clear saved theme:', error);
      }
    }

    toast.success('Both themes reverted to defaults');
  };

  const updateColor = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [editingMode]: {
        ...prev[editingMode],
        colors: { ...(prev[editingMode].colors || {}), [key]: value }
      }
    }));
  };

  const updateRadius = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [editingMode]: {
        ...prev[editingMode],
        radii: { ...(prev[editingMode].radii || {}), [key]: value }
      }
    }));
  };

  const updateElevation = (level: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      [editingMode]: {
        ...prev[editingMode],
        elevation: { ...(prev[editingMode].elevation || {}), [level]: value }
      }
    }));
  };

  const updateEffect = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [editingMode]: {
        ...prev[editingMode],
        effects: { ...(prev[editingMode].effects || {}), [key]: value }
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading theme settings...</p>
        </div>
      </div>
    );
  }

  const defaultTheme = resolveTheme(editingMode);
  const currentSettings = settings[editingMode];

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-background pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Theme Customization</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Customize your application's appearance with live preview
          </p>
        </div>

        {/* Mode Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Editing: {editingMode.charAt(0).toUpperCase() + editingMode.slice(1)} Mode</CardTitle>
            <CardDescription>Switch between Public and Business themes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={() => handleModeSwitch('public')}
                variant={editingMode === 'public' ? 'default' : 'outline'}
                className="flex-1 w-full"
              >
                Public Mode
              </Button>
              <Button
                onClick={() => handleModeSwitch('business')}
                variant={editingMode === 'business' ? 'default' : 'outline'}
                className="flex-1 w-full"
              >
                Business Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <Button onClick={handlePreview} variant="outline" className="gap-2 w-full sm:w-auto">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview Locally</span>
            <span className="sm:hidden">Preview</span>
          </Button>
          <Button onClick={handleSaveToAccount} disabled={saving} className="gap-2 w-full sm:w-auto">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save to Account'}
          </Button>
          <Button onClick={handleRevert} variant="destructive" className="gap-2 w-full sm:w-auto">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Revert to Defaults</span>
            <span className="sm:hidden">Reset</span>
          </Button>
        </div>

        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <TabsTrigger value="colors" className="text-xs sm:text-sm">Colors</TabsTrigger>
            <TabsTrigger value="radii" className="text-xs sm:text-sm">Radii</TabsTrigger>
            <TabsTrigger value="elevation" className="text-xs sm:text-sm">Elevation</TabsTrigger>
            <TabsTrigger value="effects" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Glass Effects</span>
              <span className="sm:hidden">Effects</span>
            </TabsTrigger>
            <TabsTrigger value="guide" className="text-xs sm:text-sm col-span-2 sm:col-span-1">
              <BookOpen className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Guide</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Color Tokens</CardTitle>
                <CardDescription>Customize the color palette</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                {Object.entries(defaultTheme.colors).map(([key, defaultValue]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`color-${key}`} className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`color-${key}`}
                        type="color"
                        value={currentSettings.colors?.[key] || defaultValue}
                        onChange={(e) => updateColor(key, e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={currentSettings.colors?.[key] || defaultValue}
                        onChange={(e) => updateColor(key, e.target.value)}
                        className="flex-1"
                        placeholder={defaultValue}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="radii" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Border Radii</CardTitle>
                <CardDescription>Adjust corner roundness</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                {Object.entries(defaultTheme.radii).map(([key, defaultValue]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`radius-${key}`} className="capitalize">
                      {key} ({defaultValue})
                    </Label>
                    <Input
                      id={`radius-${key}`}
                      type="text"
                      value={currentSettings.radii?.[key] || defaultValue}
                      onChange={(e) => updateRadius(key, e.target.value)}
                      placeholder={defaultValue}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="elevation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Elevation Shadows</CardTitle>
                <CardDescription>Configure shadow depths</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                {Object.entries(defaultTheme.elevation).map(([level, defaultValue]) => (
                  <div key={level} className="space-y-2">
                    <Label htmlFor={`elevation-${level}`}>
                      Level {level}
                    </Label>
                    <Input
                      id={`elevation-${level}`}
                      type="text"
                      value={currentSettings.elevation?.[Number(level)] || defaultValue}
                      onChange={(e) => updateElevation(Number(level), e.target.value)}
                      placeholder={defaultValue}
                      className="font-mono text-sm"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="effects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Glass Effects</CardTitle>
                <CardDescription>Adjust glass morphism properties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(defaultTheme.effects).map(([key, defaultValue]) => {
                  const valueStr = String(defaultValue);
                  const isNumeric = typeof defaultValue === 'number' || (!valueStr.includes('hsl') && !valueStr.includes('rgba'));
                  
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`effect-${key}`} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      {isNumeric ? (
                        <div className="flex gap-4 items-center">
                          <Slider
                            id={`effect-${key}`}
                            min={0}
                            max={key.includes('Blur') ? 50 : 20}
                            step={key.includes('Blur') ? 1 : 0.1}
                            value={[parseFloat(currentSettings.effects?.[key as keyof typeof currentSettings.effects] || defaultValue)]}
                            onValueChange={([value]) => updateEffect(key, value.toString())}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground w-12">
                            {currentSettings.effects?.[key as keyof typeof currentSettings.effects] || defaultValue}
                          </span>
                        </div>
                      ) : (
                        <Input
                          id={`effect-${key}`}
                          type="text"
                          value={currentSettings.effects?.[key as keyof typeof currentSettings.effects] || defaultValue}
                          onChange={(e) => updateEffect(key, e.target.value)}
                          placeholder={defaultValue}
                        />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guide" className="space-y-4">
            <Card className="backdrop-blur-sm hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Private Reference Guide
                </CardTitle>
                <CardDescription>
                  Your personal cheat sheet for theme tokens and design vocabulary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Colors Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Colors</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg border backdrop-blur-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-8 h-8 rounded-md border"
                          style={{ backgroundColor: currentSettings.colors?.background || defaultTheme.colors.background }}
                        />
                        <code className="text-sm font-mono">background</code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The main canvas — sets the overall page mood. Soft blue = dreamy public vibe.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border backdrop-blur-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-8 h-8 rounded-md border"
                          style={{ backgroundColor: currentSettings.colors?.surface || defaultTheme.colors.surface }}
                        />
                        <code className="text-sm font-mono">surface</code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cards & menus — elevated above background for depth.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border backdrop-blur-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-8 h-8 rounded-md border"
                          style={{ backgroundColor: currentSettings.colors?.accent || defaultTheme.colors.accent }}
                        />
                        <code className="text-sm font-mono">accent</code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Call-to-action color — buttons, links. Try #489FE3 for PB-blue.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border backdrop-blur-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-8 h-8 rounded-md border"
                          style={{ backgroundColor: currentSettings.colors?.accentOn || defaultTheme.colors.accentOn }}
                        />
                        <code className="text-sm font-mono">accentOn</code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Text on accent backgrounds — ensures readability.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Radii Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Border Radii</h3>
                  <div className="grid gap-3">
                    <div className="p-3 rounded-lg border backdrop-blur-sm">
                      <code className="text-sm font-mono font-semibold">sm (8px)</code>
                      <span className="text-sm text-muted-foreground ml-2">— Tight curves for badges</span>
                    </div>
                    <div className="p-3 rounded-lg border backdrop-blur-sm">
                      <code className="text-sm font-mono font-semibold">md (12px)</code>
                      <span className="text-sm text-muted-foreground ml-2">— Standard for buttons and inputs</span>
                    </div>
                    <div className="p-3 rounded-lg border backdrop-blur-sm">
                      <code className="text-sm font-mono font-semibold">lg (16px)</code>
                      <span className="text-sm text-muted-foreground ml-2">— Card curves for panels</span>
                    </div>
                    <div className="p-3 rounded-lg border backdrop-blur-sm">
                      <code className="text-sm font-mono font-semibold">xl (24px)</code>
                      <span className="text-sm text-muted-foreground ml-2">— Pronounced curves for hero sections</span>
                    </div>
                  </div>
                </div>

                {/* Elevation Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Elevation Levels</h3>
                  <div className="grid gap-3">
                    <div className="p-3 rounded-lg border backdrop-blur-sm" style={{ boxShadow: defaultTheme.elevation[1] }}>
                      <code className="text-sm font-mono font-semibold">1</code>
                      <span className="text-sm text-muted-foreground ml-2">— Hover states & slight separation</span>
                    </div>
                    <div className="p-3 rounded-lg border backdrop-blur-sm" style={{ boxShadow: defaultTheme.elevation[2] }}>
                      <code className="text-sm font-mono font-semibold">2</code>
                      <span className="text-sm text-muted-foreground ml-2">— Standard cards</span>
                    </div>
                    <div className="p-3 rounded-lg border backdrop-blur-sm" style={{ boxShadow: defaultTheme.elevation[8] }}>
                      <code className="text-sm font-mono font-semibold">8</code>
                      <span className="text-sm text-muted-foreground ml-2">— Overlays & popovers</span>
                    </div>
                    <div className="p-3 rounded-lg border backdrop-blur-sm" style={{ boxShadow: defaultTheme.elevation[16] }}>
                      <code className="text-sm font-mono font-semibold">16</code>
                      <span className="text-sm text-muted-foreground ml-2">— Modals & dialogs</span>
                    </div>
                    <div className="p-3 rounded-lg border backdrop-blur-sm" style={{ boxShadow: defaultTheme.elevation[24] }}>
                      <code className="text-sm font-mono font-semibold">24</code>
                      <span className="text-sm text-muted-foreground ml-2">— Spotlight cards & tooltips</span>
                    </div>
                  </div>
                </div>

                {/* Glass Effects Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Glass Effects</h3>
                  <div className="grid gap-3">
                    <div className="p-4 rounded-lg border backdrop-blur-sm">
                      <code className="text-sm font-mono font-semibold">glassBlur</code>
                      <span className="text-sm text-muted-foreground ml-2">— Frost level for backdrop blur</span>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Current: {currentSettings.effects?.glassBlur || defaultTheme.effects.glassBlur}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border backdrop-blur-sm">
                      <code className="text-sm font-mono font-semibold">warpDistortion</code>
                      <span className="text-sm text-muted-foreground ml-2">— iOS-style refraction intensity</span>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Current: {currentSettings.effects?.warpDistortion || defaultTheme.effects.warpDistortion}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border backdrop-blur-sm">
                      <code className="text-sm font-mono font-semibold">glassBg / glassBorder</code>
                      <span className="text-sm text-muted-foreground ml-2">— Translucent fill & edge definition</span>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Bg: {currentSettings.effects?.glassBg || defaultTheme.effects.glassBg}<br />
                        Border: {currentSettings.effects?.glassBorder || defaultTheme.effects.glassBorder}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="p-4 rounded-lg bg-muted/50 border backdrop-blur-sm">
                  <h4 className="font-semibold mb-2 text-foreground">Pro Tips</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Use HSL colors for easier theming (hsl(hue, saturation%, lightness%))</li>
                    <li>• Match glassBg opacity to background color for natural frosting</li>
                    <li>• Higher blur = dreamier public mode; lower = crisp business mode</li>
                    <li>• Test both light and dark modes after customization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
