declare module 'react-native-honeywell-wrapper' {
  export type BarcodeScannerEvent = 'barcodeReadSuccess' | 'barcodeReadFail';

  export interface HoneywellScannerType {
    BARCODE_READ_SUCCESS: string;
    BARCODE_READ_FAIL: string;
    isCompatible: boolean;
    startReader: () => Promise<boolean>;
    stopReader: () => Promise<void>;
    on: (event: BarcodeScannerEvent, handler: (data: any) => void) => void;
    off: (event: BarcodeScannerEvent, handler: (data: any) => void) => void;
  }

  const HoneywellScanner: HoneywellScannerType;
  export default HoneywellScanner;
}
