import bikeStatus from '../model/shared/enum/bike-status.js';
import dockStatus from '../model/shared/enum/dock-status.js';
import employeeRole from '../model/shared/enum/employee-role.js';

export const bikeData = [
  {
    id: 'c2739f83-93ec-45ae-8a48-73667bbadfd6',
    serialNumber: 'BI-001',
    brand: 'abc',
    model: 'abc',
    manufactureYear: 2000,
    status: bikeStatus.AVAILABLE,
  },
  {
    id: '89c6ffdd-6a0b-45bf-b51a-9eb00aa54b2b',
    serialNumber: 'BI-002',
    brand: 'abc',
    model: 'abc',
    manufactureYear: 2000,
    status: bikeStatus.MAINTENANCE_REQUESTED,
  },
  {
    id: '35ee2d1a-5e44-422d-9e17-d10ebb62838c',
    serialNumber: 'BI-003',
    brand: 'abc',
    model: 'abc',
    manufactureYear: 2000,
    status: bikeStatus.NEW,
  },
  {
    id: '43abae4f-c13a-43e4-9802-d83e598107e1',
    serialNumber: 'BI-004',
    brand: 'abc',
    model: 'abc',
    manufactureYear: 2000,
    status: bikeStatus.RENTED,
  },
  {
    id: '5eb6afd9-4bcd-4364-8bbe-ffd5ab700542',
    serialNumber: 'BI-005',
    brand: 'abc',
    model: 'abc',
    manufactureYear: 2000,
    status: bikeStatus.RETIRED,
  },
  {
    id: '6141cf4b-3063-4351-b0ae-eb16888ab043',
    serialNumber: 'BI-006',
    brand: 'abc',
    model: 'abc',
    manufactureYear: 2000,
    status: bikeStatus.UNDER_MAINTENANCE,
  },
];

export const dockData = [
  {
    id: '885a3276-a561-4aa8-b878-cf6945a510f4',
    serialNumber: 'DO-001',
    model: 'abc',
    manufactureDate: '2025-06-15',
    status: dockStatus.AVAILABLE,
  },
  {
    id: 'f9529f69-7538-4e0a-87d4-192632208bd5',
    serialNumber: 'DO-002',
    model: 'abc',
    manufactureDate: '2025-06-15',
    status: dockStatus.DECOMMISSIONED,
  },
  {
    id: 'fa788e4a-f4b3-4308-90f1-5c538eaf31d6',
    serialNumber: 'DO-003',
    model: 'abc',
    manufactureDate: '2025-06-15',
    status: dockStatus.MAINTENANCE_REQUESTED,
  },
  {
    id: '0153ce2d-90b7-40eb-a4a1-1e40578c99f0',
    serialNumber: 'DO-004',
    model: 'abc',
    manufactureDate: '2025-06-15',
    status: dockStatus.OCCUPIED,
    bikeId: bikeData[0].id,
  },
  {
    id: 'caa8ffc0-f42d-4900-b9ac-b2f0640f17b4',
    serialNumber: 'DO-005',
    model: 'abc',
    manufactureDate: '2025-06-15',
    status: dockStatus.OCCUPIED,
    bikeId: bikeData[1].id,
  },
  {
    id: '3dc555e3-e81c-4a7e-8d31-508149f7ffa8',
    serialNumber: 'DO-006',
    model: 'abc',
    manufactureDate: '2025-06-15',
    status: dockStatus.OPERATIONAL,
  },
  {
    id: '3ad94812-ed26-40d7-a674-1ec75a871526',
    serialNumber: 'DO-007',
    model: 'abc',
    manufactureDate: '2025-06-15',
    status: dockStatus.UNDER_MAINTENANCE,
  },
];

export const employeeData = [
  {
    id: '1153c0aa-2bf2-415a-bc5a-d8d8998e60fc',
    registration: 'EM-001',
    cpf: '70479421064',
    name: 'Operator Person',
    birthDate: '2000-06-15',
    role: employeeRole.OPERATOR,
  },
  {
    id: 'a9fcbf9a-0f32-4c74-91c4-3b785dcaaccb',
    registration: 'EM-002',
    cpf: '38724897043',
    name: 'Admin Person',
    birthDate: '2000-06-15',
    role: employeeRole.ADMIN,
  },
];
