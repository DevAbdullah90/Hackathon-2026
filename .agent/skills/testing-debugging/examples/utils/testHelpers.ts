import { Donor, BloodRequest, User } from '../../src/types'; // adjust import path as needed

export function createMockDonor(overrides?: Partial<Donor>): Donor {
  return {
    id: 'donor_123',
    name: 'Ali Khan',
    bloodGroup: 'A+',
    city: 'Karachi',
    isAvailable: true,
    location: { latitude: 24.8607, longitude: 67.0011 },
    lastDonation: '2024-01-01',
    trustScore: 4.5,
    ...overrides,
  };
}

export function createMockBloodRequest(overrides?: Partial<BloodRequest>): BloodRequest {
  return {
    id: 'req_456',
    bloodGroup: 'O+',
    urgency: 'critical',
    hospital: 'Aga Khan Hospital',
    city: 'Karachi',
    status: 'pending',
    patientCondition: 'accident victim',
    contactPhone: '+923001234567',
    ...overrides,
  };
}

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user_789',
    name: 'Fatima Zahra',
    phone: '+923001234567',
    email: 'fatima@example.com',
    bloodGroup: 'B+',
    city: 'Lahore',
    ...overrides,
  };
}

export function createMockJWT(): string {
  // Simple base64 placeholder – in real tests use a proper signed token mock
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ sub: 'user_789', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64');
  const signature = 'signature';
  return `${header}.${payload}.${signature}`;
}

export function waitForAsync(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Usage in tests:
// const donor = createMockDonor({ city: 'Lahore' });
