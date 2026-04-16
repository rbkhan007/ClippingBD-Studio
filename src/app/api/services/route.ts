import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/api-auth';

/**
 * GET /api/services
 * List all active services (public) or all services (admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // If slug is provided, return single service
    if (slug) {
      const service = await db.service.findUnique({
        where: { slug },
        include: {
          orders: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              orderNumber: true,
              title: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ service });
    }

    // Build where clause
    const where: Record<string, unknown> = {};
    
    // Non-admins can only see active services
    if (!includeInactive) {
      where.isActive = true;
    }
    
    if (category) {
      where.category = category;
    }

    const services = await db.service.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/services
 * Create a new service (admin only)
 */
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const {
      name,
      slug,
      category,
      description,
      features,
      basePrice,
      turnaround,
      sortOrder,
    } = body;

    // Validate required fields
    if (!name || !slug || !category || basePrice === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, category, basePrice' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingService = await db.service.findUnique({
      where: { slug },
    });

    if (existingService) {
      return NextResponse.json(
        { error: 'Service with this slug already exists' },
        { status: 400 }
      );
    }

    const service = await db.service.create({
      data: {
        name,
        slug,
        category,
        description: description || '',
        features: JSON.stringify(features || []),
        basePrice,
        turnaround: turnaround || 24,
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/services
 * Update a service (admin only)
 */
export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { serviceId, ...updates } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Check if service exists
    const existingService = await db.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.slug) updateData.slug = updates.slug;
    if (updates.category) updateData.category = updates.category;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.features) updateData.features = JSON.stringify(updates.features);
    if (updates.basePrice !== undefined) updateData.basePrice = updates.basePrice;
    if (updates.turnaround !== undefined) updateData.turnaround = updates.turnaround;
    if (updates.sortOrder !== undefined) updateData.sortOrder = updates.sortOrder;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

    const service = await db.service.update({
      where: { id: serviceId },
      data: updateData,
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/services
 * Delete a service (admin only)
 */
export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Check if service has orders
    const ordersCount = await db.order.count({
      where: { serviceId },
    });

    if (ordersCount > 0) {
      // Soft delete by setting isActive to false
      await db.service.update({
        where: { id: serviceId },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: 'Service has been deactivated (has associated orders)',
      });
    }

    // Hard delete if no orders
    await db.service.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
