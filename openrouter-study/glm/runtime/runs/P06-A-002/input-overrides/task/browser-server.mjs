import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const {port,token,downloadsPath} = JSON.parse(readFileSync(new URL('./browser.json',import.meta.url),'utf8'));
const server = await chromium.launchServer({headless:true,host:'127.0.0.1',port,wsPath:'/'+token,downloadsPath});
console.log('Pilot browser ready');
process.once('SIGTERM', async () => { await server.close(); process.exit(0) });
process.once('SIGINT', async () => { await server.close(); process.exit(0) });
