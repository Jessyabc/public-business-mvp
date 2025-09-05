// Mock services for development - no database calls

export interface MockProfile {
  id: string;
  displayName: string;
  company: string;
  tScore: number;
  uScore: number;
  membershipType: 'public' | 'business';
  avatar?: string;
  bio?: string;
}

export interface MockBrainstorm {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  tScore: number;
  createdAt: string;
  parentId?: string;
  branches?: MockBrainstorm[];
}

export interface MockReport {
  id: string;
  title: string;
  summary: string;
  highlighted: boolean;
  publishedAt: string;
  readTime: number;
}

export interface MockNotification {
  id: string;
  text: string;
  type: 'brainstorm' | 'report' | 'system';
  createdAt: string;
  read: boolean;
}

// Local storage keys
const STORAGE_KEYS = {
  profile: 'pb-mock-profile',
  brainstorms: 'pb-mock-brainstorms',
  reports: 'pb-mock-reports',
  notifications: 'pb-mock-notifications',
};

// Profile service
export const profileService = {
  getProfile(): MockProfile | null {
    const stored = localStorage.getItem(STORAGE_KEYS.profile);
    return stored ? JSON.parse(stored) : null;
  },

  saveProfile(profile: MockProfile): MockProfile {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    return profile;
  },

  createDefaultProfile(): MockProfile {
    const defaultProfile: MockProfile = {
      id: 'user-1',
      displayName: 'Demo User',
      company: 'Public Business',
      tScore: 42,
      uScore: 28,
      membershipType: 'public',
      bio: 'Exploring ideas and connecting with innovative thinkers.',
    };
    return this.saveProfile(defaultProfile);
  },
};

// Brainstorm service
export const brainstormService = {
  listBrainstorms(): MockBrainstorm[] {
    const stored = localStorage.getItem(STORAGE_KEYS.brainstorms);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Return default brainstorms
    const defaultBrainstorms: MockBrainstorm[] = [
      {
        id: 'brain-1',
        text: 'What if we could predict market trends using social sentiment analysis combined with weather patterns?',
        authorId: 'user-1',
        authorName: 'Demo User',
        tScore: 23,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'brain-2',
        text: 'Remote work effectiveness could be enhanced through virtual reality collaboration spaces.',
        authorId: 'user-2',
        authorName: 'Jane Smith',
        tScore: 18,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'brain-3',
        text: 'Blockchain technology for supply chain transparency in sustainable agriculture.',
        authorId: 'user-3',
        authorName: 'Alex Chen',
        tScore: 31,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    localStorage.setItem(STORAGE_KEYS.brainstorms, JSON.stringify(defaultBrainstorms));
    return defaultBrainstorms;
  },

  getBrainstorm(id: string): MockBrainstorm | null {
    const brainstorms = this.listBrainstorms();
    return brainstorms.find(b => b.id === id) || null;
  },

  createBrainstorm(text: string, parentId?: string): MockBrainstorm {
    const brainstorms = this.listBrainstorms();
    const newBrainstorm: MockBrainstorm = {
      id: `brain-${Date.now()}`,
      text: text.trim(),
      authorId: 'user-1',
      authorName: 'Demo User',
      tScore: 0,
      createdAt: new Date().toISOString(),
      parentId,
    };
    
    brainstorms.unshift(newBrainstorm);
    localStorage.setItem(STORAGE_KEYS.brainstorms, JSON.stringify(brainstorms));
    return newBrainstorm;
  },

  listBranches(rootId: string): MockBrainstorm[] {
    const brainstorms = this.listBrainstorms();
    return brainstorms.filter(b => b.parentId === rootId);
  },
};

// Report service
export const reportService = {
  listReports(options: { highlightedOnly?: boolean } = {}): MockReport[] {
    const stored = localStorage.getItem(STORAGE_KEYS.reports);
    let reports: MockReport[];
    
    if (stored) {
      reports = JSON.parse(stored);
    } else {
      // Default reports
      reports = [
        {
          id: 'report-1',
          title: 'Q4 2024 Innovation Trends',
          summary: 'Analysis of emerging technologies and their business impact across industries.',
          highlighted: true,
          publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          readTime: 12,
        },
        {
          id: 'report-2',
          title: 'Remote Work Productivity Metrics',
          summary: 'Comprehensive study on remote work effectiveness and team collaboration tools.',
          highlighted: false,
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          readTime: 8,
        },
        {
          id: 'report-3',
          title: 'Sustainable Business Practices ROI',
          summary: 'Financial analysis of sustainable practices and their long-term business value.',
          highlighted: true,
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          readTime: 15,
        },
      ];
      
      localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(reports));
    }
    
    if (options.highlightedOnly) {
      return reports.filter(r => r.highlighted);
    }
    
    return reports;
  },
};

// Notification service
export const notificationService = {
  listNotifications(): MockNotification[] {
    const stored = localStorage.getItem(STORAGE_KEYS.notifications);
    if (stored) {
      return JSON.parse(stored);
    }
    
    const defaultNotifications: MockNotification[] = [
      {
        id: 'notif-1',
        text: 'Your brainstorm about market trends gained 5 new T-score points',
        type: 'brainstorm',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: 'notif-2',
        text: 'New report published: "Q4 2024 Innovation Trends"',
        type: 'report',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: 'notif-3',
        text: 'System maintenance scheduled for tonight',
        type: 'system',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
    ];
    
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(defaultNotifications));
    return defaultNotifications;
  },
};