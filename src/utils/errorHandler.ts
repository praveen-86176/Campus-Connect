/**
 * Error Handling Utilities
 * 
 * Provides detailed error logging for Firebase operations
 */

export interface FirebaseError {
  code: string;
  message: string;
  stack?: string;
}

/**
 * Log detailed Firebase error information
 */
export const logFirebaseError = (error: any, operation: string, context?: Record<string, any>): void => {
  const errorCode = error?.code || 'unknown';
  const errorMessage = error?.message || 'Unknown error occurred';
  
  console.error(`❌ ${operation} - Error Code:`, errorCode);
  console.error(`❌ ${operation} - Error Message:`, errorMessage);
  
  if (context) {
    console.error(`❌ ${operation} - Context:`, context);
  }
  
  // Common error code explanations
  const errorExplanations: Record<string, string> = {
    'permission-denied': 'Rules rejected the operation - check Firestore security rules',
    'not-found': 'Document/collection does not exist',
    'unauthenticated': 'User not logged in - authentication required',
    'already-exists': 'Document already exists',
    'invalid-argument': 'Invalid argument provided',
    'deadline-exceeded': 'Operation timed out',
    'resource-exhausted': 'Quota exceeded',
    'failed-precondition': 'Operation failed due to precondition',
    'aborted': 'Operation was aborted',
    'out-of-range': 'Value out of range',
    'unimplemented': 'Operation not implemented',
    'internal': 'Internal error',
    'unavailable': 'Service unavailable',
    'data-loss': 'Data loss occurred',
  };
  
  const explanation = errorExplanations[errorCode];
  if (explanation) {
    console.error(`❌ ${operation} - Explanation:`, explanation);
  }
  
  if (error?.stack) {
    console.error(`❌ ${operation} - Stack:`, error.stack);
  }
};

/**
 * Handle Firebase error with detailed logging and return user-friendly message
 */
export const handleFirebaseError = (error: any, operation: string, context?: Record<string, any>): string => {
  logFirebaseError(error, operation, context);
  
  const errorCode = error?.code || 'unknown';
  
  // Return user-friendly error messages
  switch (errorCode) {
    case 'permission-denied':
      return 'You do not have permission to perform this action.';
    case 'not-found':
      return 'The requested item was not found.';
    case 'unauthenticated':
      return 'Please sign in to continue.';
    case 'already-exists':
      return 'This item already exists.';
    case 'invalid-argument':
      return 'Invalid information provided. Please check your input.';
    case 'deadline-exceeded':
      return 'The operation took too long. Please try again.';
    case 'resource-exhausted':
      return 'Service limit reached. Please try again later.';
    case 'unavailable':
      return 'Service is temporarily unavailable. Please try again later.';
    default:
      return error?.message || 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Test Firebase connection with detailed error logging
 */
export const testFirebaseConnection = async (db: any, collectionName: string, docId: string): Promise<void> => {
  try {
    const docRef = db.collection(collectionName).doc(docId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      console.log('✅ Success:', doc.data());
    } else {
      console.log('⚠️ Document does not exist');
    }
  } catch (error: any) {
    logFirebaseError(error, `Firebase Connection Test (${collectionName}/${docId})`);
    throw error;
  }
};

