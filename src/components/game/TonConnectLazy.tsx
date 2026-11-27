import { lazy, Suspense, type ReactNode } from 'react';

const TonConnectUIProvider = lazy(() =>
  import('@tonconnect/ui-react').then(m => ({ default: m.TonConnectUIProvider }))
);

export const TonConnectLazy = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  }>
    <TonConnectUIProvider manifestUrl="https://ace.alienflow.space/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  </Suspense>
);
