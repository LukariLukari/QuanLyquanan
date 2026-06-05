import { PrismaClient } from '@prisma/client';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

const isDev = !app.isPackaged;
const dbName = 'dev.db';

const dbPath = isDev 
  ? path.join(process.cwd(), 'prisma', dbName)
  : path.join(app.getPath('userData'), dbName);

if (!isDev) {
  if (!fs.existsSync(dbPath)) {
    const templateDb = path.join(process.resourcesPath, 'prisma', dbName);
    if (fs.existsSync(templateDb)) {
      fs.copyFileSync(templateDb, dbPath);
    }
  }
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});
