import { NextRequest, NextResponse } from 'next/server';
import { SupabaseStorage } from '../../../server/storage';

const storage = new SupabaseStorage();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const damaged = searchParams.get('damaged') === 'true';

    const vehicles = await storage.getAllVehicles();
    
    let filteredVehicles = vehicles;

    if (category && category !== 'all') {
      filteredVehicles = filteredVehicles.filter(vehicle => 
        vehicle.category === category
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredVehicles = filteredVehicles.filter(vehicle =>
        vehicle.title?.toLowerCase().includes(searchLower) ||
        vehicle.brand?.toLowerCase().includes(searchLower) ||
        vehicle.model?.toLowerCase().includes(searchLower)
      );
    }

    if (damaged) {
      filteredVehicles = filteredVehicles.filter(vehicle => 
        vehicle.condition === 'damaged'
      );
    }

    // Sort logic
    if (sort === 'price-asc') {
      filteredVehicles.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'price-desc') {
      filteredVehicles.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'date-desc') {
      filteredVehicles.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    return NextResponse.json(filteredVehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}