declare module 'react-native-honeywell-scanner' {
  export interface BarcodeReadEvent {
    data: string;
  }

  export interface Subscription {
    remove(): void;
  }

  export type BarcodeEventName = 'barcodeReadSuccess' | 'barcodeReadFail';

  export type BarcodeReadSuccessHandler = (event: BarcodeReadEvent) => void;
  export type BarcodeReadFailHandler = () => void;

  export interface HoneywellScannerType {
    /**
     * Constant for barcode read success event name
     */
    BARCODE_READ_SUCCESS: 'barcodeReadSuccess';

    /**
     * Constant for barcode read fail event name
     */
    BARCODE_READ_FAIL: 'barcodeReadFail';

    /**
     * Whether the device is a compatible Honeywell scanner
     */
    isCompatible: boolean;

    /**
     * Start the barcode reader and claim the scanner
     * @returns Promise that resolves to true if claimed successfully, false otherwise
     */
    startReader(): Promise<boolean>;

    /**
     * Stop the barcode reader and release resources
     */
    stopReader(): Promise<void>;

    /**
     * Listen for barcode scanner events
     * @param eventName - 'barcodeReadSuccess' or 'barcodeReadFail'
     * @param handler - Callback function
     * @returns Subscription object with remove() method
     */
    on(eventName: 'barcodeReadSuccess', handler: BarcodeReadSuccessHandler): Subscription;
    on(eventName: 'barcodeReadFail', handler: BarcodeReadFailHandler): Subscription;

    /**
     * Stop listening for barcode scanner events
     * @param eventName - 'barcodeReadSuccess' or 'barcodeReadFail'
     * @param handler - Callback function to remove
     */
    off(eventName: 'barcodeReadSuccess', handler: BarcodeReadSuccessHandler): void;
    off(eventName: 'barcodeReadFail', handler: BarcodeReadFailHandler): void;
  }

  const HoneywellScanner: HoneywellScannerType;
  export default HoneywellScanner;
}
