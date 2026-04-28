import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Generic CMS handler for all CMS tables
type CmsModelName = 
  | 'cms_hero' | 'cms_statistics' | 'cms_features' | 'cms_services'
  | 'cms_pricing_tiers' | 'cms_testimonials' | 'cms_portfolio_items'
  | 'cms_team_members' | 'cms_faqs' | 'cms_partners' | 'cms_social_links'
  | 'cms_contact_info' | 'cms_global_settings';

const modelMap: Record<CmsModelName, string> = {
  cms_hero: 'cmsHero',
  cms_statistics: 'cmsStatistic',
  cms_features: 'cmsFeature',
  cms_services: 'cmsService',
  cms_pricing_tiers: 'cmsPricingTier',
  cms_testimonials: 'cmsTestimonial',
  cms_portfolio_items: 'cmsPortfolioItem',
  cms_team_members: 'cmsTeamMember',
  cms_faqs: 'cmsFaq',
  cms_partners: 'cmsPartner',
  cms_social_links: 'cmsSocialLink',
  cms_contact_info: 'cmsContactInfo',
  cms_global_settings: 'cmsGlobalSettings',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table') as CmsModelName;
    
    if (!table || !modelMap[table]) {
      return NextResponse.json({
        success: false,
        error: 'Invalid table name',
      }, { status: 400 });
    }

    // Extract filter params
    const filter: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'table' && key !== 'limit' && key !== 'orderBy') {
        filter[key] = value === 'true' ? true : value === 'false' ? false : value;
      }
    });

    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    const dbModel = (db as any)[modelMap[table]];
    const data = await dbModel.findMany({
      where: Object.keys(filter).length > 0 ? filter : undefined,
      take: limit,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data',
    }, { status: 500 });
  }
}
