import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const page = await db.cMSPage.findUnique({
      where: { slug, isPublished: true },
    });
    
    if (!page) {
      return NextResponse.json({ 
        success: false, 
        error: 'Page not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: page 
    });
  } catch (error) {
    console.error('Error fetching CMS page:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch page' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    
    const page = await db.cMSPage.update({
      where: { slug },
      data: body,
    });
    
    return NextResponse.json({ 
      success: true, 
      data: page 
    });
  } catch (error) {
    console.error('Error updating CMS page:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update page' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const page = await db.cMSPage.create({
      data: body,
    });
    
    return NextResponse.json({ 
      success: true, 
      data: page 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating CMS page:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create page' 
    }, { status: 500 });
  }
}