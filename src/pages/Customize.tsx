import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { resolveTheme } from '@/styles/theme';
import { toast } from 'sonner';
import { Save, RotateCcw, Eye } from 'lucide-react';

interface ThemeSettings {
  [key: string]: any;
  colors?: Record<string, string>;
  radii?: Record<string, string>;
  elevation?: Record<number, string>;
  effects?: Record<string, string>;
}

const STORAGE_KEY = 'theme-customization';

export default function Customize() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<ThemeSettings>({});
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
          const parsed = data.theme_settings as ThemeSettings;
          if (Object.keys(parsed).length > 0) {
            setSettings(parsed);
            applyTheme(parsed);
            setLoading(false);
            return;
          }
        }
      }

      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
        applyTheme(parsed);
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

  const handlePreview = () => {
    applyTheme(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success('Theme previewed locally');
  };

  const handleSaveToAccount = async () => {
    if (!user) {
      toast.error('You must be logged in to save');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme_settings: settings as any })
        .eq('id', user.id);

      if (error) throw error;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      applyTheme(settings);
      toast.success('Theme saved to your account');
    } catch (error) {
      console.error('Failed to save theme:', error);
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = async () => {
    const defaultTheme = resolveTheme('public');
    const defaultSettings: ThemeSettings = {
      colors: { ...defaultTheme.colors } as Record<string, string>,
      radii: { ...defaultTheme.radii } as Record<string, string>,
      elevation: { ...defaultTheme.elevation } as Record<number, string>,
      effects: Object.fromEntries(
        Object.entries(defaultTheme.effects).map(([k, v]) => [k, String(v)])
      ) as Record<string, string>,
    };

    setSettings(defaultSettings);
    applyTheme(defaultSettings);
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

    toast.success('Theme reverted to defaults');
  };

  const updateColor = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      colors: { ...(prev.colors || {}), [key]: value }
    }));
  };

  const updateRadius = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      radii: { ...(prev.radii || {}), [key]: value }
    }));
  };

  const updateElevation = (level: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      elevation: { ...(prev.elevation || {}), [level]: value }
    }));
  };

  const updateEffect = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      effects: { ...(prev.effects || {}), [key]: value }
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

  const defaultTheme = resolveTheme('public');

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Theme Customization</h1>
          <p className="text-muted-foreground">
            Customize your application's appearance with live preview
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Button onClick={handlePreview} variant="outline" className="gap-2">
            <Eye className="w-4 h-4" />
            Preview Locally
          </Button>
          <Button onClick={handleSaveToAccount} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save to Account'}
          </Button>
          <Button onClick={handleRevert} variant="destructive" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Revert to Defaults
          </Button>
        </div>

        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="radii">Radii</TabsTrigger>
            <TabsTrigger value="elevation">Elevation</TabsTrigger>
            <TabsTrigger value="effects">Glass Effects</TabsTrigger>
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
                        value={settings.colors?.[key] || defaultValue}
                        onChange={(e) => updateColor(key, e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={settings.colors?.[key] || defaultValue}
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
                      value={settings.radii?.[key] || defaultValue}
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
                      value={settings.elevation?.[Number(level)] || defaultValue}
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
                  const isNumeric = !defaultValue.includes('hsl') && !defaultValue.includes('rgba');
                  
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
                            max={key.includes('Blur') ? 50 : 2}
                            step={key.includes('Blur') ? 1 : 0.1}
                            value={[parseFloat(settings.effects?.[key as keyof typeof settings.effects] || defaultValue)]}
                            onValueChange={([value]) => updateEffect(key, value.toString())}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground w-12">
                            {settings.effects?.[key as keyof typeof settings.effects] || defaultValue}
                          </span>
                        </div>
                      ) : (
                        <Input
                          id={`effect-${key}`}
                          type="text"
                          value={settings.effects?.[key as keyof typeof settings.effects] || defaultValue}
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
        </Tabs>
      </div>
    </div>
  );
}
