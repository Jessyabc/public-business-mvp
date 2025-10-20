import { PostCard } from '@/components/posts/PostCard';
import { mockPosts } from '@/data/mockPosts';

export default function DemoCards() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-base mb-2">
            Post Cards Demo
          </h1>
          <p className="text-muted-foreground">
            Showcasing all post types with VisionOS-style glass design
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
              onClick={() => console.log('Clicked post:', post.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}