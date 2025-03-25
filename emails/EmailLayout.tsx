import {
  Body,
  Container,
  Text as EmailText,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

// Utiliser l'URL définie dans l'environnement ou une valeur par défaut
const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://co-sport.com";

export const EmailLayout = ({
  children,
  preview,
}: React.PropsWithChildren<{
  preview?: string;
}>) => {
  return (
    <Tailwind>
      <Html>
        <Head />
        {preview ? <Preview>{preview}</Preview> : null}
        <Body
          className="bg-slate-50 py-8"
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          <Container className="rounded-lg border border-slate-200 bg-white px-8 py-6 shadow-sm">
            <div className="mb-6 flex items-center justify-center border-b border-slate-200 pb-6">
              <Link href={baseUrl} style={{ textDecoration: "none" }}>
                <div className="flex items-center gap-3">
                  <Img
                    src={`${baseUrl}/icon.png`}
                    width="40"
                    height="40"
                    alt="Co-Sport"
                    style={{
                      objectFit: "contain",
                    }}
                  />
                  <EmailText
                    className="text-2xl font-bold text-slate-900"
                    style={{ color: "#0f172a", textDecoration: "none" }}
                  >
                    co-sport.com
                  </EmailText>
                </div>
              </Link>
            </div>
            <Section>{children}</Section>
            <Hr className="my-6 border-slate-200" />
            <Section className="text-center">
              <EmailText className="text-xs text-slate-500">
                © {new Date().getFullYear()} Co-Sport. Tous droits réservés.
              </EmailText>
              <EmailText className="mt-2 text-xs text-slate-500">
                Si vous avez des questions, contactez-nous à{" "}
                <Link
                  href="mailto:support@co-sport.com"
                  className="text-blue-600 underline"
                >
                  support@co-sport.com
                </Link>
              </EmailText>
              <EmailText className="mt-2 text-xs text-slate-500">
                <Link
                  href={`${baseUrl}/dashboard`}
                  className="text-blue-600 underline"
                >
                  Gérer mes préférences d'email
                </Link>
              </EmailText>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default EmailLayout;
