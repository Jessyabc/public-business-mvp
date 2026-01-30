import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Building2, BarChart3, Users, Settings, FileText, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserOrgId } from '@/features/orgs/hooks/useUserOrgId';

interface BusinessSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

export function BusinessSlidePanel({ isOpen, onClose, onBack }: BusinessSlidePanelProps) {
  const navigate = useNavigate();
  const { data: orgId } = useUserOrgId();

  const handleNavigate = (path: string) => {
    onClose(); // Close panel first for smooth transition
    // Small delay to allow panel animation to start
    setTimeout(() => {
      navigate(path);
    }, 150);
  };

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/business-dashboard' },
    { icon: FileText, label: 'Business Posts', path: '/business-dashboard?tab=posts' },
    { icon: Users, label: 'Team Members', path: '/business-members' },
    { icon: Settings, label: 'Organization Settings', path: '/business-settings' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 bottom-0 w-[85%] max-w-[320px] z-[101]",
              "bg-[#EAE6E2]/98 backdrop-blur-xl",
              "border-l border-[#D5D0CA]",
              "shadow-[-8px_0_32px_rgba(0,0,0,0.2)]",
              "flex flex-col"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#D5D0CA]">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2 rounded-full hover:bg-[#D5D0CA] transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-[#4D4843]" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#4A7C9B]/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-[#4A7C9B]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#2D2926]">Business</p>
                    <p className="text-xs text-[#6B635B]">Dashboard & Tools</p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-[#D5D0CA]"
              >
                <X className="h-5 w-5 text-[#4D4843]" />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-3">
                {menuItems.map((item) => (
                  <button
                    key={item.path + item.label}
                    onClick={() => handleNavigate(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                      "text-[#2D2926] hover:bg-[#D5D0CA]",
                      "transition-colors duration-200"
                    )}
                    style={{
                      boxShadow: '3px 3px 6px rgba(166, 150, 130, 0.15), -3px -3px 6px rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    <item.icon className="h-5 w-5 text-[#4A7C9B]" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* Quick Stats */}
              <div className="mt-6 px-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8B8580] mb-3">
                  Quick Actions
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleNavigate('/business-dashboard')}
                    className="p-4 rounded-xl text-center"
                    style={{
                      background: '#E0DCD8',
                      boxShadow: '4px 4px 8px rgba(166, 150, 130, 0.2), -4px -4px 8px rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-[#4A7C9B]" />
                    <span className="text-xs font-medium text-[#4D4843]">Analytics</span>
                  </button>
                  <button
                    onClick={() => handleNavigate('/business-members')}
                    className="p-4 rounded-xl text-center"
                    style={{
                      background: '#E0DCD8',
                      boxShadow: '4px 4px 8px rgba(166, 150, 130, 0.2), -4px -4px 8px rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    <Users className="h-6 w-6 mx-auto mb-2 text-[#4A7C9B]" />
                    <span className="text-xs font-medium text-[#4D4843]">Team</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer hint */}
            <div className="p-4 border-t border-[#D5D0CA]">
              <p className="text-xs text-center text-[#8B8580]">
                Swipe left to go back to Profile
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
