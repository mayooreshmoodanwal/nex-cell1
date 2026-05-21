/**
 * OTP EMAIL TEMPLATE
 * The login code email — the most critical email in the system.
 * Uses React Email components for consistent rendering across email clients.
 */

import {
  Body, Container, Head, Heading, Html, Preview,
  Section, Text, Hr, Row, Column,
} from "@react-email/components";
import * as React from "react";

interface OtpEmailProps {
  otp:        string;
  email:      string;
  expiresAt:  Date;
  ipAddress?: string;
}

export function OtpEmailTemplate({ otp, email, expiresAt, ipAddress }: OtpEmailProps) {
  const digits = otp.split("");

  return (
    <Html>
      <Head />
      <Preview>Your Vibe Coders login code: {otp} (expires in 5 minutes)</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.logo}>
              Vibe <span style={{ color: "#ffa16c" }}>Coders</span>
            </Heading>
            <Text style={styles.tagline}>VC Cell · Mirai School of Technology</Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Content */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>Your login code</Text>
            <Text style={styles.instruction}>
              Enter this code on the Vibe Coders login page to sign in.
              Do not share this code with anyone.
            </Text>

            {/* OTP Display */}
            <Section style={styles.otpContainer}>
              <Row>
                {digits.map((digit, i) => (
                  <Column key={i} style={styles.digitCell}>
                    <Text style={styles.digit}>{digit}</Text>
                  </Column>
                ))}
              </Row>
            </Section>

            <Text style={styles.expiry}>
              This code expires at {expiresAt.toLocaleTimeString("en-IN", {
                hour:   "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Kolkata",
              })} IST
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Security note */}
          <Section style={styles.securityNote}>
            <Text style={styles.securityTitle}>Security notice</Text>
            <Text style={styles.securityText}>
              If you did not request this code, please ignore this email.
              Your account is safe — no action is needed.
            </Text>
            {ipAddress && (
              <Text style={styles.ipText}>
                Request from IP: {ipAddress}
              </Text>
            )}
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Vibe Coders — VC Cell of Mirai School of Technology
            </Text>
            <Text style={styles.footerText}>
              vibecoders.mirai@gmail.com · Instagram: @vibecoders.mirai
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: "#05130e",
    fontFamily:      "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin:          "0",
    padding:         "40px 16px",
  },
  container: {
    backgroundColor: "#092017",
    borderRadius:    "16px",
    border:          "1px solid #184734",
    maxWidth:        "520px",
    margin:          "0 auto",
    overflow:        "hidden",
  },
  header: {
    padding:   "32px 40px 24px",
    textAlign: "center",
  },
  logo: {
    color:      "#faf6ee",
    fontSize:   "28px",
    fontWeight: "700",
    margin:     "0 0 8px",
    letterSpacing: "-0.5px",
  },
  tagline: {
    color:     "#889f93",
    fontSize:  "13px",
    margin:    "0",
  },
  divider: {
    borderColor: "#184734",
    margin:      "0",
  },
  content: {
    padding: "32px 40px",
  },
  greeting: {
    color:      "#faf6ee",
    fontSize:   "20px",
    fontWeight: "600",
    margin:     "0 0 8px",
  },
  instruction: {
    color:      "#dcd7cc",
    fontSize:   "14px",
    lineHeight: "1.6",
    margin:     "0 0 28px",
  },
  otpContainer: {
    backgroundColor: "#103426",
    borderRadius:    "12px",
    border:          "1px solid #184734",
    padding:         "20px",
    textAlign:       "center",
    marginBottom:    "16px",
  },
  digitCell: {
    padding: "0 6px",
  },
  digit: {
    color:           "#ffa16c",
    fontSize:        "36px",
    fontWeight:      "700",
    fontFamily:      "monospace",
    letterSpacing:   "4px",
    margin:          "0",
    textAlign:       "center",
  },
  expiry: {
    color:     "#889f93",
    fontSize:  "13px",
    textAlign: "center",
    margin:    "0",
  },
  securityNote: {
    padding: "24px 40px",
  },
  securityTitle: {
    color:      "#ffa16c",
    fontSize:   "12px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    margin:     "0 0 8px",
  },
  securityText: {
    color:      "#889f93",
    fontSize:   "13px",
    lineHeight: "1.6",
    margin:     "0 0 8px",
  },
  ipText: {
    color:      "#5f7c6b",
    fontSize:   "12px",
    fontFamily: "monospace",
    margin:     "0",
  },
  footer: {
    borderTop: "1px solid #184734",
    padding:   "20px 40px",
    textAlign: "center",
  },
  footerText: {
    color:     "#5f7c6b",
    fontSize:  "12px",
    margin:    "0 0 4px",
  },
};

export default OtpEmailTemplate;
