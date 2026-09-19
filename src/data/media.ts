export interface MediaItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'image' | 'video';
  src: string;
  fallbackSrc?: string;
  placeholderAlt: string;
  isMissing?: boolean;
}

export const mediaConfig = {
  branding: {
    logo: '/images/mantif_logo.webp',
    fallbackLogo: '/images/mantif_logo.png',
    icon: '/images/mantif_icon.webp',
    fallbackIcon: '/images/mantif_icon.png',
  },
  founder: {
    name: 'Karunya S',
    role: 'Founder & Digital Marketing Strategist',
    image: '/images/founder_karunya_clean.webp',
    fallbackImage: '/images/founder_karunya.webp',
    bioShort: 'Spearheading the evolution from Tutoring Hub into MANTIF — unifying human empathy with AI-guided intelligence.',
  },
  developers: [
    {
      id: 'vishal',
      name: 'Vishal K',
      role: 'Development Team · Software Developer',
      image: '/images/team_vishal_clean.webp',
      fallbackImage: '/images/team_vishal.webp',
      description: 'Architecting dynamic reactive interfaces, responsive systems, and high-performance educational web applications.',
    },
    {
      id: 'solairaj',
      name: 'Solairaj R',
      role: 'Development Team · Software Developer',
      image: '/images/team_solairaj_clean.webp',
      fallbackImage: '/images/team_solairaj.webp',
      description: 'Engineering resilient backend pipelines, cloud microservices, and AI inference integrations for adaptive learning.',
    },
  ],
  tutoringImages: [
    {
      id: 'tutor-1',
      title: 'Creative Learning Circles',
      subtitle: 'Hands-on collaborative concept visualization at Tutoring Hub.',
      type: 'image' as const,
      src: '/images/gallery_1.webp',
      fallbackSrc: '/images/gallery_1.jpg',
      placeholderAlt: 'Tutoring Hub classroom collaboration',
    },
    {
      id: 'tutor-2',
      title: 'Interactive Discovery',
      subtitle: 'Exploring foundational mathematics and scientific inquiries together.',
      type: 'image' as const,
      src: '/images/gallery_2.webp',
      fallbackSrc: '/images/gallery_2.jpg',
      placeholderAlt: 'Students exploring science together',
    },
    {
      id: 'tutor-3',
      title: 'Personalized Mentorship',
      subtitle: 'Direct one-on-one doubt resolution and tailored pace adaptation.',
      type: 'image' as const,
      src: '/images/gallery_3.webp',
      fallbackSrc: '/images/gallery_3.jpg',
      placeholderAlt: 'Guided creative practice and formula analysis',
    },
  ],
  collectorMedia: {
    id: 'collector-office',
    title: 'District Collector Office Presentation',
    subtitle: 'Demonstrating AI-assisted digital pedagogy to regional administrative leadership.',
    type: 'image' as const,
    src: '/images/gallery_5.webp',
    fallbackSrc: '/images/gallery_5.jpg',
    placeholderAlt: 'Collector Office Education Initiative',
  },
  schoolWorkshopMedia: {
    id: 'school-workshop',
    title: 'Kongu National Higher Secondary School Seminar',
    subtitle: 'Empowering 50+ faculty educators with practical AI classroom integration.',
    banner: '/images/ai_seminar_banner.webp',
    fallbackBanner: '/images/ai_seminar_banner.png',
    video1: '/videos/session_video_1.mp4',
    video2: '/videos/session_video_2.mp4',
    image: '/images/gallery_4.webp',
    placeholderAlt: 'AI in Education: Empowering Teachers Today',
  },
  startupSingamMedia: {
    id: 'startup-singam',
    title: 'Startup Singam Recognition',
    subtitle: 'Spotlight on MANTIF as a high-impact EdTech innovation representing grassroots regional entrepreneurship.',
    type: 'image' as const,
    src: '/images/gallery_6.webp',
    fallbackSrc: '/images/gallery_6.jpg',
    placeholderAlt: 'Startup Singam Innovation Showcase',
  },
  launchMedia: {
    id: 'mantif-launch',
    title: 'Official MANTIF Platform Launch',
    subtitle: 'Transitioning the physical Tutoring Hub model into a modern AI-integrated digital learning environment.',
    type: 'image' as const,
    src: '/images/gallery_7.webp',
    fallbackSrc: '/images/gallery_7.jpg',
    placeholderAlt: 'MANTIF Launch Milestone',
  },
  hiringSessionMedia: {
    id: 'hiring-session',
    title: 'Coming Thursday Hiring Session',
    subtitle: 'Expanding our core engineering, content curation, and pedagogy teams for the next cohort.',
    type: 'image' as const,
    src: '', // Missing test case to showcase tasteful placeholder
    isMissing: true,
    placeholderAlt: 'Upcoming Talent Onboarding Session',
  },
};
