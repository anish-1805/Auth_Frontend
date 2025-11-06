/**
 * Cleanup Old Storage
 * 
 * Removes old redux-persist data from localStorage.
 * Run this once after migrating to secure storage.
 */

export const cleanupOldStorage = () => {
  try {
    // Remove redux-persist keys
    const keysToRemove = [
      'persist:auth',
      'persist:root',
    ];

    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Removed old storage key: ${key}`);
      }
    });

    // Remove any other persist keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('persist:')) {
        localStorage.removeItem(key);
        console.log(`✅ Removed old persist key: ${key}`);
      }
    });

    console.log('✅ Old storage cleanup completed');
  } catch (error) {
    console.error('❌ Failed to cleanup old storage:', error);
  }
};

export default cleanupOldStorage;
