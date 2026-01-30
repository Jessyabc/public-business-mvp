import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  Lightbulb,
  ChevronDown,
  Settings,
  User,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  X,
  Calendar as CalendarIcon,
  Menu,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Download,
  Copy,
  Check
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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const showToast = (type: string) => {
    const toasts = {
      success: { title: "Success!", description: "Operation completed successfully" },
      error: { title: "Error", description: "Something went wrong", variant: "destructive" },
      info: { title: "Info", description: "Here's some information for you" }
    };
    toast(toasts[type as keyof typeof toasts] as any);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1">
          <TabsTrigger value="glass" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Glass
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
          <TabsTrigger value="overlays" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Overlays
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center gap-2">
            <Menu className="w-4 h-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Data
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
              <CardDescription>When to use: User data collection and interaction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Text Inputs */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Text Inputs</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="user@example.com" />
                      <p className="text-xs text-muted-foreground mt-1">Use for single-line text</p>
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Type your message..." rows={4} />
                      <p className="text-xs text-muted-foreground mt-1">Use for multi-line text</p>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Binary Controls</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="notifications" />
                      <Label htmlFor="notifications">Enable notifications</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">Use Switch for on/off settings</p>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" />
                      <Label htmlFor="terms">Accept terms and conditions</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">Use Checkbox for optional selections</p>

                    <div className="space-y-2">
                      <Label>Volume: {sliderValue[0]}%</Label>
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        max={100}
                        step={1}
                      />
                      <p className="text-xs text-muted-foreground">Use Slider for range values</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Radio Groups</h3>
                <RadioGroup defaultValue="option1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="r1" />
                    <Label htmlFor="r1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="r2" />
                    <Label htmlFor="r2">Option 2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option3" id="r3" />
                    <Label htmlFor="r3">Option 3</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-2">Use RadioGroup for mutually exclusive choices</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Toggle Buttons</h3>
                <div className="flex gap-2">
                  <Toggle aria-label="Toggle bold">
                    <Bold className="h-4 w-4" />
                  </Toggle>
                  <Toggle aria-label="Toggle italic">
                    <Italic className="h-4 w-4" />
                  </Toggle>
                  <Toggle aria-label="Toggle underline">
                    <Underline className="h-4 w-4" />
                  </Toggle>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Use Toggle for formatting or filter options</p>
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

        {/* Overlays */}
        <TabsContent value="overlays" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dialogs & Modals</CardTitle>
              <CardDescription>When to use: Important actions requiring user attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmation Dialog</DialogTitle>
                      <DialogDescription>
                        This is a dialog modal. Use for critical actions that need user confirmation.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open Sheet</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Sheet Panel</SheetTitle>
                      <SheetDescription>
                        Use sheets for secondary content or settings panels
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        Sheet content appears from the side, great for filters, settings, or additional information.
                      </p>
                    </div>
                  </SheetContent>
                </Sheet>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover Tooltip</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Useful for quick contextual help</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Popover Component</h4>
                      <p className="text-sm text-muted-foreground">
                        Use popovers for additional content that doesn't require modal focus
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="outline">Hover Card</Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarFallback>HC</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">Hover Card</h4>
                        <p className="text-sm text-muted-foreground">
                          Rich preview cards on hover
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation */}
        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dropdown & Select Menus</CardTitle>
              <CardDescription>When to use: Choice selection and contextual actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-3 flex-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Dropdown Menu
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                    <SelectItem value="option4">Option 4</SelectItem>
                  </SelectContent>
                </Select>

                <ToggleGroup type="single">
                  <ToggleGroupItem value="left" aria-label="Align left">
                    <AlignLeft className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="center" aria-label="Align center">
                    <AlignCenter className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right" aria-label="Align right">
                    <AlignRight className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Collapsible & Accordion</h3>
                <div className="space-y-4">
                  <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        Collapsible Section
                        <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsibleOpen ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 px-4">
                      <p className="text-sm text-muted-foreground">
                        This content can be toggled. Use collapsibles for optional content.
                      </p>
                    </CollapsibleContent>
                  </Collapsible>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>When to use Accordion?</AccordionTrigger>
                      <AccordionContent>
                        Use accordions for FAQs, settings categories, or any content where only one section should be open at a time.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Multiple sections</AccordionTrigger>
                      <AccordionContent>
                        Accordions organize related content into collapsible sections.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Display */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tables & Data Display</CardTitle>
              <CardDescription>When to use: Structured data presentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Table Component</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead>Use Case</TableHead>
                        <TableHead className="text-right">Context</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Button</TableCell>
                        <TableCell>Primary actions</TableCell>
                        <TableCell className="text-right">CTA, forms, navigation</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Dialog</TableCell>
                        <TableCell>Critical decisions</TableCell>
                        <TableCell className="text-right">Confirmations, forms</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Toast</TableCell>
                        <TableCell>Feedback messages</TableCell>
                        <TableCell className="text-right">Success, errors, info</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Scroll Area</h3>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <div className="space-y-2">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <p key={i} className="text-sm">
                        Scrollable content item {i + 1}. Use ScrollArea for fixed-height scrollable regions.
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Skeleton Loading States</h3>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <p className="text-xs text-muted-foreground pt-2">
                    Use skeletons as placeholders while content loads
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Calendar & Date Picker</h3>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border w-fit"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Use calendar for date selection, scheduling, or date range pickers
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Usage Guide */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="w-5 h-5" />
            Component Selection Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">User Actions</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Button:</strong> Primary CTAs, form submissions</li>
                <li>• <strong>Dialog:</strong> Critical confirmations, irreversible actions</li>
                <li>• <strong>Sheet:</strong> Settings panels, filters</li>
                <li>• <strong>Dropdown:</strong> Contextual menus, account actions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Data Input</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Input:</strong> Single-line text (email, search)</li>
                <li>• <strong>Textarea:</strong> Multi-line text (messages, comments)</li>
                <li>• <strong>Select:</strong> Choose from predefined list</li>
                <li>• <strong>Checkbox:</strong> Multiple optional selections</li>
                <li>• <strong>Radio:</strong> Single selection from group</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Feedback</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Toast:</strong> Non-blocking success/error messages</li>
                <li>• <strong>Alert:</strong> Persistent inline warnings/info</li>
                <li>• <strong>Progress:</strong> Task completion status</li>
                <li>• <strong>Skeleton:</strong> Loading placeholders</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Organization</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Tabs:</strong> Organize related content sections</li>
                <li>• <strong>Accordion:</strong> Collapsible content groups (FAQs)</li>
                <li>• <strong>Table:</strong> Structured data display</li>
                <li>• <strong>Card:</strong> Group related information</li>
              </ul>
            </div>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Choose components based on user intent. Use modals for important decisions, 
            toasts for feedback, and tooltips for contextual help. Keep interactions intuitive and minimize friction.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}