import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import { crudEntities, CRUDEntity } from '@/data/crud-config';

// Database model mapping
const getDatabaseModel = (entityId: string) => {
  const modelMap: Record<string, keyof typeof db> = {
    users: 'user',
    services: 'service',
    orders: 'order',
    tasks: 'task',
    testimonials: 'testimonial',
    portfolio: 'portfolioItem',
    team: 'teamMember',
    faqs: 'fAQItem',
    blog: 'blogPost',
    pages: 'cMSPage',
    settings: 'systemSetting',
    staticData: 'staticData',
    reviews: 'qAReview',
    tickets: 'supportTicket',
  };
  return modelMap[entityId];
};

// Get data from database
const getDatabaseData = async (entityId: string, limit = 50, offset = 0) => {
  const model = getDatabaseModel(entityId);
  if (!model) return null;

  const dbModel = db[model] as any;
  if (typeof dbModel.findMany !== 'function') return null;

  return await dbModel.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
  });
};

// Get single item from database
const getDatabaseItem = async (entityId: string, id: string) => {
  const model = getDatabaseModel(entityId);
  if (!model) return null;

  const dbModel = db[model] as any;
  if (typeof dbModel.findUnique !== 'function') return null;

  return await dbModel.findUnique({ where: { id } });
};

// Create item in database
const createDatabaseItem = async (entityId: string, data: Record<string, unknown>) => {
  const model = getDatabaseModel(entityId);
  if (!model) return null;

  const dbModel = db[model] as any;
  if (typeof dbModel.create !== 'function') return null;

  return await dbModel.create({ data });
};

// Update item in database
const updateDatabaseItem = async (entityId: string, id: string, data: Record<string, unknown>) => {
  const model = getDatabaseModel(entityId);
  if (!model) return null;

  const dbModel = db[model] as any;
  if (typeof dbModel.update !== 'function') return null;

  return await dbModel.update({ where: { id }, data });
};

// Delete item from database
const deleteDatabaseItem = async (entityId: string, id: string) => {
  const model = getDatabaseModel(entityId);
  if (!model) return null;

  const dbModel = db[model] as any;
  if (typeof dbModel.delete !== 'function') return null;

  return await dbModel.delete({ where: { id } });
};

// GET - List all entities or specific entity data
export async function GET(request: NextRequest) {
  // Require admin or developer role
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  const { searchParams } = new URL(request.url);
  const entityId = searchParams.get('entity');
  const id = searchParams.get('id');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    // If requesting specific entity data
    if (entityId) {
      const entity = crudEntities.find(e => e.id === entityId);
      if (!entity) {
        return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
      }

      // If requesting single item
      if (id) {
        const item = await getDatabaseItem(entityId, id);
        if (!item) {
          return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        return NextResponse.json({ entity, data: item });
      }

      // Get list from database
      const data = await getDatabaseData(entityId, limit, offset);
      return NextResponse.json({ entity, data, pagination: { limit, offset } });
    }

    // Return all entities
    const accessibleEntities = crudEntities.filter(e => e.isVisible);

    return NextResponse.json({ 
      entities: accessibleEntities,
      userRole: authResult.role,
    });
  } catch (error) {
    console.error('CRUD GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new item (DEV or ADMIN only based on entity)
export async function POST(request: NextRequest) {
  // Require admin or developer role
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }
  
  try {
    const body = await request.json();
    const { entityId, data } = body;

    if (!entityId || !data) {
      return NextResponse.json({ error: 'Entity ID and data required' }, { status: 400 });
    }

    const entity = crudEntities.find(e => e.id === entityId);
    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Create in database
    const newItem = await createDatabaseItem(entityId, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!newItem) {
      return NextResponse.json({ error: 'Failed to create item in database' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Item created successfully',
      item: newItem,
      note: 'In production, this would be persisted to the database'
    });
  } catch (error) {
    console.error('CRUD POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update item (DEV or ADMIN only)
export async function PUT(request: NextRequest) {
  // Require admin or developer role
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }
  
  try {
    const body = await request.json();
    const { entityId, itemId, data } = body;

    if (!entityId || !itemId || !data) {
      return NextResponse.json({ error: 'Entity ID, Item ID and data required' }, { status: 400 });
    }

    const entity = crudEntities.find(e => e.id === entityId);
    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Update in database
    const updated = await updateDatabaseItem(entityId, itemId, data);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update item in database' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Item updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('CRUD PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete item (DEV or ADMIN only)
export async function DELETE(request: NextRequest) {
  // Require admin or developer role
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entity');
    const itemId = searchParams.get('id');

    if (!entityId || !itemId) {
      return NextResponse.json({ error: 'Entity ID and Item ID required' }, { status: 400 });
    }

    const entity = crudEntities.find(e => e.id === entityId);
    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Delete from database
    const deleted = await deleteDatabaseItem(entityId, itemId);
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete item from database' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Item deleted successfully',
      itemId
    });
  } catch (error) {
    console.error('CRUD DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
