export type ReportFormValues = {

  title: string;

  category: string;

  problemType: string;

  description: string;

  isAnonymous: boolean;

  latitude?: number;

  longitude?: number;

  address?: string;

  images: File[];

  imageUrls: string[];

  categoryId?: string;
  
  problemTypeId?: string;
};

export type CreateReportDTO = {

  title: string;

  category: string;

  problemType: string;

  description: string;

  isAnonymous: boolean;

  latitude?: number;

  longitude?: number;

  address?: string;

  imageUrls: string[];

  userId: string;
};

export type ApiReport = {

  id: string;

  title: string;

  category: string;

  problemType: string;

  description: string;

  isAnonymous: boolean;

  latitude?: number;

  longitude?: number;

  address?: string;

  priority?: "ALTO" | "MEDIO" | "BAJO";

  impact?: string;

  probability?: string;

  operationalType?: string;

  targetDate?: string;

  justification?: string;

  status:
  | "REGISTERED"
  | "VALIDATING"
  | "APPROVED"
  | "REJECTED"
  | "PRIORITIZED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED";

  userId: string;

  user?: {

    firstName: string;

    lastName: string;
  };

  createdAt: string;

  updatedAt: string;
};