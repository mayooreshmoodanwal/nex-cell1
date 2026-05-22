import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components";
import * as React from "react";

interface WalletCreditEmailProps { name: string; amountMb: number; amountInr: number; description: string; newBalance: number; }

export function WalletCreditEmailTemplate({ name, amountMb, amountInr, description, newBalance }: WalletCreditEmailProps) {
  return (
    <Html><Head />
      <Preview>₥{amountMb.toLocaleString()} has been credited to your Vibe Coders wallet</Preview>
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
            <Text style={{ color: "#ffa16c", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: "0 0 8px" }}>Wallet credited</Text>
            <Heading style={{ color: "#faf6ee", fontSize: "36px", margin: "0 0 4px" }}>+₥{amountMb.toLocaleString()}</Heading>
            <Text style={{ color: "#889f93", fontSize: "14px", margin: "0 0 24px" }}>₹{amountInr} converted at 1:100 rate</Text>
            <Text style={{ color: "#dcd7cc", fontSize: "14px", margin: "0 0 8px" }}><strong style={{ color: "#faf6ee" }}>Description:</strong> {description}</Text>
            <Text style={{ color: "#dcd7cc", fontSize: "14px", margin: "0" }}><strong style={{ color: "#faf6ee" }}>New balance:</strong> <span style={{ color: "#ffa16c" }}>₥{newBalance.toLocaleString()}</span></Text>
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
export default WalletCreditEmailTemplate;
