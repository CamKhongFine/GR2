import { useEffect } from 'react';
import { AppShell, ActionIcon, Tooltip } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconChevronRight } from '@tabler/icons-react';
import SellerSidebar from '../components/SellerSidebar';

export default function SellerLayout() {
  const [navbarOpened, { toggle, open, close }] = useDisclosure(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (isDesktop) open();
    else close();
  }, [isDesktop, open, close]);

  return (
    <AppShell
      layout="default"
      padding="md"
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: {
          mobile: !navbarOpened,
          desktop: !navbarOpened,
        },
      }}
      styles={{
        main: {
          backgroundColor: '#f5f6f8',
          position: 'relative',
          overflowX: 'hidden',
          minHeight: '100vh',
        },
      }}
    >
      <AppShell.Navbar>
        <SellerSidebar navbarOpened={navbarOpened} toggle={toggle} />
      </AppShell.Navbar>

      <AppShell.Main>
        {}
        {!navbarOpened && (
          <Tooltip label="Open sidebar" position="right" withArrow>
            <ActionIcon
              onClick={toggle}
              variant="filled"
              color="orange"
              radius="xl"
              size="lg"
              style={{
                position: 'fixed',
                top: '50%',
                left: 10,
                transform: 'translateY(-50%)',
                zIndex: 4000,
                boxShadow: '0 0 8px rgba(0,0,0,0.3)',
              }}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Tooltip>
        )}

        {}
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
