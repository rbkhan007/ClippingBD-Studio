// Team Members Data - Only 2 Real Team Members
// This file contains all team member information for the Our Teams page

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  image: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  expertise: string[];
  yearsExperience: number;
  location: string;
}

export interface TeamDepartment {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  members: TeamMember[];
}

export const teamDepartments: TeamDepartment[] = [
  {
    id: 'leadership',
    name: 'Leadership',
    description: 'Our visionary leaders guiding ClippingPath & Website Services Studio to excellence',
    icon: 'Crown',
    gradient: 'from-amber-500 to-orange-600',
    members: [
      {
        id: 'owner',
        name: 'Belal Sarker',
        role: 'Admin & Owner',
        department: 'Leadership',
        bio: 'Leading the strategic vision and administrative operations of ClippingPath & Website Services Studio, ensuring business growth and client excellence across 120+ countries.',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Belal&backgroundColor=c0aede',
        social: { linkedin: '#', twitter: '#' },
        expertise: ['Strategic Vision', 'Business Administration', 'Client Excellence', 'Global Operations'],
        yearsExperience: 10,
        location: 'Dinajpur, Bangladesh'
      },
      {
        id: 'lead-dev',
        name: 'Rakibul Hasan',
        role: 'Developer & Designer',
        department: 'Leadership',
        bio: 'The architect behind ClippingPath & Website Services Studio\'s digital infrastructure. Specializing in high-performance Web Development (Next.js, Prisma) and modern UI/UX design to provide a seamless client experience.',
        image: '/images/Rakibul Hasan.JPG',
        social: { linkedin: '#', github: '#' },
        expertise: ['Next.js Development', 'UI/UX Design', 'Prisma ORM', 'Full-stack Development'],
        yearsExperience: 5,
        location: 'Dhaka, Bangladesh'
      },
      {
        id: 'qa-tester',
        name: 'A.R. Ashik',
        role: 'QA & Bug Tester',
        department: 'Leadership',
        bio: 'Expert in quality assurance and bug detection. Ensures every deliverable meets the highest standards of quality before final delivery to clients.',
        image: '/images/A.R.Ashik.jpeg',
        social: { linkedin: '#', github: '#' },
        expertise: ['Quality Assurance', 'Bug Testing', 'Performance Testing', 'Automation Testing'],
        yearsExperience: 3,
        location: 'Bangladesh'
      }
    ]
  }
];

// Team statistics
export const teamStats = [
  { value: '2', label: 'Team Members', icon: 'Users' },
  { value: '2', label: 'Countries', icon: 'Globe' },
  { value: '1', label: 'Departments', icon: 'Building' },
  { value: '24/7', label: 'Support Coverage', icon: 'Clock' },
  { value: '7.5 yrs', label: 'Avg Experience', icon: 'Award' },
  { value: '2', label: 'Languages Spoken', icon: 'MessageSquare' }
];

// Get all team members flat list
export function getAllTeamMembers(): TeamMember[] {
  return teamDepartments.flatMap(dept => dept.members);
}

// Get team member by ID
export function getTeamMember(id: string): TeamMember | undefined {
  return getAllTeamMembers().find(member => member.id === id);
}

// Get department by ID
export function getDepartment(id: string): TeamDepartment | undefined {
  return teamDepartments.find(dept => dept.id === id);
}
