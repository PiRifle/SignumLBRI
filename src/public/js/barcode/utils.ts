import {
    Html5Qrcode,
    Html5QrcodeScannerState,
    Html5QrcodeSupportedFormats
} from "html5-qrcode";

import $ from "jquery"

import { Html5QrcodeResult } from "html5-qrcode/esm/core";

export function setupBarcodeScanner() {
    let barcodeDetector: any;

    //@ts-ignore
    const formatsToSupport = [Html5QrcodeSupportedFormats.EAN_13];
    let config = {
        fps: 10,
        formatsToSupport: formatsToSupport,
    };
    let reader: Html5Qrcode;
    if (!("BarcodeDetector" in window)) {
        reader = new Html5Qrcode("reader");
        console.log(
            "Barcode Detector is not supported by this browser! Using legacy",
        );
    } else {
        console.log("Barcode Detector supported!");

        //@ts-ignore
        barcodeDetector = new BarcodeDetector({
            formats: ["ean_13"],
        });
    }

    return async function instantiateScan(
        _callback: (decodedText: string, result: Html5QrcodeResult) => void,
        disableStop: boolean = false
    ) {
        function callback(decodedText: string, result: Html5QrcodeResult) {
            if (!disableStop) {
                if (reader) {
                    reader.stop()
                }
            }
            _callback(decodedText, result)
        }
        if (barcodeDetector) {
            let mediaStream: MediaStream | undefined;
            if ($("#reader").parent().hasClass("d-none")) {
                $("#reader").append("<h6>USING PRFL ENGINE</h6>");
                $("#reader").parent().removeClass("d-none");
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });
                const video = document.createElement("video");
                video.srcObject = mediaStream;
                video.autoplay = true;
                video.style.width = "100%";
                $("#reader").append(video);
                async function detect() {
                    if (barcodeDetector) {
                        try {
                            const read = await barcodeDetector
                                .detect(video)
                                .catch(console.error);
                            if (read) {
                                console.log(read);
                                return read[0].rawValue;
                            }
                        } catch (e) { }
                    }
                }
                (async function renderLoop() {
                    const val = await detect();
                    if (!val) {
                        requestAnimationFrame(renderLoop);
                    } else {
                        callback(val, {} as unknown as Html5QrcodeResult);
                    }
                })();

                //mount VideoFeed
            } else {
                //unmount VideoFeed
                $("#reader").parent().addClass("d-none");
                $("#reader").children().remove();
                if (mediaStream) {
                    mediaStream.getTracks().forEach((track) => track.stop());
                }
            }
        }
        if (reader) {
            //@ts-ignore
            if (reader.getState() == Html5QrcodeScannerState.NOT_STARTED) {
                $("#reader").parent().removeClass("d-none");
                reader.start({ facingMode: "environment" }, config, callback, () => { });
            } else {
                reader.stop();
                $("#reader").parent().addClass("d-none");
            }
        }
    }
}