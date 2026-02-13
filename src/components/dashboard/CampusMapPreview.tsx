import { useState } from 'react';
import { useCollege } from '@/contexts/CollegeContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/shared/StatusBadge';
import { MapPin, AlertCircle, Calendar, Wrench, CheckCircle2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Room } from '@/types';

const CampusMapPreview = () => {
  const { college } = useCollege();
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['map-data', college?._id],
    queryFn: () => api.getMapData(college!._id),
    enabled: !!college,
    retry: 1,
  });

  const getStatusColor = (room: Room) => {
    if (room.statusColor) {
      const colors: Record<string, string> = {
        green: 'bg-green-500',
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        yellow: 'bg-yellow-500',
      };
      return colors[room.statusColor] || 'bg-gray-500';
    }
    switch (room.status) {
      case 'Available': return 'bg-green-500';
      case 'Under Maintenance': return 'bg-red-500';
      case 'Event Ongoing': return 'bg-blue-500';
      case 'Reserved': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (room: Room) => {
    if (room.complaint) return <Wrench className="h-3 w-3" />;
    if (room.event) return <Calendar className="h-3 w-3" />;
    return <CheckCircle2 className="h-3 w-3" />;
  };

  const blocks = Array.from(new Set(rooms.map(r => r.block))).sort();
  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => b - a);

  // Get summary stats
  const availableRooms = rooms.filter(r => r.status === 'Available' || r.statusColor === 'green').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Under Maintenance' || r.statusColor === 'red').length;
  const eventRooms = rooms.filter(r => r.status === 'Event Ongoing' || r.statusColor === 'blue').length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Campus Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">Loading campus map...</p>
        </CardContent>
      </Card>
    );
  }

  if (rooms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Campus Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No rooms available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Campus Map
            </CardTitle>
            <button
              onClick={() => navigate('/campus-map')}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View Full Map <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-muted-foreground">{availableRooms} Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-muted-foreground">{maintenanceRooms} Maintenance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-muted-foreground">{eventRooms} Events</span>
            </div>
          </div>

          {/* Compact Room Grid */}
          <div className="space-y-3">
            {floors.slice(0, 2).map(floor => (
              <div key={floor} className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground">Floor {floor}</h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {blocks.slice(0, 4).map(block => {
                    const blockRooms = rooms
                      .filter(r => r.block === block && r.floor === floor)
                      .slice(0, 4);
                    
                    return blockRooms.map(room => (
                      <button
                        key={room._id}
                        onClick={() => setSelectedRoom(room)}
                        className={`
                          relative p-2 rounded text-white text-[10px] font-medium
                          ${getStatusColor(room)}
                          hover:opacity-80 transition-opacity
                          flex items-center justify-center gap-1
                        `}
                        title={room.roomName}
                      >
                        {getStatusIcon(room)}
                        <span className="truncate">{room.roomName.split(' ').pop()}</span>
                        {(room.complaint || room.event) && (
                          <div className="absolute top-0.5 right-0.5">
                            {room.complaint && <AlertCircle className="h-2 w-2" />}
                            {room.event && <Calendar className="h-2 w-2" />}
                          </div>
                        )}
                      </button>
                    ));
                  })}
                </div>
              </div>
            ))}
          </div>

          {rooms.length > 16 && (
            <p className="text-xs text-center text-muted-foreground pt-2">
              Showing preview • {rooms.length} total rooms
            </p>
          )}
        </CardContent>
      </Card>

      {/* Room Detail Modal */}
      <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {selectedRoom?.roomName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRoom && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Block</p>
                  <p className="font-medium">{selectedRoom.block}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Floor</p>
                  <p className="font-medium">{selectedRoom.floor}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedRoom.status} />
                  </div>
                </div>
              </div>

              {selectedRoom.complaint && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="h-4 w-4 text-red-600" />
                    <p className="font-medium text-sm">Active Complaint</p>
                  </div>
                  <p className="text-sm">{selectedRoom.complaint.title}</p>
                  <StatusBadge status={selectedRoom.complaint.status} className="mt-2" />
                </div>
              )}

              {selectedRoom.event && (
                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <p className="font-medium text-sm">Active Event</p>
                  </div>
                  <p className="text-sm font-medium">{selectedRoom.event.eventName}</p>
                  {selectedRoom.event.startTime && selectedRoom.event.endTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedRoom.event.startTime} - {selectedRoom.event.endTime}
                    </p>
                  )}
                  {selectedRoom.event.block && (
                    <p className="text-xs text-muted-foreground">Block {selectedRoom.event.block}</p>
                  )}
                  {selectedRoom.event.workerCount !== undefined && (
                    <p className="text-xs text-muted-foreground">{selectedRoom.event.workerCount} workers required</p>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedRoom(null);
                  navigate('/campus-map');
                }}
                className="w-full text-sm text-primary hover:underline"
              >
                View full map details →
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CampusMapPreview;
