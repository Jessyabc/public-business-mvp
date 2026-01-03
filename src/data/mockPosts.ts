import { PBPost } from '@/types/pb';

export const mockPosts: PBPost[] = [
  {
    id: '2',
    type: 'brainstorm',
    title: 'Quantum Computing Applications in Climate Modeling',
    content: 'Exploring how quantum algorithms could revolutionize weather prediction accuracy and climate change modeling. What are the key challenges?',
    author: {
      id: 'user2',
      name: 'Dr. Marcus Webb',
      avatar: '/lovable-uploads/26ffd67e-8031-46ae-8964-c6b547a1238a.png',
      verified: true
    },
    metrics: {
      uScore: 94,
      replies: 45,
      shares: 89,
      views: 1890
    },
    createdAt: '2024-01-14T16:45:00Z',
    tags: ['Quantum', 'Climate', 'Research'],
    isPublic: false
  },
  {
    id: '3',
    type: 'brainstorm_continue',
    title: 'Building on Quantum Climate Models',
    content: 'Following up on the quantum computing discussion - what if we combined this with satellite data feeds for real-time global climate monitoring?',
    author: {
      id: 'user3',
      name: 'Elena Rodriguez',
      avatar: '/lovable-uploads/2bfedb4e-d21c-44fe-b838-4297c0b4f4d7.png'
    },
    metrics: {
      replies: 18,
      shares: 34,
      views: 567
    },
    createdAt: '2024-01-14T18:20:00Z',
    tags: ['Quantum', 'Satellites', 'Data'],
    isPublic: false
  },
  {
    id: '4',
    type: 'insight',
    title: 'Market Analysis: Green Tech Investment Trends',
    content: 'Deep dive into the emerging patterns in green technology investments, showing a 340% increase in quantum computing applications for environmental solutions.',
    author: {
      id: 'user4',
      name: 'Alex Thompson',
      avatar: '/lovable-uploads/77267ade-34ff-4c2e-8797-fb16de997bd1.png',
      verified: true
    },
    metrics: {
      tScore: 76,
      uScore: 88,
      replies: 67,
      shares: 234,
      views: 4560
    },
    thumbnail: '/lovable-uploads/7b84831f-eb6d-4acd-bf51-5d3d7be705ba.png',
    createdAt: '2024-01-13T09:15:00Z',
    tags: ['Investment', 'GreenTech', 'Analysis'],
    isPublic: true
  },
  {
    id: '5',
    type: 'insight_report',
    title: 'Q4 2024 Renewable Energy Innovation Report',
    content: 'Comprehensive analysis of breakthrough technologies in renewable energy sector, including efficiency improvements and cost reduction strategies.',
    author: {
      id: 'user5',
      name: 'Innovation Labs',
      avatar: '/lovable-uploads/e501941c-3e1a-4f5a-a8d1-d3ad167d2e0c.png',
      verified: true
    },
    metrics: {
      tScore: 95,
      replies: 89,
      shares: 456,
      views: 7890
    },
    thumbnail: '/lovable-uploads/1a58e202-c32a-4b09-89d8-ff1eb22b437d.png',
    createdAt: '2024-01-12T14:30:00Z',
    tags: ['Report', 'Renewable', 'Innovation'],
    isPublic: true
  },
  {
    id: '6',
    type: 'video_brainstorm',
    title: 'Live: Exploring Space-Based Solar Power',
    content: 'Interactive brainstorm session discussing the feasibility of space-based solar power stations and wireless power transmission to Earth.',
    author: {
      id: 'user6',
      name: 'Space Tech Collective',
      verified: true
    },
    metrics: {
      uScore: 92,
      replies: 156,
      shares: 678,
      views: 12340
    },
    thumbnail: '/lovable-uploads/26ffd67e-8031-46ae-8964-c6b547a1238a.png',
    createdAt: '2024-01-11T20:00:00Z',
    tags: ['Space', 'Solar', 'Energy', 'Video'],
    isPublic: true
  }
];