import { ReactNode, useState, useEffect, useRef } from 'react';
import { AppShell } from '@mantine/core';
import HeaderBar from '../components/Header';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollYRef = useRef<number>(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const last = lastScrollYRef.current;
      if (y <= 0) {
        if (isHeaderHidden) setIsHeaderHidden(false);
      } else if (y > last && y > 80) {
        if (!isHeaderHidden) setIsHeaderHidden(true);
      } else if (y < last) {
        if (isHeaderHidden) setIsHeaderHidden(false);
      }
      lastScrollYRef.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHeaderHidden]);

  return (
    <AppShell
      header={{ height: 72 }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#F5F7FB',
          fontFamily: 'Inter, Poppins, sans-serif',
          paddingTop: 72,
        },
      }}
    >
      <AppShell.Header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transform: isHeaderHidden ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 220ms ease',
          background: '#FFFFFF',
          borderBottom: '1px solid #EEEEEE',
        }}
      >
        <HeaderBar />
      </AppShell.Header>
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

