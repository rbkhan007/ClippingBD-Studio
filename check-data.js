const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkData() {
  try {
    // Check portfolio
    const portfolio = await p.cmsPortfolioItem.findMany({ take: 5 });
    console.log('=== PORTFOLIO ===');
    console.log('Count:', portfolio.length);
    if (portfolio.length > 0) {
      console.log('Sample:', JSON.stringify(portfolio[0], null, 2));
    }

    // Check services
    const services = await p.service.findMany({ take: 5 });
    console.log('\n=== SERVICES ===');
    console.log('Count:', services.length);
    if (services.length > 0) {
      console.log('Sample:', JSON.stringify(services[0], null, 2));
    }

    // Check CMS services
    const cmsServices = await p.cmsService.findMany({ take: 5 });
    console.log('\n=== CMS SERVICES ===');
    console.log('Count:', cmsServices.length);
    if (cmsServices.length > 0) {
      console.log('Sample:', JSON.stringify(cmsServices[0], null, 2));
    }

    // Check team
    const team = await p.cmsTeamMember.findMany({ take: 3 });
    console.log('\n=== TEAM ===');
    console.log('Count:', team.length);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await p.$disconnect();
  }
}

checkData();