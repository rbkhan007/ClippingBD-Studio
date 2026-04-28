'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Crown, Edit3, Video, CheckCircle, Code, Headphones,
  Globe, Clock, Award, MessageSquare, Building, MapPin,
  Linkedin, Twitter, Github, ChevronRight, Star, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/app-store';
import { teamDepartments, teamStats, type TeamMember, type TeamDepartment } from '@/data/team';

// Icon mapping
const iconMap: Record<string, any> = {
  Crown, Edit3, Video, CheckCircle, Code, Headphones, Users, Globe, Clock, Award, MessageSquare, Building
};

export function TeamsPage() {
  const [activeDepartment, setActiveDepartment] = useState<string>('all');
  const [dbTeamMembers, setDbTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/team', { next: { revalidate: 60 } });
        const data = await response.json();
        if (data.success && data.teamMembers) {
          setDbTeamMembers(data.teamMembers);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPage(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
  };

  const getIcon = (iconName: string) => iconMap[iconName] || Users;

  // Use static data as primary, merge with database data for matching names
  const staticTeamMap = new Map(
    teamDepartments.flatMap(d => d.members).map(m => [m.name.toLowerCase(), m])
  );

  // Start with all static members
  let displayMembers = teamDepartments.flatMap(d => d.members);

  // If database has data, update matching names and add new ones
  if (dbTeamMembers.length > 0) {
    const updatedNames = new Set<string>();
    
    displayMembers = displayMembers.map((member: TeamMember) => {
      const dbMember = dbTeamMembers.find((m: any) => 
        m.name.toLowerCase() === member.name.toLowerCase()
      );
      if (dbMember) {
        updatedNames.add(dbMember.name.toLowerCase());
        return {
          ...member,
          name: dbMember.name || member.name,
          role: dbMember.role || member.role,
          bio: dbMember.bio || member.bio,
          image: member.image, // Keep static image
        };
      }
      return member;
    });

    // Add database members that don't exist in static data
    const newMembers = dbTeamMembers
      .filter((m: any) => !updatedNames.has(m.name.toLowerCase()))
      .map((m: any) => ({
        id: m.id || String(Math.random()),
        name: m.name,
        role: m.role,
        department: 'Leadership',
        bio: m.bio || '',
        image: m.avatarUrl || m.avatar || '/images/default-avatar.png',
        social: m.socialLinks 
          ? (typeof m.socialLinks === 'string' ? JSON.parse(m.socialLinks) : m.socialLinks) 
          : {},
        expertise: [],
        yearsExperience: 0,
        location: 'Bangladesh'
      }));

    displayMembers = [...displayMembers, ...newMembers];
  }

  const displayDepartments = [{
    id: 'leadership',
    name: 'Leadership',
    description: 'Our visionary leaders guiding ClippingPath & Website Services Studio to excellence',
    icon: 'Crown',
    gradient: 'from-amber-500 to-orange-600',
    members: displayMembers
  }];

  const filteredDepartments = activeDepartment === 'all' 
    ? displayDepartments 
    : displayDepartments.filter(d => d.id === activeDepartment);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 60%)' }}
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 60%)' }}
            animate={{ 
              scale: [1.2, 1, 1.2],
              y: [0, -30, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 px-5 py-2 text-sm">
              <Users className="w-4 h-4 mr-2" />
              Our Amazing Team
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Meet The <span className="gradient-text">Experts</span> Behind<br />
              Your Visual Content
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our diverse team of 150+ professionals spans 12 countries, bringing together 
              the world's best talent in image editing, video production, and AI technology.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16"
          >
            {teamStats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-4 rounded-xl glass-card"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-2">
                  {(() => {
                    const Icon = getIcon(stat.icon);
                    return <Icon className="w-5 h-5 text-emerald-400" />;
                  })()}
                </div>
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Department Filter */}
      <section className="py-8 border-y border-border bg-muted/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant={activeDepartment === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveDepartment('all')}
              className={activeDepartment === 'all' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-0' 
                : 'text-muted-foreground hover:text-foreground'
              }
            >
              All Teams
            </Button>
            {teamDepartments.map((dept) => (
              <Button
                key={dept.id}
                variant={activeDepartment === dept.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveDepartment(dept.id)}
                className={activeDepartment === dept.id 
                  ? `bg-gradient-to-r ${dept.gradient} border-0` 
                  : 'text-muted-foreground hover:text-foreground'
                }
              >
                {dept.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members by Department */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDepartment}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-16"
            >
              {filteredDepartments.map((department, deptIdx) => (
                <motion.div
                  key={department.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: deptIdx * 0.1 }}
                >
                  {/* Department Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${department.gradient} flex items-center justify-center shadow-lg`}>
                      {(() => {
                        const Icon = getIcon(department.icon);
                        return <Icon className="w-7 h-7 text-white" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{department.name}</h2>
                      <p className="text-muted-foreground">{department.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto border-emerald-500/30 text-emerald-400">
                      {department.members.length} members
                    </Badge>
                  </div>

                  {/* Team Members Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {department.members.map((member, idx) => (
                      <TeamMemberCard key={member.id} member={member} gradient={department.gradient} idx={idx} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center glass-card rounded-3xl p-12 border-emerald-500/20"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">
              Join Our <span className="gradient-text">Growing Team</span>
            </h2>
            
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              We're always looking for talented individuals who share our passion for visual excellence. 
              Join a global team that values creativity, quality, and innovation.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0"
                onClick={() => handleNavigate('/contact')}
              >
                View Open Positions
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-border hover:bg-black/5 dark:bg-white/5"
                onClick={() => handleNavigate('/contact')}
              >
                Contact HR
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Team Member Card Component
function TeamMemberCard({ member, gradient, idx }: { member: TeamMember; gradient: string; idx: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate initials for fallback avatar
  const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="glass-card hover:border-emerald-500/30 transition-all duration-300 overflow-hidden group flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Image Section - Natural aspect ratio */}
          <div className="relative w-full min-h-[200px] flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-4">
            {!imageError ? (
              <img 
                src={member.image} 
                alt={member.name}
                className="max-w-full max-h-[300px] w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient}`}>
                <span className="text-4xl font-bold text-white/90">{initials}</span>
              </div>
            )}
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            {/* Experience Badge */}
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-black/60 backdrop-blur-sm border border-white/10 text-white px-2.5 py-1">
                <Star className="w-3 h-3 mr-1 text-amber-400 fill-amber-400" />
                {member.yearsExperience}+ yrs
              </Badge>
            </div>

            {/* Social Links - Show on Hover */}
            <motion.div 
              className="absolute bottom-3 left-3 flex gap-2 z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.2 }}
            >
              {member.social.linkedin && (
                <a 
                  href={member.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-emerald-500/80 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {member.social.twitter && (
                <a 
                  href={member.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-emerald-500/80 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {member.social.github && (
                <a 
                  href={member.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-emerald-500/80 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          </div>

          {/* Info Section - Takes remaining space */}
          <div className="p-5 mt-auto">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-emerald-400 font-medium">{member.role}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <MapPin className="w-3 h-3" />
              {member.location}
            </div>
            
            {/* Bio - show full text without truncation */}
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{member.bio}</p>
            
            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-1.5">
              {member.expertise.slice(0, 3).map((skill, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-xs border-emerald-500/20 text-muted-foreground bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default TeamsPage;
