import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FAQ() {
  const faqs = [
    {
      category: 'General',
      questions: [
        {
          question: 'Is Public Business ad-free?',
          answer: 'Yes, Public Business is completely ad-free. We believe in creating a distraction-free environment where substantive content and meaningful connections take priority over advertising revenue.'
        },
        {
          question: 'What\'s the difference between Utility, Involvement, and T-score?',
          answer: 'T-score tracks your intellectual contributions through brainstorms and idea development for Public Members. Utility Score measures how valuable business content is to the community. Involvement Score reflects engagement with business reports and white papers.'
        },
        {
          question: 'Can I switch between Public and Business modes?',
          answer: 'Yes, you can toggle between Public and Business modes using the mode switcher. Public mode focuses on brainstorms and community engagement, while Business mode emphasizes professional content, reports, and company insights.'
        }
      ]
    },
    {
      category: 'Content & Publishing',
      questions: [
        {
          question: 'How are Business Reports and White Papers different?',
          answer: 'White Papers are comprehensive research documents with annotations and version control. Business Reports are typically shorter, focus on company updates, financial information, or strategic insights. Both are professional-grade content but serve different purposes.'
        },
        {
          question: 'Can I publish content without being a Business Member?',
          answer: 'Public Members can create brainstorms and participate in idea development. Only Business Members can publish white papers and official business reports. However, Public Members can comment, annotate, and engage with all published content.'
        },
        {
          question: 'How do annotations work on white papers?',
          answer: 'Annotations allow readers to add comments, questions, or insights directly to specific sections of white papers. Authors can respond to annotations, creating collaborative discussions around the content. All annotations are public and contribute to the overall value of the publication.'
        }
      ]
    },
    {
      category: 'Membership & Access',
      questions: [
        {
          question: 'Do I need a membership to read reports?',
          answer: 'Basic access to most content is free. Premium memberships (coming soon) will provide enhanced access to exclusive reports, advanced features, and priority support. Some high-value business reports may require premium access.'
        },
        {
          question: 'How do I become a Business Member?',
          answer: 'Apply through our Business Member application process. We review applications based on company legitimacy, content quality potential, and alignment with our professional community standards. Not all applications are automatically approved.'
        },
        {
          question: 'What happens to my data if I cancel my account?',
          answer: 'You can download your data at any time. Published content remains on the platform (as it may be referenced by others), but your personal information is deleted according to our privacy policy. You can request complete content removal if needed.'
        }
      ]
    },
    {
      category: 'Community & Recognition',
      questions: [
        {
          question: 'Where can I see the Most Influential boards?',
          answer: 'Most Influential boards are accessible from the main navigation and showcase top-performing Public Members (by T-score) and Business Members (by Utility and Involvement scores). These boards update regularly based on community engagement and content quality.'
        },
        {
          question: 'How is the T-score calculated?',
          answer: 'T-score reflects the quality and impact of your brainstorm contributions. It considers factors like idea originality, engagement from other members, branching frequency, and long-term discussion value. Higher-quality, more thought-provoking contributions score higher.'
        },
        {
          question: 'Can I collaborate with Business Members?',
          answer: 'Absolutely! Public Members can engage with Business Member content through annotations, brainstorm extensions, and direct networking features (available with premium membership). This cross-pollination of ideas is core to our platform.'
        }
      ]
    },
    {
      category: 'Technical & Privacy',
      questions: [
        {
          question: 'How do you protect my privacy?',
          answer: 'We use industry-standard encryption, never sell user data, and provide granular privacy controls. Your intellectual property remains yours. We\'re transparent about data usage and provide easy export/deletion options.'
        },
        {
          question: 'Is there a mobile app?',
          answer: 'Our web platform is fully responsive and works excellently on mobile devices. A dedicated mobile app is in development and will be available soon for enhanced on-the-go access.'
        },
        {
          question: 'How do I report inappropriate content?',
          answer: 'Use the report button available on all content, or contact our moderation team directly. We take community standards seriously and review all reports promptly. Serious violations can result in account suspension.'
        }
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
            <MessageCircle className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-light text-foreground tracking-wide">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 font-light max-w-2xl mx-auto">
            Quick answers to the most common questions about Public Business.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* FAQ Categories */}
        {faqs.map((category, categoryIdx) => (
          <Card key={categoryIdx} className="glass-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">{category.category}</h2>
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((faq, faqIdx) => (
                <AccordionItem 
                  key={faqIdx} 
                  value={`${categoryIdx}-${faqIdx}`}
                  className="border-border"
                >
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        ))}

        {/* Contact Section */}
        <Card className="glass-card p-8 text-center">
          <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find the answer you're looking for? Check our help center or get in touch with our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/support/help-center">
              <Button variant="outline">
                Browse Help Center
              </Button>
            </Link>
            <Link to="/contact">
              <Button>
                Contact Support
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}