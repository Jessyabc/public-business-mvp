import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building2, 
  Settings, 
  Shield, 
  FileText, 
  UserPlus,
  Eye,
  EyeOff
} from 'lucide-react';

// Import all the forms
import { ProfileForm } from '@/components/profile/ProfileForm';
import { BusinessProfileForm } from '@/components/business/BusinessProfileForm';
import { BusinessAccountRequest } from '@/components/profile/BusinessAccountRequest';
import { AuthModal } from '@/components/auth/AuthModal';
import { SecurityVerification } from '@/components/SecurityVerification';

interface FormShowcaseItem {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
  category: 'profile' | 'business' | 'auth' | 'security' | 'admin';
  icon: any;
  requiresAuth?: boolean;
  requiresBusiness?: boolean;
}

const forms: FormShowcaseItem[] = [
  {
    id: 'profile-form',
    name: 'Profile Form',
    description: 'User profile editing form with avatar, bio, and social links.',
    component: ProfileForm,
    category: 'profile',
    icon: User,
    requiresAuth: true
  },
  {
    id: 'business-profile-form',
    name: 'Business Profile Form',
    description: 'Business profile setup and management form for business members.',
    component: BusinessProfileForm,
    category: 'business',
    icon: Building2,
    requiresAuth: true,
    requiresBusiness: true
  },
  {
    id: 'business-account-request',
    name: 'Business Account Request',
    description: 'Form to request business account access and status management.',
    component: BusinessAccountRequest,
    category: 'business',
    icon: UserPlus,
    requiresAuth: true
  },
  {
    id: 'security-verification',
    name: 'Security Verification',
    description: 'Security verification and validation form for sensitive operations.',
    component: SecurityVerification,
    category: 'security',
    icon: Shield,
    requiresAuth: true
  }
];

const categories = [
  { id: 'all', name: 'All Forms', icon: FileText },
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'business', name: 'Business', icon: Building2 },
  { id: 'auth', name: 'Authentication', icon: UserPlus },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'admin', name: 'Admin', icon: Settings }
];

export default function FormsShowcase() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const filteredForms = forms.filter(form => 
    selectedCategory === 'all' || form.category === selectedCategory
  );

  const selectedFormData = forms.find(form => form.id === selectedForm);

  const renderForm = (FormComponent: React.ComponentType, formId: string) => {
    try {
      return <FormComponent key={formId} />;
    } catch (error) {
      return (
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Form Error</h3>
              <p className="text-sm">
                This form encountered an error. Check console for details.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setSelectedForm(null)}
              >
                Back to Forms List
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Forms Showcase</h1>
        <p className="text-muted-foreground">
          Testing environment for all available forms and components. This page is for development and testing purposes.
        </p>
        <Badge variant="outline" className="mt-2">
          Development Testing Page
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forms List Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Available Forms ({filteredForms.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-1 gap-1">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <TabsTrigger 
                        key={category.id} 
                        value={category.id}
                        className="flex items-center gap-2 justify-start text-xs"
                      >
                        <IconComponent className="w-4 h-4" />
                        {category.name}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>

              {/* Forms List */}
              <div className="space-y-2">
                {filteredForms.map((form) => {
                  const IconComponent = form.icon;
                  const isSelected = selectedForm === form.id;
                  
                  return (
                    <Button
                      key={form.id}
                      variant={isSelected ? "default" : "ghost"}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedForm(isSelected ? null : form.id)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <IconComponent className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-medium text-sm">{form.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {form.description}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {form.requiresAuth && (
                              <Badge variant="secondary" className="text-xs">Auth</Badge>
                            )}
                            {form.requiresBusiness && (
                              <Badge variant="outline" className="text-xs">Business</Badge>
                            )}
                          </div>
                        </div>
                        {isSelected ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {/* Special Forms */}
              <div className="border-t pt-4 space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Special Forms</h4>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowAuthModal(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Auth Modal (Test)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Display Area */}
        <div className="lg:col-span-2">
          {selectedFormData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <selectedFormData.icon className="w-5 h-5" />
                  {selectedFormData.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  {selectedFormData.description}
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">{selectedFormData.category}</Badge>
                  {selectedFormData.requiresAuth && (
                    <Badge variant="outline">Requires Auth</Badge>
                  )}
                  {selectedFormData.requiresBusiness && (
                    <Badge variant="outline">Business Only</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-muted/20">
                  {renderForm(selectedFormData.component, selectedFormData.id)}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No Form Selected
                </h3>
                <p className="text-muted-foreground">
                  Choose a form from the list on the left to preview and test it.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />

      {/* Usage Note */}
      <Card className="mt-8 border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">Development Note</h4>
              <p className="text-amber-700 text-sm">
                This page is for testing and development purposes. Forms may not function completely without 
                proper authentication context or database connections. Use this to verify styling and basic functionality.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}