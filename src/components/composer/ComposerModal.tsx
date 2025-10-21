import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Brain, Sparkles, FileText, Lock, Link2 } from "lucide-react";
import { useAppMode } from "@/contexts/AppModeContext";
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from "@/hooks/useUserRoles";
import { useComposerStore } from "@/hooks/useComposerStore";
import { toast } from 'sonner';

type RelationType = 'continuation' | 'linking';

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComposerModal({ isOpen, onClose }: ComposerModalProps) {
  const { mode } = useAppMode();
  const { canCreateBusinessPosts } = useUserRoles();
  const { context, setContext } = useComposerStore();
  const [composerType, setComposerType] = useState<'brainstorm' | 'insight' | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [postType, setPostType] = useState<string>("");
  const [visibility, setVisibility] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [relationType, setRelationType] = useState<RelationType>('continuation');

  const handleRelationTypeChange = (value: RelationType | '') => {
    if (value) {
      setRelationType(value);
    }
  };

  useEffect(() => {
    if (context?.relationType) {
      setRelationType(context.relationType);
    }
  }, [context?.relationType]);

  const handleClose = () => {
    setComposerType(null);
    setContent("");
    setTitle("");
    setPostType("");
    setVisibility("");
    setRelationType('continuation');
    setContext(null);
    onClose();
  };

  const handleCreate = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      // Map composer types to post kinds
      let kind: string;
      if (composerType === 'brainstorm') {
        kind = context?.parentPostId ? 'brainstorm_continue' : 'brainstorm';
      } else {
        // Map post types to kinds
        const typeMap: Record<string, string> = {
          'insight': 'insight',
          'report': 'insight',
          'whitepaper': 'white_paper',
          'webinar': 'insight',
          'video': mode === 'public' ? 'video_brainstorm' : 'video_insight',
        };
        kind = typeMap[postType] || 'insight';
      }

      const postData = {
        kind,
        content: content.trim(),
        ...(title.trim() && { title: title.trim() }),
        ...(context?.parentPostId && { parent_post_id: context.parentPostId }),
        tags: [], // Could be added in future
        meta: {
          visibility: visibility || 'public',
          mode: mode,
          composer_type: composerType,
          post_type: postType,
        },
      };

      console.log('Creating post via edge function:', postData);

      const { data, error } = await supabase.functions.invoke('create-post', {
        body: postData,
      });

      if (error) {
        console.error('Error creating post:', error);
        toast.error('Failed to create post');
        return;
      }

      console.log('Post created successfully:', data);
      toast.success(`${composerType === 'brainstorm' ? 'Brainstorm' : 'Post'} created successfully and is pending approval`);
      
      // If this is a relation (continuation/linking), create the post relation
      if (context?.parentPostId && data?.post_id) {
        try {
          const { error: relationError } = await supabase
            .from('post_relations')
            .insert({
              parent_post_id: context.parentPostId,
              child_post_id: data.post_id,
              relation_type: relationType,
            });
          
          if (relationError) {
            console.error('Error creating post relation:', relationError);
            toast.error('Post created but linking failed');
          }
        } catch (relationErr) {
          console.error('Relation creation error:', relationErr);
        }
      }
      
      handleClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTypeSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">What would you like to create?</h3>
      <div className="grid grid-cols-1 gap-4">
        <Button
          onClick={() => setComposerType('brainstorm')}
          className={`h-20 flex flex-col items-center justify-center space-y-2 ${
            mode === 'public' 
              ? 'glass-ios-card hover:glass-ios-widget text-primary' 
              : 'glass-business-card hover:glass-business text-blue-600'
          }`}
        >
          <Brain className="w-6 h-6" />
          <div className="text-center">
            <div className="font-semibold">New Brainstorm</div>
            <div className="text-xs opacity-80">Share a spark of inspiration</div>
          </div>
        </Button>

        <Button
          onClick={() => setComposerType('insight')}
          disabled={mode === 'business' && !canCreateBusinessPosts}
          className={`h-20 flex flex-col items-center justify-center space-y-2 relative ${
            mode === 'public' 
              ? 'glass-ios-card hover:glass-ios-widget text-foreground' 
              : 'glass-business-card hover:glass-business text-blue-600'
          } ${mode === 'business' && !canCreateBusinessPosts ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {mode === 'business' && !canCreateBusinessPosts && (
            <Lock className="absolute top-2 right-2 w-4 h-4" />
          )}
          <FileText className="w-6 h-6" />
          <div className="text-center">
            <div className="font-semibold">New Business Insight</div>
            <div className="text-xs opacity-80">
              {mode === 'business' && !canCreateBusinessPosts 
                ? 'Business membership required' 
                : 'Share professional knowledge'
              }
            </div>
          </div>
        </Button>
      </div>
    </div>
  );

  const renderReplyContext = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <Link2 className="w-4 h-4 text-primary" />
        <span>
          Linking to parent post
        </span>
      </div>
      <div>
        <Label>Choose link type</Label>
        <ToggleGroup type="single" value={relationType} onValueChange={handleRelationTypeChange} className="mt-2">
          <ToggleGroupItem value="continuation" className="px-3 py-2">Continuing Brainstorm</ToggleGroupItem>
          <ToggleGroupItem value="linking" className="px-3 py-2">Linking Brainstorm</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );

  const renderBrainstormComposer = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">New Brainstorm</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="brainstorm-content">Your spark of inspiration</Label>
        <Textarea
          id="brainstorm-content"
          placeholder="Share your idea, thought, or insight..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`min-h-[100px] ${mode === 'public' ? 'glass-ios-card' : 'glass-business-card'}`}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={!content.trim() || isSubmitting}>
          <Sparkles className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Creating...' : 'Create Brainstorm'}
        </Button>
      </div>
    </div>
  );

  const renderInsightComposer = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-foreground" />
        <h3 className="text-lg font-semibold">New Business Insight</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="insight-title">Title</Label>
        <Input
          id="insight-title"
          placeholder="Give your insight a compelling title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={mode === 'public' ? 'glass-ios-card' : 'glass-business-card'}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-type">Type</Label>
        <Select value={postType} onValueChange={setPostType}>
          <SelectTrigger className={mode === 'public' ? 'glass-ios-card' : 'glass-business-card'}>
            <SelectValue placeholder="Select post type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="insight">Insight</SelectItem>
            <SelectItem value="report">Report</SelectItem>
            <SelectItem value="whitepaper">White Paper</SelectItem>
            <SelectItem value="webinar">Webinar</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility</Label>
        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger className={mode === 'public' ? 'glass-ios-card' : 'glass-business-card'}>
            <SelectValue placeholder="Who can see this?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">🌍 Public - Everyone</SelectItem>
            <SelectItem value="my_business">🏠 My Business Only</SelectItem>
            <SelectItem value="other_businesses">🏢 Selected Businesses</SelectItem>
            <SelectItem value="draft">📝 Draft - Save for later</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="insight-content">Content</Label>
        <Textarea
          id="insight-content"
          placeholder="Share your professional insight, analysis, or findings..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`min-h-[120px] ${mode === 'public' ? 'glass-ios-card' : 'glass-business-card'}`}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={!content.trim() || !title.trim() || !postType || !visibility || isSubmitting}>
          <Sparkles className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Creating...' : 'Create Insight'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`glass-med glass-modal-enhanced max-w-lg border ${
        mode === 'public' 
          ? 'bg-background/80 border-border/40' 
          : 'bg-card/80 border-border/40'
      }`}>
        <DialogHeader>
          <DialogTitle className="sr-only">Create New Content</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new brainstorm or business insight
          </DialogDescription>
        </DialogHeader>

        {context?.parentPostId && renderReplyContext()}
        {!composerType && renderTypeSelection()}
        {composerType === 'brainstorm' && renderBrainstormComposer()}
        {composerType === 'insight' && renderInsightComposer()}
      </DialogContent>
    </Dialog>
  );
}