package nl.volst.HoneywellScanner;

import java.lang.reflect.Method;
import java.util.Set;
import javax.annotation.Nullable;
import java.util.HashMap;
import java.util.Map;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import static nl.volst.HoneywellScanner.HoneywellScannerPackage.TAG;

import com.honeywell.aidc.AidcManager;
import com.honeywell.aidc.AidcManager.CreatedCallback;
import com.honeywell.aidc.BarcodeFailureEvent;
import com.honeywell.aidc.BarcodeReadEvent;
import com.honeywell.aidc.BarcodeReader;
import com.honeywell.aidc.ScannerUnavailableException;

@SuppressWarnings("unused")
public class HoneywellScannerModule extends ReactContextBaseJavaModule implements BarcodeReader.BarcodeListener {

    // Debugging
    private static final boolean D = true;

    private static BarcodeReader barcodeReader;
    private AidcManager manager;
    private BarcodeReader reader;
    private ReactApplicationContext mReactContext;

    private static final String BARCODE_READ_SUCCESS = "barcodeReadSuccess";
    private static final String BARCODE_READ_FAIL = "barcodeReadFail";

    public HoneywellScannerModule(ReactApplicationContext reactContext) {
        super(reactContext);

        mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "HoneywellScanner";
    }

    /**
     * Send event to javascript
     * @param eventName Name of the event
     * @param params Additional params
     */
    private void sendEvent(String eventName, @Nullable WritableMap params) {
        if (mReactContext.hasActiveCatalystInstance()) {
            if (D) Log.d(TAG, "Sending event: " + eventName);
            mReactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }

    public void onBarcodeEvent(BarcodeReadEvent barcodeReadEvent) {
        if (D) Log.d(TAG, "HONEYWELLSCANNER - Barcode scan read");
        WritableMap params = Arguments.createMap();
        params.putString("data", barcodeReadEvent.getBarcodeData());
        sendEvent(BARCODE_READ_SUCCESS, params);
    }

    public void onFailureEvent(BarcodeFailureEvent barcodeFailureEvent) {
        if (D) Log.d(TAG, "HONEYWELLSCANNER - Barcode scan failed");
        sendEvent(BARCODE_READ_FAIL, null);
    }

    /*******************************/
    /** Methods Available from JS **/
    /*******************************/

    @ReactMethod
    public void startReader(final Promise promise) {
        AidcManager.create(mReactContext, new CreatedCallback() {
            @Override
            public void onCreated(AidcManager aidcManager) {
                manager = aidcManager;
                reader = manager.createBarcodeReader();

                if (reader != null) {
                    reader.addBarcodeListener(HoneywellScannerModule.this);

                    try {
                        reader.setProperty(BarcodeReader.PROPERTY_DATA_PROCESSOR_LAUNCH_BROWSER, false);
                        reader.claim();
                        Log.d(TAG, "Scanner claimed successfully");
                        promise.resolve(true);
                    } catch (ScannerUnavailableException e) {
                        Log.e(TAG, "Scanner unavailable: " + e.getMessage());
                        promise.reject("SCANNER_UNAVAILABLE", "Failed to claim scanner", e);
                    } catch (Exception e) {
                        Log.e(TAG, "Failed to initialize scanner: " + e.getMessage());
                        promise.reject("SCANNER_ERROR", "Failed to initialize scanner", e);
                    }
                } else {
                    Log.e(TAG, "BarcodeReader is null");
                    promise.reject("READER_NULL", "BarcodeReader could not be created");
                }
            }
        });
    }

    @ReactMethod
    public void stopReader(Promise promise) {
        try {
            if (reader != null) {
                reader.removeBarcodeListener(this);
                reader.close();
                reader = null;
            }

            if (manager != null) {
                manager.close();
                manager = null;
            }

            Log.d(TAG, "Scanner stopped");
            promise.resolve(null);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping scanner: " + e.getMessage());
            promise.reject("STOP_ERROR", "Error while stopping scanner", e);
        }
    }

    @ReactMethod
    public void addListener(String eventName) {}

    @ReactMethod
    public void removeListeners(Integer count) {}

    private boolean isCompatible() {
        return Build.BRAND.toLowerCase().contains("honeywell");
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("BARCODE_READ_SUCCESS", BARCODE_READ_SUCCESS);
        constants.put("BARCODE_READ_FAIL", BARCODE_READ_FAIL);
        constants.put("isCompatible", isCompatible());
        return constants;
    }

}
