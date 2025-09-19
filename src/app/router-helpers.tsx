import { Suspense, type ReactNode } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner />
    </div>
  );
}

export function LazyWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

export function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-[50vh] flex items-center justify-center text-center p-8">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
          <p className="text-muted-foreground">
            The page you’re looking for doesn’t exist{' '}
            <a href="/" className="underline">Go home</a>.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
