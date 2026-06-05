import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export const backupService = {
  backupDb: async (destinationPath: string) => {
    return new Promise((resolve, reject) => {
      const isDev = !app.isPackaged;
      const source = isDev 
        ? path.join(process.cwd(), 'prisma', 'dev.db')
        : path.join(app.getPath('userData'), 'dev.db');
        
      fs.copyFile(source, destinationPath, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },
  restoreDb: async (sourcePath: string) => {
    return new Promise((resolve, reject) => {
      const isDev = !app.isPackaged;
      const dest = isDev 
        ? path.join(process.cwd(), 'prisma', 'dev.db')
        : path.join(app.getPath('userData'), 'dev.db');
        
      fs.copyFile(sourcePath, dest, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }
};
