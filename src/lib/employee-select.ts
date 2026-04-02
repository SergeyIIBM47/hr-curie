export const userSafeSelect = {
  id: true,
  role: true,
  email: true,
} as const;

export const employeeListSelect = {
  id: true,
  firstName: true,
  lastName: true,
  workEmail: true,
  position: true,
  department: true,
  avatarUrl: true,
  employmentType: { select: { name: true } },
  user: { select: { id: true, role: true } },
} as const;

export const employeeDetailSelect = {
  id: true,
  firstName: true,
  lastName: true,
  workEmail: true,
  dateOfBirth: true,
  actualResidence: true,
  startYear: true,
  position: true,
  phone: true,
  department: true,
  location: true,
  healthInsurance: true,
  education: true,
  certifications: true,
  linkedinUrl: true,
  tshirtSize: true,
  avatarUrl: true,
  employmentType: { select: { id: true, name: true } },
  user: { select: userSafeSelect },
} as const;
