import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

const Html5QrcodePlugin = (props) => {
  useEffect(() => {
    const config = {
      fps: props.fps,
      qrbox: props.qrbox,
      aspectRatio: props.aspectRatio,
      disableFlip: props.disableFlip,
    };

    const verbose = props.verbose === true;

    if (!props.qrCodeSuccessCallback) {
      throw new Error("qrCodeSuccessCallback is required callback.");
    }

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "html5qr-code-full-region",
      config,
      verbose
    );

    html5QrcodeScanner.render(
      props.qrCodeSuccessCallback,
      props.qrCodeErrorCallback
    );

    return () => {
      html5QrcodeScanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  return (
    <div id="html5qr-code-full-region" style={{ width: '100%', height: '100%' }} />
  );
};

export default Html5QrcodePlugin;