/**
 * Onboarding Provider
 * Monitors route changes and shows contextual guides when users explore new areas
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { findOnboardingArea, type OnboardingArea } from './onboardingAreas';
import { OnboardingGuide } from './OnboardingGuide';

export function OnboardingProvider() {
  const { user } = useAuth();
  const location = useLocation();
  const { hasVisitedArea, markAreaVisited, isOnboardingEnabled, loading } = useOnboarding();
  
  const [currentArea, setCurrentArea] = useState<OnboardingArea | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownGuideRef = useRef(false);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Handle route changes with debouncing
  useEffect(() => {
    // Only show guides for authenticated users
    if (!user || loading) {
      setShowGuide(false);
      setCurrentArea(null);
      return;
    }

    // Check if onboarding is enabled
    if (!isOnboardingEnabled()) {
      setShowGuide(false);
      setCurrentArea(null);
      return;
    }

    // Debounce rapid navigation (500ms)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const area = findOnboardingArea(location.pathname);
      
      if (!area) {
        setShowGuide(false);
        setCurrentArea(null);
        hasShownGuideRef.current = false;
        return;
      }

      // Check if user has already visited this area
      if (hasVisitedArea(area.id)) {
        setShowGuide(false);
        setCurrentArea(null);
        hasShownGuideRef.current = false;
        return;
      }

      // Reset the guide state for new area
      hasShownGuideRef.current = false;
      setCurrentArea(area);
      setShowGuide(false);

      // Try to find a target element for positioning (optional)
      // For now, we'll position relative to viewport
      setTargetElement(null);

      // Show guide after delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setShowGuide(true);
        hasShownGuideRef.current = true;
      }, area.delay);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname, user, loading, hasVisitedArea, isOnboardingEnabled]);

  // Handle guide dismissal
  const handleClose = useCallback(async () => {
    if (currentArea) {
      // Mark area as visited
      await markAreaVisited(currentArea.id);
    }
    setShowGuide(false);
  }, [currentArea, markAreaVisited]);

  // Don't render anything if no area or not showing guide
  if (!currentArea || !showGuide) {
    return null;
  }

  return (
    <>
      {currentArea && showGuide && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-start justify-center pt-20">
          <div className="pointer-events-auto">
            <OnboardingGuide
              area={currentArea}
              open={showGuide}
              onClose={handleClose}
              targetElement={targetElement}
            />
          </div>
        </div>
      )}
    </>
  );
}
