// src/features/brainstorm/BrainstormPage.tsx
import { useSearchParams } from 'react-router-dom';
import SpaceCanvas from './components/SpaceCanvas';
import { RightSidebar } from '@/components/layout/RightSidebar'; // adjust if your path differs

export default function BrainstormPage() {
  const [params] = useSearchParams();
  const startId = params.get('id') || undefined;

  return (
    <div className="relative h-[calc(100vh-64px)] w-full">
      {/* Deep PB-blue canvas: wheel = hard chain, soft links rail */}
      <SpaceCanvas startId={startId} />

      {/* Overlayed right sidebar (Open Ideas + History) */}
      <div className="pointer-events-auto absolute right-0 top-0 h-full w-[360px] hidden xl:block z-30">
        <RightSidebar />
      </div>
    </div>
  );
}
