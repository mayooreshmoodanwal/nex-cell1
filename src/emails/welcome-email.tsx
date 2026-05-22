import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Button } from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps { name: string; email: string; }

export function WelcomeEmailTemplate({ name, email }: WelcomeEmailProps) {
  return (
    <Html><Head />
      <Preview>Welcome to Vibe Coders — Where Founders Are Made</Preview>
      <Body style={{ backgroundColor: "#05130e", fontFamily: "sans-serif", padding: "40px 16px" }}>
        <Container style={{ backgroundColor: "#092017", borderRadius: "16px", border: "1px solid #184734", maxWidth: "520px", margin: "0 auto" }}>
          <Section style={{ padding: "32px 40px 24px", textAlign: "center" as const }}>
            <Heading style={{ color: "#faf6ee", fontSize: "28px", margin: "0 0 8px" }}>
              Vibe <span style={{ color: "#ffa16c" }}>Coders</span>
            </Heading>
            <Text style={{ color: "#889f93", fontSize: "13px", margin: "0" }}>VC Cell · Mirai School of Technology</Text>
          </Section>
          <Hr style={{ borderColor: "#184734", margin: "0" }} />
          <Section style={{ padding: "32px 40px" }}>
            <Heading style={{ color: "#faf6ee", fontSize: "22px", margin: "0 0 16px" }}>Welcome, {name}!</Heading>
            <Text style={{ color: "#dcd7cc", fontSize: "15px", lineHeight: "1.7", margin: "0 0 24px" }}>
              You&apos;ve just joined Vibe Coders — the VC Cell of Mirai School of Technology.
              Your account is ready. Explore upcoming events, build your Mirai Bucks wallet, and connect with fellow founders.
            </Text>
            <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
              style={{ backgroundColor: "#ffa16c", color: "#05130e", borderRadius: "8px", padding: "12px 28px", fontSize: "14px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}>
              Go to my dashboard
            </Button>
          </Section>
          <Hr style={{ borderColor: "#184734", margin: "0" }} />
          <Section style={{ padding: "20px 40px", textAlign: "center" as const }}>
            <Text style={{ color: "#5f7c6b", fontSize: "12px", margin: "0" }}>
              Vibe Coders · vibecoders.mirai@gmail.com · @vibecoders.mirai
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
export default WelcomeEmailTemplate;
