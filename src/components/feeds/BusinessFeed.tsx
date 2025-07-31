import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/business/PostCard";
import { mockBusinessPosts, industries } from "@/data/business-posts";
import { BusinessFeedFilters } from "@/types/business-post";
import { Search, Filter, ToggleLeft, Sparkles } from "lucide-react";
import { useAppMode } from "@/contexts/AppModeContext";

export function BusinessFeed() {
  const { toggleMode } = useAppMode();
  const [filters, setFilters] = useState<BusinessFeedFilters>({
    search: "",
    sortBy: "most_useful",
    industries: []
  });

  const [filteredPosts] = useState(mockBusinessPosts);

  const handleViewPost = (postId: string) => {
    console.log("View post:", postId);
    // Navigate to full post view
  };

  const handleSavePost = (postId: string) => {
    console.log("Save post:", postId);
    // Save to history
  };

  const handleLinkToBrainstorm = (postId: string) => {
    console.log("Link to brainstorm:", postId);
    // Open brainstorm linking modal
  };

  const getSortLabel = (value: string) => {
    switch (value) {
      case 'most_useful': return 'Most Useful';
      case 'most_recent': return 'Most Recent';
      case 'most_shared': return 'Most Shared';
      case 'webinars_only': return 'Webinars Only';
      case 'by_industry': return 'By Industry';
      default: return 'Most Useful';
    }
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden pb-32 transition-all duration-700 ease-in-out">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 relative z-10">
          <div className="glass-ios-widget rounded-3xl p-8 backdrop-blur-xl">
            {/* Top bar with search and filters */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-light text-foreground tracking-wide">
                  Business Feed
                </h1>
              </div>
              
              {/* Mode Toggle */}
              <Button
                onClick={toggleMode}
                variant="ghost"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <ToggleLeft className="w-4 h-4" />
                Switch to Public
              </Button>
            </div>

            {/* Search and Filters Row */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, company, or industry..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 glass-ios-card"
                />
              </div>

              {/* Sort Dropdown */}
              <Select
                value={filters.sortBy}
                onValueChange={(value: BusinessFeedFilters['sortBy']) => 
                  setFilters(prev => ({ ...prev, sortBy: value }))
                }
              >
                <SelectTrigger className="w-full lg:w-48 glass-ios-card">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most_useful">Most Useful</SelectItem>
                  <SelectItem value="most_recent">Most Recent</SelectItem>
                  <SelectItem value="most_shared">Most Shared</SelectItem>
                  <SelectItem value="webinars_only">Webinars Only</SelectItem>
                  <SelectItem value="by_industry">By Industry</SelectItem>
                </SelectContent>
              </Select>

              {/* Industry Filter */}
              <Button variant="outline" className="glass-ios-card">
                <Filter className="w-4 h-4 mr-2" />
                Industries
              </Button>
            </div>

            {/* Active Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sorted by:</span>
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20">
                {getSortLabel(filters.sortBy)}
              </Badge>
            </div>
          </div>
        </header>

        {/* Feed Content */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onViewPost={handleViewPost}
              onSavePost={handleSavePost}
              onLinkToBrainstorm={handleLinkToBrainstorm}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            className="glass-ios-card hover:glass-ios-widget"
          >
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  );
}