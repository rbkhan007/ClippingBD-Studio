import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

// GET /api/admin/services - List all services with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includePricing = searchParams.get('includePricing') === 'true';

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (category) {
      where.category = category;
    }
    
    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    // Fetch services
    const services = await db.service.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      include: includePricing ? {
        orders: {
          select: { id: true },
          take: 1,
        },
      } : undefined,
    });

    // Get total count
    const total = await db.service.count({ where });

    // Parse features JSON string to array
    const parsedServices = services.map(service => ({
      ...service,
      features: service.features ? JSON.parse(service.features) : [],
    }));

    return NextResponse.json({
      success: true,
      data: parsedServices,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST /api/admin/services - Create new service (Admin only)
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
      isActive,
      sortOrder,
    } = body;

    // Validation
    if (!name || !slug || !category || !description) {
      return NextResponse.json(
        { success: false, error: 'Name, slug, category, and description are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingService = await db.service.findUnique({
      where: { slug },
    });

    if (existingService) {
      return NextResponse.json(
        { success: false, error: 'Service with this slug already exists' },
        { status: 400 }
      );
    }

    // Create service
    const service = await db.service.create({
      data: {
        name,
        slug,
        category,
        description,
        features: features ? JSON.stringify(features) : '[]',
        basePrice: basePrice || 0,
        turnaround: turnaround || 24,
        isActive: isActive ?? true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Service created successfully',
        data: {
          ...service,
          features: service.features ? JSON.parse(service.features) : [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/services - Update service by ID
export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Check if service exists
    const existingService = await db.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    // If slug is being updated, check for duplicates
    if (updates.slug && updates.slug !== existingService.slug) {
      const duplicateSlug = await db.service.findUnique({
        where: { slug: updates.slug },
      });

      if (duplicateSlug) {
        return NextResponse.json(
          { success: false, error: 'Service with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.slug !== undefined) updateData.slug = updates.slug;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.features !== undefined) updateData.features = JSON.stringify(updates.features);
    if (updates.basePrice !== undefined) updateData.basePrice = updates.basePrice;
    if (updates.turnaround !== undefined) updateData.turnaround = updates.turnaround;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.sortOrder !== undefined) updateData.sortOrder = updates.sortOrder;

    // Update service
    const service = await db.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      data: {
        ...service,
        features: service.features ? JSON.parse(service.features) : [],
      },
    });
  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/services - Delete service by ID
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
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Check if service exists
    const existingService = await db.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if service has associated orders
    if (existingService._count.orders > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete service with ${existingService._count.orders} associated orders. Consider deactivating instead.`,
        },
        { status: 400 }
      );
    }

    // Delete the service
    await db.service.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
