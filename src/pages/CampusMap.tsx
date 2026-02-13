import { useState, useEffect } from 'react';
import { useCollege } from '@/contexts/CollegeContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/shared/StatusBadge';
import { MapPin, ZoomIn, ZoomOut, AlertCircle, Calendar, Wrench, CheckCircle2 } from 'lucide-react';
import type { Room } from '@/types';

const CampusMap = () => {
  const { college } = useCollege();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [zoom, setZoom] = useState(1);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const { data: rooms = [], isLoading, error } = useQuery({
    queryKey: ['map-data', college?._id],
    queryFn: async () => {
      console.log('Fetching map data for college:', college?._id);
      try {
        const data = await api.getMapData(college!._id);
        console.log('Map data received:', data.length, 'rooms');
        return data;
      } catch (err) {
        console.error('API Error loading map data:', err);
        throw err;
      }
    },
    enabled: !!college,
    retry: 1,
    onError: (err) => {
      console.error('Error loading map data:', err);
    },
    onSuccess: (data) => {
      console.log('Map data loaded successfully:', data.length, 'rooms');
    },
  });

  const getStatusColor = (room: Room) => {
    if (room.statusColor) {
      const colors: Record<string, string> = {
        green: 'bg-green-500 hover:bg-green-600',
        red: 'bg-red-500 hover:bg-red-600',
        blue: 'bg-blue-500 hover:bg-blue-600',
        yellow: 'bg-yellow-500 hover:bg-yellow-600',
      };
      return colors[room.statusColor] || 'bg-gray-500';
    }
    
    switch (room.status) {
      case 'Available': return 'bg-green-500 hover:bg-green-600';
      case 'Under Maintenance': return 'bg-red-500 hover:bg-red-600';
      case 'Event Ongoing': return 'bg-blue-500 hover:bg-blue-600';
      case 'Reserved': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (room: Room) => {
    if (room.complaint) return <Wrench className="h-4 w-4" />;
    if (room.event) return <Calendar className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  // Group rooms by block and floor
  const groupedRooms = rooms.reduce((acc, room) => {
    const key = `${room.block}-${room.floor}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  const blocks = Array.from(new Set(rooms.map(r => r.block))).sort();
  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => b - a);

  useEffect(() => {
    console.log('CampusMap render:', {
      roomsCount: rooms.length,
      blocks: blocks.length,
      floors: floors.length,
      collegeId: college?._id,
      isLoading,
      error: error?.message,
    });
  }, [rooms, blocks, floors, college, isLoading, error]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Campus Map</h1>
        <p className="text-muted-foreground">Loading campus layout...</p>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load map data. Please try again.';
    const is404 = errorMessage.includes('404') || errorMessage.includes('not found');
    const is403 = errorMessage.includes('403') || errorMessage.includes('Access denied');
    const is401 = errorMessage.includes('401') || errorMessage.includes('Authentication');
    
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Campus Map</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive font-medium">Error loading campus map</p>
            <p className="text-sm text-muted-foreground mt-2">
              {errorMessage}
            </p>
            {is404 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm font-medium text-yellow-800">Route not found (404)</p>
                <p className="text-xs text-yellow-700 mt-1">
                  The API endpoint may not be registered. Please ensure:
                </p>
                <ul className="text-xs text-yellow-700 mt-2 list-disc list-inside">
                  <li>The backend server is running</li>
                  <li>The server has been restarted after adding the route</li>
                  <li>You are accessing: /api/rooms/map-data</li>
                </ul>
              </div>
            )}
            {is403 && (
              <p className="text-xs text-muted-foreground mt-2">
                Make sure you are logged in as a Student or Staff member (Admin cannot access the map).
              </p>
            )}
            {is401 && (
              <p className="text-xs text-muted-foreground mt-2">
                Please log in again. Your session may have expired.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Campus Map</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No rooms found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Campus map data is not available yet. Please contact admin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Campus Map</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {rooms.length} rooms • {blocks.length} blocks • {floors.length} floors • Click on a room for details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            disabled={zoom >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span>Under Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span>Event Ongoing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span>Reserved</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campus Map */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-auto border rounded-lg" style={{ maxHeight: '70vh', minHeight: '400px' }}>
            <div
              className="relative p-4"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                minWidth: '100%',
              }}
            >
              {floors.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No rooms to display</p>
                </div>
              ) : (
                floors.map(floor => (
                  <div key={floor} className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-background z-10 py-2">
                      Floor {floor}
                    </h3>
                    {blocks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No blocks found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {blocks.map(block => {
                          const blockRooms = rooms.filter(
                            r => r.block === block && r.floor === floor
                          );
                          
                          return (
                            <div key={`${block}-${floor}`} className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">
                                Block {block}
                              </h4>
                              <div className="grid grid-cols-1 gap-2">
                                {blockRooms.length === 0 ? (
                                  <div className="p-3 rounded-lg border border-dashed border-muted text-center text-muted-foreground text-sm">
                                    No rooms
                                  </div>
                                ) : (
                                  blockRooms.map(room => (
                                    <button
                                      key={room._id}
                                      onClick={() => setSelectedRoom(room)}
                                      onMouseEnter={() => setHoveredRoom(room._id)}
                                      onMouseLeave={() => setHoveredRoom(null)}
                                      className={`
                                        relative p-3 rounded-lg text-left text-white transition-all
                                        ${getStatusColor(room)}
                                        ${hoveredRoom === room._id ? 'ring-2 ring-offset-2 ring-primary scale-105' : ''}
                                        shadow-md hover:shadow-lg cursor-pointer
                                      `}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            {getStatusIcon(room)}
                                            <span className="font-semibold text-sm">{room.roomName}</span>
                                          </div>
                                          <p className="text-xs opacity-90">{room.roomType || 'Room'}</p>
                                          {room.capacity && (
                                            <p className="text-xs opacity-75">Capacity: {room.capacity}</p>
                                          )}
                                        </div>
                                      </div>
                                      {(room.complaint || room.event) && (
                                        <div className="absolute top-2 right-2">
                                          {room.complaint && (
                                            <AlertCircle className="h-4 w-4 text-white opacity-80" />
                                          )}
                                          {room.event && (
                                            <Calendar className="h-4 w-4 text-white opacity-80" />
                                          )}
                                        </div>
                                      )}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Detail Modal */}
      <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {selectedRoom?.roomName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRoom && (
            <div className="space-y-4">
              {/* Room Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Block</p>
                  <p className="text-base">{selectedRoom.block}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Floor</p>
                  <p className="text-base">{selectedRoom.floor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-base">{selectedRoom.roomType || 'General'}</p>
                </div>
                {selectedRoom.capacity && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                    <p className="text-base">{selectedRoom.capacity} people</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedRoom.status} />
                  </div>
                </div>
              </div>

              {/* Active Complaint */}
              {selectedRoom.complaint && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-red-600" />
                      Active Complaint
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium">{selectedRoom.complaint.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedRoom.complaint.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedRoom.complaint.status} />
                      {selectedRoom.complaint.priorityLevel && (
                        <StatusBadge status={selectedRoom.complaint.priorityLevel} />
                      )}
                    </div>
                    {selectedRoom.complaint.technicianInfo && (
                      <div className="pt-2 border-t border-red-200">
                        <p className="text-sm font-medium">Assigned Technician:</p>
                        <p className="text-sm">{selectedRoom.complaint.technicianInfo.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedRoom.complaint.technicianInfo.company || 'External Contractor'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Phone: {selectedRoom.complaint.technicianInfo.phone}
                        </p>
                      </div>
                    )}
                    {selectedRoom.complaint.estimatedResolutionTime && (
                      <div className="pt-2 border-t border-red-200">
                        <p className="text-sm font-medium">Estimated Resolution:</p>
                        <p className="text-sm">{selectedRoom.complaint.estimatedResolutionTime}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(selectedRoom.complaint.submittedAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Active Event */}
              {selectedRoom.event && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Active Event
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="font-medium">{selectedRoom.event.eventName}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedRoom.event.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedRoom.event.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Date: {new Date(selectedRoom.event.date).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              )}

              {!selectedRoom.complaint && !selectedRoom.event && (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>No active complaints or events</p>
                    <p className="text-sm mt-1">Room is available for use</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampusMap;
