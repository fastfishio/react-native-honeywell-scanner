const { NativeModules, NativeEventEmitter } = require('react-native');

const HoneywellScanner = NativeModules.HoneywellScanner || {};

// Create event emitter only if native module exists
const eventEmitter = NativeModules.HoneywellScanner
  ? new NativeEventEmitter(NativeModules.HoneywellScanner)
  : null;

const allowedEvents = [
  HoneywellScanner.BARCODE_READ_SUCCESS,
  HoneywellScanner.BARCODE_READ_FAIL,
];

// Store subscriptions by handler reference
const subscriptions = new Map();

/**
 * Listen for available events
 * @param {String} eventName - Name of event: 'barcodeReadSuccess' or 'barcodeReadFail'
 * @param {Function} handler - Event handler
 * @returns {Object} Subscription object with remove() method
 */
HoneywellScanner.on = (eventName, handler) => {
  if (!allowedEvents.includes(eventName)) {
    throw new Error(`Event name ${eventName} is not a supported event.`);
  }
  if (!eventEmitter) {
    console.warn('HoneywellScanner: Native module not available');
    return { remove: () => {} };
  }
  const subscription = eventEmitter.addListener(eventName, handler);
  subscriptions.set(handler, subscription);
  return subscription;
};

/**
 * Stop listening for event
 * @param {String} eventName - Name of event: 'barcodeReadSuccess' or 'barcodeReadFail'
 * @param {Function} handler - Event handler to remove
 */
HoneywellScanner.off = (eventName, handler) => {
  if (!allowedEvents.includes(eventName)) {
    throw new Error(`Event name ${eventName} is not a supported event.`);
  }
  const subscription = subscriptions.get(handler);
  if (subscription) {
    subscription.remove();
    subscriptions.delete(handler);
  }
};

module.exports = HoneywellScanner;
