const { NativeModules, NativeEventEmitter } = require('react-native');

const HoneywellScanner = NativeModules.HoneywellScanner;

const eventEmitter = new NativeEventEmitter(HoneywellScanner);

const allowedEvents = [
  HoneywellScanner.BARCODE_READ_SUCCESS,
  HoneywellScanner.BARCODE_READ_FAIL,
];

const listeners = new Map();

/**
 * Listen for barcode scanner events
 * @param {string} eventName - 'barcodeReadSuccess' or 'barcodeReadFail'
 * @param {function} handler - Callback function
 */
HoneywellScanner.on = (eventName, handler) => {
  if (!allowedEvents.includes(eventName)) {
    throw new Error(`Event name "${eventName}" is not supported.`);
  }

  const subscription = eventEmitter.addListener(eventName, handler);
  listeners.set(handler, subscription);
};

/**
 * Stop listening for events
 * @param {string} eventName
 * @param {function} handler
 */
HoneywellScanner.off = (eventName, handler) => {
  const subscription = listeners.get(handler);
  if (subscription) {
    subscription.remove();
    listeners.delete(handler);
  }
};

module.exports = HoneywellScanner;
