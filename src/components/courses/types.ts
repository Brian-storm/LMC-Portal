export interface Course {
  id: string;
  slug?: string;
  title: string;
  category: "cpd" | "compliance" | "management" | string;
  description: string;
  cpdHours: number | string;
  iaCode?: string;
  date?: string;
  venue?: string;
  speaker?: string;
  deliveryMode?: string;
  language?: string;
  feeHKD?: number;
  fee?: string;
  seatsLeft?: number;
  accreditationBody?: string;
  isMandatory?: boolean;
}