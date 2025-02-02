export type WorkType = 'photos' | 'modeling' | 'advertising';
export type ScheduleType = 'morning' | 'afternoon' | 'night';
export type ZoneType =
  | 'Palermo'
  | 'Recoleta'
  | 'Belgrano'
  | 'San Telmo'
  | 'Puerto Madero'
  | 'Núñez'
  | 'Caballito'
  | 'Villa Crespo'
  | 'Almagro'
  | 'Colegiales';

export interface Model {
  id: string;
  name: string;
  work_type: WorkType[];
  zone: ZoneType;
  availability: ScheduleType[];
  contact: string;
  created_at: string;
}

export interface Job {
  id: string;
  agency: string;
  instagram: string;
  work_type: WorkType;
  brand: string;
  zone: ZoneType;
  schedule: ScheduleType[];
  expiry_date: string;
  created_at: string;
}