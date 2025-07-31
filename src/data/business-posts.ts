import { BusinessPost } from "@/types/business-post";

export const mockBusinessPosts: BusinessPost[] = [
  {
    id: "1",
    title: "The Future of AI in Financial Services: 2024 Market Analysis",
    type: "report",
    summary: "Comprehensive analysis of AI adoption trends across financial institutions, including ROI metrics and implementation strategies.",
    company: {
      id: "comp1",
      name: "TechFlow Analytics",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop&crop=center",
      industry: "Technology"
    },
    uScore: {
      total: 92,
      breakdown: {
        comments: 23,
        links: 18,
        views: 847,
        shares: 34
      }
    },
    visibility: "public",
    publishedAt: new Date("2024-01-20T10:30:00"),
    linkedBrainstorms: 5,
    citationCount: 12,
    isHighlighted: true
  },
  {
    id: "2",
    title: "Sustainable Supply Chain Transformation",
    type: "webinar",
    summary: "Live discussion on implementing eco-friendly practices across global supply chains with real case studies.",
    company: {
      id: "comp2",
      name: "GreenLogistics Co",
      logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=64&h=64&fit=crop&crop=center",
      industry: "Logistics"
    },
    uScore: {
      total: 78,
      breakdown: {
        comments: 45,
        links: 8,
        views: 234,
        shares: 67
      }
    },
    visibility: "public",
    publishedAt: new Date("2024-01-18T14:00:00"),
    isLive: true,
    linkedBrainstorms: 3,
    citationCount: 8
  },
  {
    id: "3",
    title: "Digital Marketing ROI Benchmarks Q4 2023",
    type: "insight",
    summary: "Industry benchmarks and performance metrics for digital marketing campaigns across different sectors.",
    company: {
      id: "comp3",
      name: "Marketing Metrics Inc",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=64&h=64&fit=crop&crop=center",
      industry: "Marketing"
    },
    uScore: {
      total: 85,
      breakdown: {
        comments: 31,
        links: 22,
        views: 456,
        shares: 28
      }
    },
    visibility: "other_businesses",
    publishedAt: new Date("2024-01-15T09:15:00"),
    linkedBrainstorms: 7,
    citationCount: 15,
    isHighlighted: true
  },
  {
    id: "4",
    title: "Cybersecurity Threat Landscape 2024",
    type: "whitepaper",
    summary: "Detailed analysis of emerging cybersecurity threats and defensive strategies for enterprise environments.",
    company: {
      id: "comp4",
      name: "SecureNet Solutions",
      logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=64&h=64&fit=crop&crop=center",
      industry: "Cybersecurity"
    },
    uScore: {
      total: 96,
      breakdown: {
        comments: 18,
        links: 42,
        views: 1203,
        shares: 89
      }
    },
    visibility: "public",
    publishedAt: new Date("2024-01-12T16:45:00"),
    linkedBrainstorms: 9,
    citationCount: 24,
    isHighlighted: true
  },
  {
    id: "5",
    title: "Employee Wellness Program Impact Study",
    type: "insight",
    summary: "Six-month study results showing correlation between wellness programs and productivity metrics.",
    company: {
      id: "comp5",
      name: "HR Innovations Ltd",
      logo: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=64&h=64&fit=crop&crop=center",
      industry: "Human Resources"
    },
    uScore: {
      total: 73,
      breakdown: {
        comments: 27,
        links: 12,
        views: 389,
        shares: 19
      }
    },
    visibility: "my_business",
    publishedAt: new Date("2024-01-10T11:20:00"),
    linkedBrainstorms: 2,
    citationCount: 6
  }
];

export const industries = [
  "Technology",
  "Finance", 
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Education",
  "Logistics",
  "Marketing",
  "Cybersecurity",
  "Human Resources"
];