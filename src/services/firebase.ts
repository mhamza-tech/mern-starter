
import * as admin from 'firebase-admin'
import { FIREBASE_SERVICE_ACCOUNT_FILE } from '../env'

const serviceAccount = require(FIREBASE_SERVICE_ACCOUNT_FILE)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

export { admin }
