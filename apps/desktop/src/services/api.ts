// Wrapper for IPC calls
export const api = (window as any).api as {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  on: (channel: string, listener: (...args: any[]) => void) => () => void;
};

// Tables
export const tableService = {
  getAreas: () => api.invoke('table:getAreas'),
  createArea: (name: string) => api.invoke('table:createArea', name),
  updateArea: (id: string, name: string) => api.invoke('table:updateArea', id, name),
  deleteArea: (id: string) => api.invoke('table:deleteArea', id),
  getTables: () => api.invoke('table:getTables'),
  createTable: (data: any) => api.invoke('table:createTable', data),
  updateTable: (id: string, data: any) => api.invoke('table:updateTable', id, data),
  deleteTable: (id: string) => api.invoke('table:deleteTable', id),
  updateTableStatus: (id: string, status: string) => api.invoke('table:updateStatus', id, status),
};

// Menu
export const menuService = {
  getCategories: () => api.invoke('menu:getCategories'),
  createCategory: (name: string) => api.invoke('menu:createCategory', name),
  updateCategory: (id: string, name: string) => api.invoke('menu:updateCategory', id, name),
  deleteCategory: (id: string) => api.invoke('menu:deleteCategory', id),
  getItems: () => api.invoke('menu:getItems'),
  createItem: (data: any) => api.invoke('menu:createItem', data),
  updateItem: (id: string, data: any) => api.invoke('menu:updateItem', id, data),
  deleteItem: (id: string) => api.invoke('menu:deleteItem', id),
};

// Order
export const orderService = {
  getOpen: (tableId: string) => api.invoke('order:getOpen', tableId),
  create: (data: any) => api.invoke('order:create', data),
  update: (id: string, data: any) => api.invoke('order:update', id, data),
  getAll: () => api.invoke('order:getAll'),
  cancelItem: (id: string, reason: string, userId: string) => api.invoke('order:cancelItem', id, reason, userId),
  transferTable: (orderId: string, newTableId: string, userId: string) => api.invoke('order:transferTable', orderId, newTableId, userId),
};

// Payment
export const paymentService = {
  process: (data: any) => api.invoke('payment:process', data),
  getInvoices: () => api.invoke('payment:getInvoices'),
};

// Setting
export const settingService = {
  getAll: () => api.invoke('setting:getAll'),
  update: (key: string, val: string) => api.invoke('setting:update', key, val),
  getStats: () => api.invoke('setting:getStats'),
};

// Backup
export const backupService = {
  create: () => api.invoke('backup:create'),
  restore: () => api.invoke('backup:restore'),
};

// Printer
export const printerService = {
  getPrinters: () => api.invoke('printer:getPrinters'),
  printBill: (html: string, printerName?: string) => api.invoke('printer:printBill', html, printerName),
};

// Finance
export const financeService = {
  getExpenses: (start?: Date, end?: Date) => api.invoke('finance:getExpenses', start, end),
  createExpense: (data: any) => api.invoke('finance:createExpense', data),
  cancelExpense: (id: string, reason: string, userId?: string) => api.invoke('finance:cancelExpense', id, reason, userId),
  getRevenues: (start?: Date, end?: Date) => api.invoke('finance:getRevenues', start, end),
  createRevenue: (data: any) => api.invoke('finance:createRevenue', data),
  cancelRevenue: (id: string, reason: string, userId?: string) => api.invoke('finance:cancelRevenue', id, reason, userId),
};

// Cashbook
export const cashbookService = {
  getTransactions: (start?: Date, end?: Date) => api.invoke('cashbook:getTransactions', start, end),
  getBalances: () => api.invoke('cashbook:getBalances'),
};

// Reports
export const reportService = {
  getSales: (start: Date, end: Date) => api.invoke('report:getSales', start, end),
  getPnL: (start: Date, end: Date) => api.invoke('report:getPnL', start, end),
};

// Auth
export const authService = {
  login: (username: string, passwordRaw: string) => api.invoke('auth:login', username, passwordRaw),
};

// Staff
export const staffService = {
  getStaffs: () => api.invoke('staff:getAll'),
  getRoles: () => api.invoke('staff:getRoles'),
  createStaff: (data: any) => api.invoke('staff:create', data),
  updateStaff: (id: string, data: any) => api.invoke('staff:update', id, data),
  deleteStaff: (id: string) => api.invoke('staff:delete', id),
};

// Attendance
export const attendanceService = {
  getAttendances: (start: Date, end: Date) => api.invoke('attendance:getAll', start, end),
  checkIn: (userId: string, shift: string) => api.invoke('attendance:checkIn', userId, shift),
  checkOut: (id: string, note?: string) => api.invoke('attendance:checkOut', id, note),
  updateAttendance: (id: string, data: any) => api.invoke('attendance:update', id, data),
};

// Payroll
export const payrollService = {
  getPayrolls: (month: string) => api.invoke('payroll:getAll', month),
  calculatePayroll: (month: string, userId: string) => api.invoke('payroll:calculate', month, userId),
  updatePayroll: (id: string, data: any) => api.invoke('payroll:update', id, data),
  lockPayroll: (id: string, userId: string) => api.invoke('payroll:lock', id, userId),
};

// Kitchen
export const kitchenService = {
  getPending: () => api.invoke('kitchen:getPending'),
  updateStatus: (id: string, status: string) => api.invoke('kitchen:updateStatus', id, status),
};

// Reservations
export const reservationService = {
  getAll: (start?: Date, end?: Date) => api.invoke('reservation:getAll', start, end),
  create: (data: any) => api.invoke('reservation:create', data),
  updateStatus: (id: string, status: string) => api.invoke('reservation:updateStatus', id, status),
};
