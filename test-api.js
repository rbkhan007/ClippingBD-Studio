const { PrismaClient } = require('@prisma/client');

async function testAllAPI() {
  const prisma = new PrismaClient();
  
  console.log('🧪 Testing Database Tables...\n');
  
  try {
    // Test User table
    const users = await prisma.user.count();
    console.log('✅ Users:', users);
    
    // Test Service table
    const services = await prisma.service.count();
    console.log('✅ Services:', services);
    
    // Test CMS tables
    const cmsHero = await prisma.cmsHero.count();
    console.log('✅ CmsHero:', cmsHero);
    
    const cmsStats = await prisma.cmsStatistic.count();
    console.log('✅ CmsStatistics:', cmsStats);
    
    const cmsFeatures = await prisma.cmsFeature.count();
    console.log('✅ CmsFeatures:', cmsFeatures);
    
    const cmsServices = await prisma.cmsService.count();
    console.log('✅ CmsServices:', cmsServices);
    
    const cmsTestimonials = await prisma.cmsTestimonial.count();
    console.log('✅ CmsTestimonials:', cmsTestimonials);
    
    const cmsPortfolio = await prisma.cmsPortfolioItem.count();
    console.log('✅ CmsPortfolioItems:', cmsPortfolio);
    
    const cmsTeam = await prisma.cmsTeamMember.count();
    console.log('✅ CmsTeamMembers:', cmsTeam);
    
    const cmsFaqs = await prisma.cmsFaq.count();
    console.log('✅ CmsFaqs:', cmsFaqs);
    
    const cmsPartners = await prisma.cmsPartner.count();
    console.log('✅ CmsPartners:', cmsPartners);
    
    // Test System Settings
    const settings = await prisma.systemSetting.count();
    console.log('✅ SystemSettings:', settings);
    
    console.log('\n🎉 All database tables working!');
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAllAPI();