import { initializeApp, cert } from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
 import {readFileSync} from 'fs';

 const serviceAcount = JSON.parse(
    readFileSync(new URL('./serviceAccountKey.json', import.meta.url))

 );
 initializeApp({
    credential: cert(serviceAccount),
 });

 export const db = getFirestore();