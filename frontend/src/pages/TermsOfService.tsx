import { Card } from '@/components/ui/card';
import { Scale, Calendar, Mail } from 'lucide-react';

export default function TermsOfService() {
  const lastUpdated = "January 15, 2024";

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      content: [
        "Agreement: By accessing or using Public Business, you agree to be bound by these Terms of Service and our Privacy Policy.",
        "Age Requirement: You must be at least 16 years old to use our services.",
        "Modifications: We reserve the right to modify these terms at any time. Continued use constitutes acceptance of updated terms.",
        "Binding Agreement: These terms constitute a legally binding agreement between you and Public Business."
      ]
    },
    {
      id: "account-responsibilities",
      title: "Account Responsibilities",
      content: [
        "Accurate Information: You must provide accurate, current, and complete information when creating your account.",
        "Account Security: You are responsible for maintaining the confidentiality of your account credentials.",
        "Authorized Use: You are responsible for all activities that occur under your account.",
        "Notification: You must immediately notify us of any unauthorized use of your account or security breaches."
      ]
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use Policy",
      content: [
        "Lawful Use: You may only use our platform for lawful purposes and in accordance with these terms.",
        "Professional Conduct: Maintain professional standards appropriate for business and academic discourse.",
        "No Harassment: Do not harass, threaten, or intimidate other users.",
        "Respect IP: Respect intellectual property rights of others and do not post copyrighted material without permission.",
        "No Spam: Do not post spam, unsolicited advertisements, or engage in manipulative behaviors."
      ]
    },
    {
      id: "content-policies",
      title: "Content Policies",
      content: [
        "User Content: You retain ownership of content you create, but grant us license to use, display, and distribute it on our platform.",
        "Content Standards: All content must meet our community guidelines and professional standards.",
        "Prohibited Content: No illegal, harmful, defamatory, or inappropriate content is permitted.",
        "Content Removal: We reserve the right to remove content that violates our policies.",
        "Backup Responsibility: You are responsible for maintaining backups of your important content."
      ]
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property Rights",
      content: [
        "Platform Rights: Public Business and its features are protected by copyright, trademark, and other intellectual property laws.",
        "User License: You grant us a non-exclusive, worldwide license to use your content for platform operations.",
        "Respect Others: You must respect the intellectual property rights of other users and third parties.",
        "DMCA Compliance: We comply with the Digital Millennium Copyright Act and will respond to valid takedown notices.",
        "Attribution: Proper attribution is required when referencing or building upon others' work."
      ]
    },
    {
      id: "business-members",
      title: "Business Member Terms",
      content: [
        "Verification: Business Members must provide accurate company information and may be subject to verification.",
        "Representation: Business Members represent that they have authority to bind their organization to these terms.",
        "Professional Standards: Business Members are held to higher professional and content quality standards.",
        "Commercial Use: Business Members may promote their services within platform guidelines but cannot engage in pure advertising.",
        "Compliance: Business Members must comply with applicable business and industry regulations."
      ]
    },
    {
      id: "privacy-data",
      title: "Privacy and Data Protection",
      content: [
        "Privacy Policy: Your privacy is governed by our separate Privacy Policy, incorporated by reference.",
        "Data Collection: We collect and process data as described in our Privacy Policy.",
        "User Rights: You have certain rights regarding your personal data as outlined in our Privacy Policy.",
        "Data Security: We implement reasonable security measures to protect your data.",
        "International Transfers: Your data may be processed in countries where we operate our services."
      ]
    },
    {
      id: "platform-availability",
      title: "Platform Availability",
      content: [
        "Service Availability: We strive to maintain platform availability but cannot guarantee uninterrupted service.",
        "Maintenance: We may perform maintenance that temporarily affects platform availability.",
        "Updates: We regularly update our platform and may change features or functionality.",
        "No Warranty: The platform is provided 'as is' without warranties of any kind."
      ]
    },
    {
      id: "limitation-liability",
      title: "Limitation of Liability",
      content: [
        "Disclaimer: To the maximum extent permitted by law, we disclaim liability for indirect, incidental, or consequential damages.",
        "User Content: We are not responsible for user-generated content or interactions between users.",
        "Third Parties: We are not liable for actions of third parties or external websites linked from our platform.",
        "Damages Cap: Our total liability to you shall not exceed the amount you paid for services in the preceding 12 months."
      ]
    },
    {
      id: "termination",
      title: "Termination",
      content: [
        "User Termination: You may terminate your account at any time by following the account deletion process.",
        "Our Rights: We may suspend or terminate accounts that violate these terms or for other legitimate reasons.",
        "Effect of Termination: Upon termination, your right to use the platform ceases, but certain provisions survive.",
        "Data Retention: Some data may be retained after termination as described in our Privacy Policy."
      ]
    },
    {
      id: "dispute-resolution",
      title: "Dispute Resolution",
      content: [
        "Governing Law: These terms are governed by the laws of Quebec, Canada.",
        "Jurisdiction: Disputes shall be resolved in the courts of Quebec, Canada.",
        "Informal Resolution: We encourage users to contact us first to resolve disputes informally.",
        "Class Action Waiver: You agree to resolve disputes individually and waive participation in class actions."
      ]
    },
    {
      id: "general-provisions",
      title: "General Provisions",
      content: [
        "Entire Agreement: These terms, together with our Privacy Policy, constitute the entire agreement between us.",
        "Severability: If any provision is found unenforceable, the remaining provisions continue in effect.",
        "Assignment: We may assign our rights under these terms; you may not assign your rights without our consent.",
        "Force Majeure: We are not liable for delays or failures due to circumstances beyond our reasonable control."
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
            <Scale className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-light text-foreground tracking-wide">
              Terms of Service
            </h1>
          </div>
          <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-4">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Last updated: {lastUpdated}</span>
          </div>
          <p className="text-muted-foreground mt-2 font-light max-w-2xl mx-auto">
            The terms and conditions governing your use of Public Business.
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
            <strong>Disclaimer:</strong> These terms of service are provided for informational purposes and are not intended as legal advice. 
            They may not be suitable for all jurisdictions. Consult with a qualified attorney for legal compliance in your specific situation.
          </p>
        </Card>

        {/* Terms Sections */}
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
          <h2 className="text-2xl font-semibold text-foreground mb-4">Questions About Terms?</h2>
          <p className="text-muted-foreground mb-6">
            If you have questions about these terms of service, please contact our legal team.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Email:</strong>{' '}
              <a href="mailto:legal@publicbusiness.com" className="text-primary hover:underline">
                legal@publicbusiness.com
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