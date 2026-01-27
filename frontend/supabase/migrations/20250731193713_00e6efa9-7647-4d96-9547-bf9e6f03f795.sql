-- Insert dummy industries
INSERT INTO public.industries (name, description) VALUES 
('Technology', 'Software, hardware, and digital services'),
('Healthcare', 'Medical services and pharmaceuticals'),
('Finance', 'Banking, insurance, and financial services'),
('Education', 'Schools, universities, and training'),
('Manufacturing', 'Production and industrial processes')
ON CONFLICT (name) DO NOTHING;

-- Insert dummy departments
INSERT INTO public.departments (name, description) VALUES 
('Engineering', 'Software development and technical roles'),
('Marketing', 'Brand promotion and customer acquisition'),
('Sales', 'Revenue generation and customer relations'),
('Human Resources', 'People management and recruitment'),
('Operations', 'Business operations and logistics')
ON CONFLICT (name) DO NOTHING;

-- Create some dummy posts for testing
DO $$
DECLARE
  tech_industry_id uuid;
  healthcare_industry_id uuid;
  eng_dept_id uuid;
  marketing_dept_id uuid;
  dummy_user_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Get industry IDs
  SELECT id INTO tech_industry_id FROM public.industries WHERE name = 'Technology' LIMIT 1;
  SELECT id INTO healthcare_industry_id FROM public.industries WHERE name = 'Healthcare' LIMIT 1;
  
  -- Get department IDs  
  SELECT id INTO eng_dept_id FROM public.departments WHERE name = 'Engineering' LIMIT 1;
  SELECT id INTO marketing_dept_id FROM public.departments WHERE name = 'Marketing' LIMIT 1;

  -- Insert dummy posts
  INSERT INTO public.posts (
    user_id, title, content, type, visibility, mode, 
    industry_id, department_id, metadata, likes_count, 
    comments_count, views_count, u_score, status
  ) VALUES 
  (
    dummy_user_id,
    'AI-Powered Customer Service Revolution',
    'Exploring how artificial intelligence is transforming customer service operations. From chatbots to predictive analytics, companies are seeing 40% reduction in response times and 60% improvement in customer satisfaction. This comprehensive analysis covers implementation strategies, ROI metrics, and best practices for enterprise adoption.',
    'insight',
    'public',
    'business',
    tech_industry_id,
    eng_dept_id,
    '{"company": "TechCorp Solutions", "author_role": "CTO", "reading_time": "8 min"}',
    127,
    23,
    856,
    85,
    'active'
  ),
  (
    dummy_user_id,
    'Digital Marketing Trends 2024',
    'The landscape of digital marketing continues to evolve rapidly. This report examines emerging trends including voice search optimization, interactive content, and privacy-first marketing strategies. Key findings show that personalized experiences drive 80% higher engagement rates.',
    'report',
    'public',
    'business',
    tech_industry_id,
    marketing_dept_id,
    '{"company": "MarketingPro Inc", "author_role": "Marketing Director", "reading_time": "12 min"}',
    89,
    15,
    654,
    78,
    'active'
  ),
  (
    dummy_user_id,
    'Healthcare Data Security Best Practices',
    'With increasing digitization in healthcare, protecting patient data has never been more critical. This whitepaper outlines HIPAA compliance strategies, encryption protocols, and incident response procedures that have proven effective across 500+ healthcare organizations.',
    'whitepaper',
    'public',
    'business',
    healthcare_industry_id,
    eng_dept_id,
    '{"company": "HealthTech Systems", "author_role": "Security Architect", "reading_time": "15 min"}',
    156,
    31,
    1203,
    92,
    'active'
  ),
  (
    dummy_user_id,
    'Brainstorm: Sustainable Office Solutions',
    'Looking for innovative ideas to make our office more environmentally friendly. Current initiatives include LED lighting and recycling programs. What other sustainable practices have worked well for your organization? Particularly interested in energy reduction and waste minimization strategies.',
    'brainstorm',
    'public',
    'public',
    NULL,
    NULL,
    '{"discussion_points": ["Energy efficiency", "Waste reduction", "Green transportation"], "participant_count": 12}',
    42,
    18,
    234,
    NULL,
    'active'
  ),
  (
    dummy_user_id,
    'Remote Work Productivity Tips',
    'After 3 years of remote work, here are the strategies that actually work for maintaining productivity and work-life balance. From setting up dedicated workspaces to managing digital distractions, these tips come from real experience managing distributed teams.',
    'insight',
    'public',
    'public',
    NULL,
    NULL,
    '{"tips_count": 15, "experience_years": 3}',
    67,
    9,
    445,
    NULL,
    'active'
  );
  
END $$;