import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import { tableService } from './services/tableService'
import { menuService } from './services/menuService'
import { orderService } from './services/orderService'
import { paymentService } from './services/paymentService'
import { settingService } from './services/settingService'
import { backupService } from './services/backupService'
import { printerService } from './services/printer'
import { financeService } from './services/financeService'
import { cashbookService } from './services/cashbookService'
import { reportService } from './services/reportService'
import { authService } from './services/authService'
import { staffService } from './services/staffService'
import { attendanceService } from './services/attendanceService'
import { payrollService } from './services/payrollService'
import { kitchenService } from './services/kitchenService'
import { reservationService } from './services/reservationService'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// --- IPC Handlers ---

// Tables & Areas
ipcMain.handle('table:getAreas', () => tableService.getAreas())
ipcMain.handle('table:createArea', (_, name) => tableService.createArea(name))
ipcMain.handle('table:updateArea', (_, id, name) => tableService.updateArea(id, name))
ipcMain.handle('table:deleteArea', (_, id) => tableService.deleteArea(id))
ipcMain.handle('table:getTables', () => tableService.getTables())
ipcMain.handle('table:createTable', (_, data) => tableService.createTable(data))
ipcMain.handle('table:updateTable', (_, id, data) => tableService.updateTable(id, data))
ipcMain.handle('table:deleteTable', (_, id) => tableService.deleteTable(id))
ipcMain.handle('table:updateStatus', (_, id, status) => tableService.updateTableStatus(id, status))

// Menu
ipcMain.handle('menu:getCategories', () => menuService.getCategories())
ipcMain.handle('menu:createCategory', (_, name) => menuService.createCategory(name))
ipcMain.handle('menu:updateCategory', (_, id, name) => menuService.updateCategory(id, name))
ipcMain.handle('menu:deleteCategory', (_, id) => menuService.deleteCategory(id))
ipcMain.handle('menu:getItems', () => menuService.getMenuItems())
ipcMain.handle('menu:createItem', (_, data) => menuService.createMenuItem(data))
ipcMain.handle('menu:updateItem', (_, id, data) => menuService.updateMenuItem(id, data))
ipcMain.handle('menu:deleteItem', (_, id) => menuService.deleteItem(id))

// Orders
ipcMain.handle('order:getOpen', (_, tableId) => orderService.getOpenOrderByTable(tableId))
ipcMain.handle('order:create', (_, data) => orderService.createOrder(data))
ipcMain.handle('order:update', (_, id, data) => orderService.updateOrder(id, data))
ipcMain.handle('order:getAll', () => orderService.getOrders())
ipcMain.handle('order:cancelItem', (_, id, reason, userId) => orderService.cancelOrderItem(id, reason, userId))
ipcMain.handle('order:transferTable', (_, orderId, newTableId, userId) => orderService.transferTable(orderId, newTableId, userId))

// Payments & Invoices
ipcMain.handle('payment:process', (_, data) => paymentService.processPayment(data))
ipcMain.handle('payment:getInvoices', () => paymentService.getInvoices())

// Settings
ipcMain.handle('setting:getAll', () => settingService.getSettings())
ipcMain.handle('setting:update', (_, key, val) => settingService.updateSetting(key, val))
ipcMain.handle('setting:getStats', () => settingService.getDashboardStats())

// Backup & Restore
ipcMain.handle('backup:create', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePath } = await dialog.showSaveDialog(window!, {
    title: 'Lưu bản sao lưu',
    defaultPath: `lukari-backup-${new Date().getTime()}.db`,
    filters: [{ name: 'Database files', extensions: ['db'] }]
  });
  if (canceled || !filePath) return false;
  return await backupService.backupDb(filePath);
})
ipcMain.handle('backup:restore', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(window!, {
    title: 'Chọn bản sao lưu',
    properties: ['openFile'],
    filters: [{ name: 'Database files', extensions: ['db'] }]
  });
  if (canceled || filePaths.length === 0) return false;
  await backupService.restoreDb(filePaths[0]);
  app.relaunch();
  app.quit();
  return true;
})

// Printer
ipcMain.handle('printer:getPrinters', () => printerService.getPrinters())
ipcMain.handle('printer:printBill', (_, html, printerName) => printerService.printBill(html, printerName))

// Finance
ipcMain.handle('finance:getExpenses', (_, start, end) => financeService.getExpenses(start, end))
ipcMain.handle('finance:createExpense', (_, data) => financeService.createExpense(data))
ipcMain.handle('finance:cancelExpense', (_, id, reason, userId) => financeService.cancelExpense(id, reason, userId))
ipcMain.handle('finance:getRevenues', (_, start, end) => financeService.getRevenues(start, end))
ipcMain.handle('finance:createRevenue', (_, data) => financeService.createRevenue(data))
ipcMain.handle('finance:cancelRevenue', (_, id, reason, userId) => financeService.cancelRevenue(id, reason, userId))

// Cashbook
ipcMain.handle('cashbook:getTransactions', (_, start, end) => cashbookService.getTransactions(start, end))
ipcMain.handle('cashbook:getBalances', () => cashbookService.getBalances())

// Reports
ipcMain.handle('report:getSales', (_, start, end) => reportService.getSalesReport(start, end))
ipcMain.handle('report:getPnL', (_, start, end) => reportService.getProfitAndLossReport(start, end))

// Auth
ipcMain.handle('auth:login', (_, username, password) => authService.login(username, password))



// Staff
ipcMain.handle('staff:getAll', () => staffService.getStaffs())
ipcMain.handle('staff:getRoles', () => staffService.getRoles())
ipcMain.handle('staff:create', (_, data) => staffService.createStaff(data))
ipcMain.handle('staff:update', (_, id, data) => staffService.updateStaff(id, data))
ipcMain.handle('staff:delete', (_, id) => staffService.deleteStaff(id))

// Attendance
ipcMain.handle('attendance:getAll', (_, start, end) => attendanceService.getAttendances(start, end))
ipcMain.handle('attendance:checkIn', (_, userId, shift) => attendanceService.checkIn(userId, shift))
ipcMain.handle('attendance:checkOut', (_, id, note) => attendanceService.checkOut(id, note))
ipcMain.handle('attendance:update', (_, id, data) => attendanceService.updateAttendance(id, data))

// Payroll
ipcMain.handle('payroll:getAll', (_, month) => payrollService.getPayrolls(month))
ipcMain.handle('payroll:calculate', (_, month, userId) => payrollService.calculatePayroll(month, userId))
ipcMain.handle('payroll:update', (_, id, data) => payrollService.updatePayrollManually(id, data))
ipcMain.handle('payroll:lock', (_, id, userId) => payrollService.lockPayroll(id, userId))

// Kitchen
ipcMain.handle('kitchen:getPending', () => kitchenService.getPendingItems())
ipcMain.handle('kitchen:updateStatus', (_, id, status) => kitchenService.updateItemStatus(id, status))

// Reservations
ipcMain.handle('reservation:getAll', (_, start, end) => reservationService.getAll(start, end))
ipcMain.handle('reservation:create', (_, data) => reservationService.create(data))
ipcMain.handle('reservation:updateStatus', (_, id, status) => reservationService.updateStatus(id, status))
