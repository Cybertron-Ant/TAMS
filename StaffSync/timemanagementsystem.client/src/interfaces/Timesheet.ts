interface TimeSheet {
    id: number;
    employeeCode: string;
    punchIn: string;
    punchOut?: string;
    breakType?: string;
    breakTypeId: number;
    currentHours?: number;
    breakDuration?: number;
    isActive: boolean;
    date: string;
    firstName: string;
    lastName: string;
  }