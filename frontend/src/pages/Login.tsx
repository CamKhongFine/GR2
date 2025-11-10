import { Box, Text, Title } from "@mantine/core";
import { AuthenticationForm } from "../components/component/AuthenticationForm";

export default function LoginPage() {
  return (
    <Box
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
      }}
    >
      {/* LEFT BRAND / TAGLINE */}
      <Box
        style={{
          width: "50%",
          background:
            "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)",
          color: "white",
          padding: "4rem 3rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Title order={1} style={{ fontSize: "48px", fontWeight: 800, lineHeight: 1.1 }}>
          BID SMARTER <br />WIN BIGGER
        </Title>

        <Text mt="md" size="lg" opacity={0.8}>
          Transparent real-time auctions for collectibles and fashion.
        </Text>

        <Text mt="xl" size="sm" opacity={0.8}>
          © 2025 Auction Platform
        </Text>
      </Box>

      {/* RIGHT AUTH FORM */}
      <Box
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
        }}
      >
        <AuthenticationForm />
      </Box>
    </Box>
  );
}
