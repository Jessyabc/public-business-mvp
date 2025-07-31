import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Brain, Building2, Sparkles, FileText } from "lucide-react";
import { useAppMode } from "@/contexts/AppModeContext";

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComposerModal({ isOpen, onClose }: ComposerModalProps) {
  const { mode } = useAppMode();
  const [composerType, setComposerType] = useState<'brainstorm' | 'insight' | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [postType, setPostType] = useState<string>("");
  const [visibility, setVisibility] = useState<string>("");

  const handleClose = () => {
    setComposerType(null);
    setContent("");
    setTitle("");
    setPostType("");
    setVisibility("");
    onClose();
  };

  const handleCreate = () => {
    console.log("Creating:", { composerType, content, title, postType, visibility });
    // Handle creation logic here
    handleClose();
  };

  const renderTypeSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">What would you like to create?</h3>
      <div className="grid grid-cols-1 gap-4">
        <Button
          onClick={() => setComposerType('brainstorm')}
          className="h-20 flex flex-col items-center justify-center space-y-2 glass-card bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        >
          <Brain className="w-6 h-6" />
          <div className="text-center">
            <div className="font-semibold">New Brainstorm</div>
            <div className="text-xs opacity-80">Share a spark of inspiration</div>
          </div>
        </Button>

        <Button
          onClick={() => setComposerType('insight')}
          className="h-20 flex flex-col items-center justify-center space-y-2 glass-card bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground border border-secondary/20"
        >
          <FileText className="w-6 h-6" />
          <div className="text-center">
            <div className="font-semibold">New Business Insight</div>
            <div className="text-xs opacity-80">Share professional knowledge</div>
          </div>
        </Button>
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
          className="min-h-[100px] bg-background/50 border-white/10 backdrop-blur-sm"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={!content.trim()}>
          <Sparkles className="w-4 h-4 mr-2" />
          Create Brainstorm
        </Button>
      </div>
    </div>
  );

  const renderInsightComposer = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-secondary-foreground" />
        <h3 className="text-lg font-semibold">New Business Insight</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="insight-title">Title</Label>
        <Input
          id="insight-title"
          placeholder="Give your insight a compelling title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-background/50 border-white/10 backdrop-blur-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-type">Type</Label>
        <Select value={postType} onValueChange={setPostType}>
          <SelectTrigger className="bg-background/50 border-white/10 backdrop-blur-sm">
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
          <SelectTrigger className="bg-background/50 border-white/10 backdrop-blur-sm">
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
          className="min-h-[120px] bg-background/50 border-white/10 backdrop-blur-sm"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={!content.trim() || !title.trim() || !postType || !visibility}>
          <Building2 className="w-4 h-4 mr-2" />
          Create Insight
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card backdrop-blur-xl border border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Create New Content</DialogTitle>
        </DialogHeader>
        
        {!composerType && renderTypeSelection()}
        {composerType === 'brainstorm' && renderBrainstormComposer()}
        {composerType === 'insight' && renderInsightComposer()}
      </DialogContent>
    </Dialog>
  );
}