import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

// GET /api/team - Get all team members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    // Try CMS team members first
    let teamMembers: any[] = [];
    try {
      const cmsWhere: Record<string, unknown> = {};
      if (activeOnly) cmsWhere.isActive = true;

      const cmsMembers = await (db as any).cmsTeamMember.findMany({
        where: cmsWhere,
        orderBy: { order: 'asc' },
      });

      // Map CMS fields to match expected format
      teamMembers = cmsMembers.map((m: any) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        bio: m.bio,
        avatarUrl: m.avatarUrl,
        email: m.email,
        linkedin: m.linkedin,
        twitter: m.twitter,
        socialLinks: m.socialLinks ? (typeof m.socialLinks === 'string' ? JSON.parse(m.socialLinks) : m.socialLinks) : {},
        isPublished: m.isActive,
        sortOrder: m.order,
      }));
    } catch {
      // Fallback to old teamMember table
      const where: Record<string, unknown> = {};
      if (activeOnly) where.isPublished = true;

      const oldMembers = await db.teamMember.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
      });

      teamMembers = oldMembers.map(m => ({
        ...m,
        socialLinks: m.socialLinks ? JSON.parse(m.socialLinks) : {},
      }));
    }

    return NextResponse.json({
      success: true,
      teamMembers,
    });
  } catch (error) {
    console.error('Get team members error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/team - Create team member (Admin/Developer only)
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { name, role, bio, socialLinks, avatar, avatarUrl, isPublished, sortOrder, email, linkedin, twitter } = body;

    if (!name || !role) {
      return NextResponse.json(
        { success: false, error: 'Name and role are required' },
        { status: 400 }
      );
    }

    let teamMember: any;
    try {
      teamMember = await (db as any).cmsTeamMember.create({
        data: {
          name,
          role,
          bio: bio || '',
          avatarUrl: avatarUrl || avatar || '',
          email: email || '',
          linkedin: linkedin || '',
          twitter: twitter || '',
          socialLinks: socialLinks ? JSON.stringify(socialLinks) : '{}',
          isActive: isPublished ?? true,
          order: sortOrder || 0,
        },
      });
    } catch {
      teamMember = await db.teamMember.create({
        data: {
          name,
          role,
          bio: bio || '',
          socialLinks: socialLinks ? JSON.stringify(socialLinks) : '{}',
          avatar: avatar || avatarUrl || '',
          isPublished: isPublished ?? true,
          sortOrder: sortOrder || 0,
        },
      });
    }

    return NextResponse.json({ success: true, teamMember }, { status: 201 });
  } catch (error) {
    console.error('Create team member error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/team - Update team member (Admin/Developer only)
export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { id, socialLinks, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Team member ID is required' },
        { status: 400 }
      );
    }

    let teamMember: any;
    try {
      const updateData: Record<string, unknown> = { ...updates };
      if (socialLinks) {
        updateData.socialLinks = typeof socialLinks === 'string' ? socialLinks : JSON.stringify(socialLinks);
      }
      teamMember = await (db as any).cmsTeamMember.update({
        where: { id },
        data: updateData,
      });
    } catch {
      const updateData: Record<string, unknown> = { ...updates };
      if (socialLinks) {
        updateData.socialLinks = JSON.stringify(socialLinks);
      }
      teamMember = await db.teamMember.update({
        where: { id },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true, teamMember });
  } catch (error) {
    console.error('Update team member error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/team - Delete team member (Admin/Developer only)
export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Team member ID is required' },
        { status: 400 }
      );
    }

    // Try CMS first, fallback to old table
    try {
      await (db as any).cmsTeamMember.delete({
        where: { id },
      });
    } catch {
      await db.teamMember.delete({
        where: { id },
      });
    }

    return NextResponse.json({ success: true, message: 'Team member deleted' });
  } catch (error) {
    console.error('Delete team member error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}