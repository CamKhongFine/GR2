import { Box } from '@mantine/core';
import { Navbar } from './Navbar';
import { Header } from './Header';
import { Pricing } from './Pricing';
import { Footer } from './Footer';

export function HomePage() {
  return (
    <Box>
      <Navbar />
      <Header />
      <Pricing />
      <Footer />
    </Box>
  );
}