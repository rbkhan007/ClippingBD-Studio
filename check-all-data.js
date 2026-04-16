const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkAllData() {
  try {
    console.log('=== ALL DATABASE RECORDS ===\n');
    
    const tables = [
      ['Users', p.user],
      ['Services', p.service],
      ['Orders', p.order],
      ['Tasks', p.task],
      ['Transactions', p.transaction],
      ['Support Tickets', p.supportTicket],
      ['Client Reviews', p.clientReview],
      ['Notifications', p.notification],
      ['CmsHero', p.cmsHero],
      ['CmsStatistics', p.cmsStatistic],
      ['CmsFeatures', p.cmsFeature],
      ['CmsServices', p.cmsService],
      ['CmsTestimonials', p.cmsTestimonial],
      ['CmsPortfolioItems', p.cmsPortfolioItem],
      ['CmsTeamMembers', p.cmsTeamMember],
      ['CmsFaqs', p.cmsFaq],
      ['CmsPartners', p.cmsPartner],
      ['SystemSettings', p.systemSetting],
    ];

    for (const [name, model] of tables) {
      try {
        const count = await model.count();
        console.log(`${name}: ${count}`);
      } catch (e) {
        console.log(`${name}: Error - ${e.message.split('\n')[0]}`);
      }
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await p.$disconnect();
  }
}

checkAllData();