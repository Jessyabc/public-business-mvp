import { calculateTScore } from '@/lib/score/tScore';

export interface Brainstorm {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  tScore: number;
  replyCount: number;
  createdAt: string;
  parentId?: string;
}

const STORAGE_KEY = 'pb-brainstorms';

// Initialize with rich mock data
const getDefaultBrainstorms = (): Brainstorm[] => [
  {
    id: 'brain-1',
    text: 'What if we could predict market trends using social sentiment analysis combined with weather patterns? The correlation between consumer mood and meteorological data might reveal untapped insights.',
    authorId: 'user-1',
    authorName: 'Alex Chen',
    tScore: 89,
    replyCount: 12,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'brain-2',
    text: 'Remote work effectiveness could be enhanced through virtual reality collaboration spaces. Imagine conducting quarterly reviews in a virtual boardroom that feels more engaging than Zoom.',
    authorId: 'user-2',
    authorName: 'Sarah Kim',
    tScore: 76,
    replyCount: 8,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'brain-3',
    text: 'Blockchain technology for supply chain transparency in sustainable agriculture - every tomato could have a verified journey from seed to plate.',
    authorId: 'user-3',
    authorName: 'Jamie Rodriguez',
    tScore: 92,
    replyCount: 15,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'brain-4',
    text: 'AI-powered personal finance coaches that understand your spending psychology, not just your transaction history.',
    authorId: 'user-4',
    authorName: 'Marcus Thompson',
    tScore: 67,
    replyCount: 5,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'brain-5',
    text: 'Micro-learning modules delivered during commute downtime - transform dead time into skill-building moments.',
    authorId: 'user-5',
    authorName: 'Elena Vasquez',
    tScore: 54,
    replyCount: 3,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'brain-6',
    text: 'What if office buildings could adapt their layout in real-time based on team dynamics and project needs?',
    authorId: 'user-6',
    authorName: 'David Park',
    tScore: 71,
    replyCount: 7,
    createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
  },
];

class BrainstormService {
  private getStoredBrainstorms(): Brainstorm[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    const defaults = getDefaultBrainstorms();
    this.saveBrainstorms(defaults);
    return defaults;
  }

  private saveBrainstorms(brainstorms: Brainstorm[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(brainstorms));
  }

  listRootBrainstorms(): Brainstorm[] {
    const brainstorms = this.getStoredBrainstorms();
    return brainstorms
      .filter(b => !b.parentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  listBranches(rootId: string): Brainstorm[] {
    const brainstorms = this.getStoredBrainstorms();
    return brainstorms
      .filter(b => b.parentId === rootId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getBrainstorm(id: string): Brainstorm | null {
    const brainstorms = this.getStoredBrainstorms();
    return brainstorms.find(b => b.id === id) || null;
  }

  createBrainstorm({ text, parentId }: { text: string; parentId?: string }): Brainstorm {
    const brainstorms = this.getStoredBrainstorms();
    const now = new Date().toISOString();
    
    const newBrainstorm: Brainstorm = {
      id: `brain-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: text.trim(),
      authorId: 'user-current',
      authorName: 'You',
      tScore: calculateTScore({
        textLength: text.trim().length,
        replyCount: 0,
        recencyMinutes: 0,
      }),
      replyCount: 0,
      createdAt: now,
      parentId,
    };

    brainstorms.unshift(newBrainstorm);

    // If this is a reply, increment parent's reply count and recalculate T-score
    if (parentId) {
      const parent = brainstorms.find(b => b.id === parentId);
      if (parent) {
        parent.replyCount += 1;
        const minutesOld = (Date.now() - new Date(parent.createdAt).getTime()) / (1000 * 60);
        parent.tScore = calculateTScore({
          textLength: parent.text.length,
          replyCount: parent.replyCount,
          recencyMinutes: minutesOld,
        });
      }
    }

    this.saveBrainstorms(brainstorms);
    return newBrainstorm;
  }

  // Simulate network delay for realistic UX
  async createBrainstormAsync(params: { text: string; parentId?: string }): Promise<Brainstorm> {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
    
    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Failed to create brainstorm. Please try again.');
    }
    
    return this.createBrainstorm(params);
  }
}

export const brainstormService = new BrainstormService();