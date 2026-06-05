import { BrowserWindow } from 'electron';

export const printerService = {
  getPrinters: async () => {
    // We need a dummy window or mainWindow to get printers, 
    // but in electron 14+ getPrintersAsync is available on webContents
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      return await focusedWindow.webContents.getPrintersAsync();
    }
    // fallback if no window is focused
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      return await windows[0].webContents.getPrintersAsync();
    }
    return [];
  },
  printBill: async (htmlContent: string, printerName?: string) => {
    return new Promise((resolve, reject) => {
      let printWindow: BrowserWindow | null = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: true,
        }
      });

      printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      printWindow.webContents.on('did-finish-load', () => {
        printWindow?.webContents.print({
          silent: true,
          deviceName: printerName,
          margins: { marginType: 'none' }
        }, (success, failureReason) => {
          if (!success) {
            reject(new Error(failureReason));
          } else {
            resolve(true);
          }
          printWindow?.close();
          printWindow = null;
        });
      });
    });
  }
};
