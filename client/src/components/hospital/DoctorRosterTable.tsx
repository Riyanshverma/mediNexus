import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Doctor } from '../../types/doctor';
import { LuPenLine, LuTrash2, LuStethoscope } from 'react-icons/lu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';

interface DoctorRosterTableProps {
  doctors: Doctor[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DoctorRosterTable: React.FC<DoctorRosterTableProps> = ({ doctors, onEdit, onDelete }) => {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[300px]">Doctor</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Consultation Fee</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <LuStethoscope size={32} className="opacity-20" />
                  <p>No doctors found in your roster.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            doctors.map((doctor) => (
              <TableRow key={doctor.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border bg-background">
                      <AvatarImage src={doctor.avatarUrl} alt={doctor.name} />
                      <AvatarFallback>{doctor.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{doctor.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{doctor.qualification}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">{doctor.specialty}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  ${doctor.consultationFee.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 w-fit px-2 py-0.5 rounded-full text-xs font-medium">
                    <span className="text-amber-500 text-sm">★</span>
                    {doctor.rating.toFixed(1)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(doctor.id)}>
                      <LuPenLine size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(doctor.id)}>
                      <LuTrash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
