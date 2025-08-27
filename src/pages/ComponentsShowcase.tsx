import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { GlassCard } from '@/ui/components/GlassCard';
import { 
  AlertCircle,
  CheckCircle,
  Info,
  Palette,
  Sparkles,
  Eye,
  EyeOff,
  Star,
  Heart,
  Zap,
  Shield,
  Crown,
  Gem,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const glassVariants = [
  { name: 'Default Glass Card', className: 'glass-card' },
  { name: 'Glass Distort', className: 'glass-card glass-distort' },
  { name: 'Glass Liquid', className: 'glass-card glass-liquid' },
  { name: 'Glass Ripple', className: 'glass-card glass-ripple' },
  { name: 'Glass Morphing', className: 'glass-morphing' },
  { name: 'Glass Frosted', className: 'glass-frosted' },
  { name: 'Glass iOS Widget', className: 'glass-ios-widget' },
  { name: 'Glass iOS Card', className: 'glass-ios-card' },
  { name: 'Glass Business', className: 'glass-business' },
  { name: 'Glass Business Card', className: 'glass-business-card' },
  { name: 'Glass Follow Cursor', className: 'glass-card glass-follow-cursor' }
];

const buttonVariants = [
  { name: 'Default', props: {} },
  { name: 'Secondary', props: { variant: 'secondary' as const } },
  { name: 'Outline', props: { variant: 'outline' as const } },
  { name: 'Ghost', props: { variant: 'ghost' as const } },
  { name: 'Destructive', props: { variant: 'destructive' as const } },
  { name: 'Link', props: { variant: 'link' as const } }
];

const badgeVariants = [
  { name: 'Default', props: {} },
  { name: 'Secondary', props: { variant: 'secondary' as const } },
  { name: 'Outline', props: { variant: 'outline' as const } },
  { name: 'Destructive', props: { variant: 'destructive' as const } }
];

export default function ComponentsShowcase() {
  const [showComponents, setShowComponents] = useState(true);
  const [sliderValue, setSliderValue] = useState([50]);
  const [progress, setProgress] = useState(65);
  const { toast } = useToast();

  const showToast = (type: string) => {
    const toasts = {
      success: { title: "Success!", description: "Operation completed successfully" },
      error: { title: "Error", description: "Something went wrong", variant: "destructive" },
      info: { title: "Info", description: "Here's some information for you" }
    };
    toast(toasts[type as keyof typeof toasts] as any);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Components Showcase
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive showcase of all UI components, glass effects, and interactive elements. 
          No authentication required for viewing.
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline">No Auth Required</Badge>
          <Badge variant="secondary">All Components</Badge>
          <Badge>Interactive</Badge>
        </div>
      </div>

      <Tabs defaultValue="glass" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="glass" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Glass Effects
          </TabsTrigger>
          <TabsTrigger value="buttons" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Buttons
          </TabsTrigger>
          <TabsTrigger value="inputs" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Inputs
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Display
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="icons" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Icons
          </TabsTrigger>
        </TabsList>

        {/* Glass Effects */}
        <TabsContent value="glass" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Glass Morphism Effects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {glassVariants.map((variant) => (
                  <div 
                    key={variant.name}
                    className={`p-6 rounded-2xl ${variant.className} min-h-[120px] flex items-center justify-center relative`}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-sm font-medium text-foreground">
                        {variant.name}
                      </div>
                      <div className="text-xs text-muted-foreground opacity-80">
                        Interactive Glass Effect
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buttons */}
        <TabsContent value="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Button Variants & States
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Button Variants */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Button Variants</h3>
                <div className="flex flex-wrap gap-3">
                  {buttonVariants.map((variant) => (
                    <Button key={variant.name} {...variant.props}>
                      {variant.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Button Sizes */}
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Button Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <Star className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Button States */}
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Button States</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                  <Button>
                    <Heart className="w-4 h-4 mr-2" />
                    With Icon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inputs */}
        <TabsContent value="inputs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Input Components
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Text Inputs */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Text Inputs</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" placeholder="Enter your email" />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Type your message..." />
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Controls</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="notifications" />
                      <Label htmlFor="notifications">Enable notifications</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Volume: {sliderValue[0]}%</Label>
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display */}
        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Display Components
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Badges */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Badges</h3>
                <div className="flex flex-wrap gap-3">
                  {badgeVariants.map((variant) => (
                    <Badge key={variant.name} {...variant.props}>
                      {variant.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Avatars */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Avatars</h3>
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>
                      <Crown className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">LG</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <Separator />

              {/* Progress */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setProgress(Math.random() * 100)}
                  >
                    Randomize
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback */}
        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Feedback Components
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alerts */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Alerts</h3>
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Info</AlertTitle>
                    <AlertDescription>
                      This is an informational alert message.
                    </AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Something went wrong. Please try again.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <Separator />

              {/* Toasts */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Toast Notifications</h3>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => showToast('success')}
                  >
                    Success Toast
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => showToast('error')}
                  >
                    Error Toast
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => showToast('info')}
                  >
                    Info Toast
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Loading */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Loading States</h3>
                <div className="flex items-center gap-4">
                  <LoadingSpinner />
                  <Button disabled>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Loading...
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Icons */}
        <TabsContent value="icons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Icon Library Sample
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
                {[
                  Star, Heart, Shield, Crown, Gem, Lightbulb, 
                  Zap, Eye, EyeOff, Info, CheckCircle, AlertCircle,
                  Sparkles, Palette
                ].map((Icon, index) => (
                  <div 
                    key={index}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <Icon className="w-6 h-6 text-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Icon {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Note */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Gem className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Component Showcase</h4>
              <p className="text-blue-700 text-sm">
                This showcase demonstrates all available UI components and their variants. 
                All components are interactive and no authentication is required to view them.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}