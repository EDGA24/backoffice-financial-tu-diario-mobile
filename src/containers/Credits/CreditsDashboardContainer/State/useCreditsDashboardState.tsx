import type { NavKey } from '@/components/organisms/mobile/BottomNavigation/BottomNavigation';
import type { LoanSummary } from '@/components/molecules/mobile/DashboardContacTable/DashboardContacTable';
import { useState } from 'react'

const MOCK_LOANS: LoanSummary[] = [
  {
    initials: 'EM', name: 'Erick Manuel', phone: '961 123 4567', date: '25/03/26', amount: '$3,000.00', status: 'paid',
    historialPagos: [
      { id: 'p1', date: '25/03/26', amount: 500, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '25/04/26', amount: 500, status: 'pagado', method: 'Transferencia' },
      { id: 'p3', date: '25/05/26', amount: 500, status: 'pagado', method: 'Efectivo' },
      { id: 'p4', date: '25/06/26', amount: 500, status: 'pagado', method: 'Efectivo' },
      { id: 'p5', date: '25/07/26', amount: 500, status: 'pagado', method: 'Transferencia' },
      { id: 'p6', date: '25/08/26', amount: 500, status: 'pagado', method: 'Efectivo' },
    ],
  },
  {
    initials: 'EM', name: 'Erick Manuel', phone: '961 123 4567', date: '24/03/26', amount: '$3,500.00', status: 'restructured',
    historialPagos: [
      { id: 'p1', date: '25/04/26', amount: 437.5, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '25/05/26', amount: 437.5, status: 'pagado', method: 'Efectivo' },
      { id: 'p3', date: '25/06/26', amount: 437.5, status: 'pagado', method: 'Transferencia' },
      { id: 'p4', date: '28/07/26', amount: 437.5, status: 'pendiente' },
    ],
  },
  {
    initials: 'MJ', name: 'María José', phone: '961 987 6543', date: '18/03/26', amount: '$1,500.00', status: 'late',
    historialPagos: [
      { id: 'p1', date: '18/04/26', amount: 375, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '18/05/26', amount: 375, status: 'atrasado' },
      { id: 'p3', date: '18/06/26', amount: 375, status: 'pendiente' },
      { id: 'p4', date: '18/07/26', amount: 375, status: 'pendiente' },
    ],
  },
  {
    initials: 'CR', name: 'Carlos Ruiz', phone: '961 222 3344', date: '17/03/26', amount: '$2,200.00', status: 'paid',
    historialPagos: [
      { id: 'p1', date: '17/04/26', amount: 550, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '17/05/26', amount: 550, status: 'pagado', method: 'Transferencia' },
      { id: 'p3', date: '17/06/26', amount: 550, status: 'pagado', method: 'Efectivo' },
      { id: 'p4', date: '17/07/26', amount: 550, status: 'pagado', method: 'Efectivo' },
    ],
  },
  {
    initials: 'AL', name: 'Ana López', phone: '961 555 7788', date: '16/03/26', amount: '$4,000.00', status: 'late',
    historialPagos: [
      { id: 'p1', date: '16/04/26', amount: 1000, status: 'pagado', method: 'Transferencia' },
      { id: 'p2', date: '16/05/26', amount: 1000, status: 'atrasado' },
      { id: 'p3', date: '16/06/26', amount: 1000, status: 'pendiente' },
      { id: 'p4', date: '16/07/26', amount: 1000, status: 'pendiente' },
    ],
  },
  {
    initials: 'JP', name: 'Juan Pérez', phone: '961 444 1122', date: '15/03/26', amount: '$2,800.00', status: 'restructured',
    historialPagos: [
      { id: 'p1', date: '15/04/26', amount: 700, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '15/05/26', amount: 700, status: 'pagado', method: 'Efectivo' },
      { id: 'p3', date: '15/06/26', amount: 700, status: 'pendiente' },
      { id: 'p4', date: '15/07/26', amount: 700, status: 'pendiente' },
    ],
  },
  {
    initials: 'LG', name: 'Luis García', phone: '961 666 8899', date: '14/03/26', amount: '$1,200.00', status: 'paid',
    historialPagos: [
      { id: 'p1', date: '14/04/26', amount: 600, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '14/05/26', amount: 600, status: 'pagado', method: 'Transferencia' },
    ],
  },
  {
    initials: 'SF', name: 'Sofía Flores', phone: '961 333 2211', date: '13/03/26', amount: '$5,000.00', status: 'late',
    historialPagos: [
      { id: 'p1', date: '13/04/26', amount: 1250, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '13/05/26', amount: 1250, status: 'atrasado' },
      { id: 'p3', date: '13/06/26', amount: 1250, status: 'pendiente' },
      { id: 'p4', date: '13/07/26', amount: 1250, status: 'pendiente' },
    ],
  },
  {
    initials: 'MR', name: 'Miguel Rodríguez', phone: '961 777 9900', date: '12/03/26', amount: '$2,500.00', status: 'paid',
    historialPagos: [
      { id: 'p1', date: '12/04/26', amount: 625, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '12/05/26', amount: 625, status: 'pagado', method: 'Efectivo' },
      { id: 'p3', date: '12/06/26', amount: 625, status: 'pagado', method: 'Transferencia' },
      { id: 'p4', date: '12/07/26', amount: 625, status: 'pagado', method: 'Efectivo' },
    ],
  },
  {
    initials: 'PC', name: 'Patricia Cruz', phone: '961 111 2233', date: '11/03/26', amount: '$3,300.00', status: 'restructured',
    historialPagos: [
      { id: 'p1', date: '11/04/26', amount: 825, status: 'pagado', method: 'Transferencia' },
      { id: 'p2', date: '11/05/26', amount: 825, status: 'pendiente' },
      { id: 'p3', date: '11/06/26', amount: 825, status: 'pendiente' },
      { id: 'p4', date: '11/07/26', amount: 825, status: 'pendiente' },
    ],
  },
  {
    initials: 'DH', name: 'Daniel Hernández', phone: '961 888 4455', date: '10/03/26', amount: '$1,800.00', status: 'late',
    historialPagos: [
      { id: 'p1', date: '10/04/26', amount: 450, status: 'atrasado' },
      { id: 'p2', date: '10/05/26', amount: 450, status: 'pendiente' },
      { id: 'p3', date: '10/06/26', amount: 450, status: 'pendiente' },
      { id: 'p4', date: '10/07/26', amount: 450, status: 'pendiente' },
    ],
  },
  {
    initials: 'VT', name: 'Valeria Torres', phone: '961 999 6677', date: '09/03/26', amount: '$4,200.00', status: 'paid',
    historialPagos: [
      { id: 'p1', date: '09/04/26', amount: 1050, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '09/05/26', amount: 1050, status: 'pagado', method: 'Efectivo' },
      { id: 'p3', date: '09/06/26', amount: 1050, status: 'pagado', method: 'Transferencia' },
      { id: 'p4', date: '09/07/26', amount: 1050, status: 'pagado', method: 'Efectivo' },
    ],
  },
  {
    initials: 'RA', name: 'Ricardo Aguilar', phone: '961 121 3434', date: '08/03/26', amount: '$2,700.00', status: 'late',
    historialPagos: [
      { id: 'p1', date: '08/04/26', amount: 675, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '08/05/26', amount: 675, status: 'atrasado' },
      { id: 'p3', date: '08/06/26', amount: 675, status: 'pendiente' },
      { id: 'p4', date: '08/07/26', amount: 675, status: 'pendiente' },
    ],
  },
  {
    initials: 'CM', name: 'Claudia Méndez', phone: '961 565 7878', date: '07/03/26', amount: '$3,900.00', status: 'paid',
    historialPagos: [
      { id: 'p1', date: '07/04/26', amount: 975, status: 'pagado', method: 'Transferencia' },
      { id: 'p2', date: '07/05/26', amount: 975, status: 'pagado', method: 'Efectivo' },
      { id: 'p3', date: '07/06/26', amount: 975, status: 'pagado', method: 'Efectivo' },
      { id: 'p4', date: '07/07/26', amount: 975, status: 'pagado', method: 'Transferencia' },
    ],
  },
  {
    initials: 'FN', name: 'Fernando Núñez', phone: '961 343 5656', date: '06/03/26', amount: '$1,600.00', status: 'restructured',
    historialPagos: [
      { id: 'p1', date: '06/04/26', amount: 400, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '06/05/26', amount: 400, status: 'pendiente' },
      { id: 'p3', date: '06/06/26', amount: 400, status: 'pendiente' },
      { id: 'p4', date: '06/07/26', amount: 400, status: 'pendiente' },
    ],
  },
  {
    initials: 'IS', name: 'Ivonne Sánchez', phone: '961 787 9090', date: '05/03/26', amount: '$2,100.00', status: 'paid',
    historialPagos: [
      { id: 'p1', date: '05/04/26', amount: 700, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '05/05/26', amount: 700, status: 'pagado', method: 'Efectivo' },
      { id: 'p3', date: '05/06/26', amount: 700, status: 'pagado', method: 'Transferencia' },
    ],
  },
  {
    initials: 'OC', name: 'Oscar Castillo', phone: '961 454 6767', date: '04/03/26', amount: '$3,700.00', status: 'late',
    historialPagos: [
      { id: 'p1', date: '04/04/26', amount: 925, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '04/05/26', amount: 925, status: 'atrasado' },
      { id: 'p3', date: '04/06/26', amount: 925, status: 'pendiente' },
      { id: 'p4', date: '04/07/26', amount: 925, status: 'pendiente' },
    ],
  },
  {
    initials: 'BL', name: 'Brenda León', phone: '961 909 1212', date: '03/03/26', amount: '$2,400.00', status: 'restructured',
    historialPagos: [
      { id: 'p1', date: '03/04/26', amount: 600, status: 'pagado', method: 'Transferencia' },
      { id: 'p2', date: '03/05/26', amount: 600, status: 'pendiente' },
      { id: 'p3', date: '03/06/26', amount: 600, status: 'pendiente' },
      { id: 'p4', date: '03/07/26', amount: 600, status: 'pendiente' },
    ],
  },
  {
    initials: 'AR', name: 'Arturo Ramos', phone: '961 232 4545', date: '02/03/26', amount: '$4,500.00', status: 'paid',
    historialPagos: [
      { id: 'p1', date: '02/04/26', amount: 1125, status: 'pagado', method: 'Efectivo' },
      { id: 'p2', date: '02/05/26', amount: 1125, status: 'pagado', method: 'Efectivo' },
      { id: 'p3', date: '02/06/26', amount: 1125, status: 'pagado', method: 'Transferencia' },
      { id: 'p4', date: '02/07/26', amount: 1125, status: 'pagado', method: 'Efectivo' },
    ],
  },
  {
    initials: 'NG', name: 'Natalia Gómez', phone: '961 676 8989', date: '01/03/26', amount: '$1,900.00', status: 'late',
    historialPagos: [
      { id: 'p1', date: '01/04/26', amount: 475, status: 'atrasado' },
      { id: 'p2', date: '01/05/26', amount: 475, status: 'pendiente' },
      { id: 'p3', date: '01/06/26', amount: 475, status: 'pendiente' },
      { id: 'p4', date: '01/07/26', amount: 475, status: 'pendiente' },
    ],
  },
];

const useCreditsDashboardState = () => {
    const [activeNav, setActiveNav] = useState<NavKey>('credits');
    const loans = MOCK_LOANS;

    const handleNavChange = (key: NavKey) => setActiveNav(key);

    return {
        activeNav,
        handleNavChange,
        loans,
    };
};

export default useCreditsDashboardState;