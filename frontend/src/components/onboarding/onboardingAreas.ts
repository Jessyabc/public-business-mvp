/**
 * Onboarding area definitions
 * Each area represents a section of the platform that users can explore
 */

export interface OnboardingArea {
  id: string;
  routePattern: string | RegExp;
  title: string;
  description: string;
  hints: string[];
  delay: number; // Delay in milliseconds before showing guide
  style: 'neumorphic' | 'glass' | 'neutral';
}

export const onboardingAreas: OnboardingArea[] = [
  {
    id: 'think-space',
    routePattern: '^/$',
    title: 'Your thinking space',
    description: 'A private place to capture thoughts. No audience, no pressure.',
    hints: [
      'Tap anywhere or press Enter to start thinking',
      'Thoughts organize into day threads automatically',
      'Ready to share? Check out Discuss →',
    ],
    delay: 2500, // 2.5 seconds - let them absorb the space first
    style: 'neumorphic',
  },
  {
    id: 'discuss',
    routePattern: '^/discuss',
    title: 'Community feed',
    description: 'See what others are sharing. Toggle between public and business views.',
    hints: [
      'Swipe or click posts to dive deeper',
      'Use the + button to share your thoughts',
      'Your trail shows posts you\'ve explored',
    ],
    delay: 500, // Quick delay - they navigated intentionally
    style: 'glass',
  },
  {
    id: 'profile',
    routePattern: '^/profile',
    title: 'Your profile',
    description: 'Build your presence. Share what you\'re working on.',
    hints: [
      'Customize your profile to stand out',
      'Your posts and activity appear here',
      'Connect with others in the community',
    ],
    delay: 500,
    style: 'neutral',
  },
  {
    id: 'settings',
    routePattern: '^/settings',
    title: 'Preferences',
    description: 'Control your experience. Reset onboarding anytime.',
    hints: [
      'Adjust notifications and privacy',
      'Customize your theme and preferences',
      'Reset onboarding to see guides again',
    ],
    delay: 500,
    style: 'neutral',
  },
  {
    id: 'research',
    routePattern: '^/research',
    title: 'Research tools',
    description: 'Discover insights and explore topics.',
    hints: [
      'Search and filter to find what you need',
      'Save interesting findings for later',
      'Explore related content and connections',
    ],
    delay: 500,
    style: 'neutral',
  },
  {
    id: 'business-dashboard',
    routePattern: '^/business-dashboard',
    title: 'Business hub',
    description: 'Manage your organization and insights.',
    hints: [
      'View your organization\'s activity',
      'Manage members and permissions',
      'Access business insights and analytics',
    ],
    delay: 500,
    style: 'neutral',
  },
];

/**
 * Find onboarding area by route path
 */
export function findOnboardingArea(pathname: string): OnboardingArea | null {
  for (const area of onboardingAreas) {
    if (typeof area.routePattern === 'string') {
      const regex = new RegExp(area.routePattern);
      if (regex.test(pathname)) {
        return area;
      }
    } else if (area.routePattern instanceof RegExp) {
      if (area.routePattern.test(pathname)) {
        return area;
      }
    }
  }
  return null;
}
