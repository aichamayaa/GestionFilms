import dns from 'node:dns';
import mongoose from 'mongoose';
import { config } from './config.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

export async function connecter() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
  return mongoose.connection;
}

export async function deconnecter() {
  await mongoose.disconnect();
}