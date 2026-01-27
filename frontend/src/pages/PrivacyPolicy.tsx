import { Card } from '@/components/ui/card';
import { Shield, Calendar, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = "January 15, 2024";

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      content: [
        "Account Information: When you create an account, we collect your name, email address, and profile information you choose to provide.",
        "Content: We store your posts, comments, white papers, business reports, and other content you publish on our platform.",
        "Usage Data: We collect information about how you use our platform, including pages visited, features used, and time spent.",
        "Technical Information: We automatically collect IP addresses, browser information, device identifiers, and similar technical data."
      ]
    },
    {
      id: "information-use",
      title: "How We Use Information",
      content: [
        "Provide Services: To operate and improve our platform, including brainstorm connections, T-score calculations, and content recommendations.",
        "Communication: To send you important updates, notifications about platform activity, and respond to your inquiries.",
        "Safety & Security: To detect fraud, prevent spam, enforce our terms of service, and maintain platform security.",
        "Analytics: To understand how our platform is used and improve user experience through aggregated, non-personal data analysis."
      ]
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      content: [
        "Public Content: Content you publish (posts, comments, profiles) is visible to other users as intended by the platform's social features.",
        "Business Partners: We may share aggregated, non-personal data with business partners for platform improvement and research.",
        "Legal Requirements: We may disclose information when required by law, court order, or to protect our rights and safety.",
        "Service Providers: We may share data with trusted third-party services that help us operate the platform (hosting, analytics, etc.)."
      ]
    },
    {
      id: "data-retention",
      title: "Data Retention",
      content: [
        "Account Data: We retain your account information while your account is active and for a reasonable period after deletion for legal and operational purposes.",
        "Content: Published content may remain on the platform even after account deletion, as it may be referenced or built upon by other users.",
        "Usage Data: Technical and usage data is typically retained for up to 2 years for analytics and security purposes.",
        "Legal Holds: We may retain data longer when required by law or ongoing legal proceedings."
      ]
    },
    {
      id: "user-rights",
      title: "Your Rights",
      content: [
        "Access: You can request a copy of the personal data we have about you.",
        "Correction: You can update or correct your personal information through your account settings.",
        "Deletion: You can request deletion of your account and personal data, subject to legal and operational requirements.",
        "Portability: You can request your data in a machine-readable format for transfer to other services."
      ]
    },
    {
      id: "security",
      title: "Security Measures",
      content: [
        "Encryption: We use industry-standard encryption to protect data in transit and at rest.",
        "Access Controls: We implement strict access controls and authentication measures for our systems.",
        "Regular Audits: We conduct regular security audits and vulnerability assessments.",
        "Incident Response: We have procedures in place to detect, respond to, and notify users of security incidents."
      ]
    },
    {
      id: "cookies",
      title: "Cookies and Tracking",
      content: [
        "Essential Cookies: We use necessary cookies for platform functionality, authentication, and security.",
        "Analytics: We use analytics cookies to understand platform usage and improve user experience.",
        "Preferences: We store user preferences and settings to enhance your experience.",
        "Third-Party: Some features may include third-party cookies (embedded content, analytics). See our Cookie Policy for details."
      ]
    },
    {
      id: "international",
      title: "International Users",
      content: [
        "Data Transfers: Your information may be transferred to and processed in countries where we operate our services.",
        "Legal Basis: We process data based on consent, legitimate interests, contract fulfillment, or legal obligations.",
        "Regional Rights: Users in certain jurisdictions (EU, California, etc.) may have additional privacy rights under local laws.",
        "Contact: For region-specific privacy questions, contact us using the information below."
      ]
    },
    {
      id: "children",
      title: "Children's Privacy",
      content: [
        "Age Requirement: Our platform is intended for users 16 years and older.",
        "No Collection: We do not knowingly collect personal information from children under 16.",
        "Parental Notice: If we become aware of data from a child under 16, we will delete it promptly.",
        "Verification: We may request age verification for account creation and certain features."
      ]
    },
    {
      id: "changes",
      title: "Policy Changes",
      content: [
        "Updates: We may update this privacy policy to reflect changes in our practices or legal requirements.",
        "Notification: We will notify users of significant changes through email or platform announcements.",
        "Effective Date: Changes become effective on the date specified in the updated policy.",
        "Review: We encourage users to review this policy periodically for updates."
      ]
    }
  ];

  return (
    <div className="min-h-screen p-6 pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="mb-12 text-center">
        <div className="glass-card rounded-3xl p-8 backdrop-blur-xl mb-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-light text-foreground tracking-wide">
              Privacy Policy
            </h1>
          </div>
          <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-4">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Last updated: {lastUpdated}</span>
          </div>
          <p className="text-muted-foreground mt-2 font-light max-w-2xl mx-auto">
            How we collect, use, and protect your personal information on Public Business.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Table of Contents */}
        <Card className="glass-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section, idx) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {idx + 1}. {section.title}
              </a>
            ))}
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="glass-card p-6 bg-orange-500/5 border-orange-500/20">
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> This privacy policy is provided for informational purposes and is not intended as legal advice. 
            It may not be suitable for all jurisdictions. Consult with a qualified attorney for legal compliance in your specific situation.
          </p>
        </Card>

        {/* Policy Sections */}
        {sections.map((section, idx) => (
          <Card key={section.id} id={section.id} className="glass-card p-8 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {idx + 1}. {section.title}
            </h2>
            <div className="space-y-4">
              {section.content.map((paragraph, pIdx) => (
                <p key={pIdx} className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">{paragraph.split(':')[0]}:</strong>
                  {paragraph.includes(':') ? paragraph.split(':').slice(1).join(':') : paragraph}
                </p>
              ))}
            </div>
          </Card>
        ))}

        {/* Contact Information */}
        <Card className="glass-card p-8 text-center">
          <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Privacy Questions?</h2>
          <p className="text-muted-foreground mb-6">
            If you have questions about this privacy policy or how we handle your data, please contact us.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Email:</strong>{' '}
              <a href="mailto:privacy@publicbusiness.com" className="text-primary hover:underline">
                privacy@publicbusiness.com
              </a>
            </p>
            <p>
              <strong className="text-foreground">General Contact:</strong>{' '}
              <a href="mailto:contact@publicbusiness.com" className="text-primary hover:underline">
                contact@publicbusiness.com
              </a>
            </p>
            <p>
              <strong className="text-foreground">Address:</strong> Mascouche, QC, Canada
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}