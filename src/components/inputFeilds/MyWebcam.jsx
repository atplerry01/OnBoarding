import React from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: "user"
};

export default (props) => {
  const webcamRef = React.useRef(null);
  const { handleCapture, cancelWebcam } = props;
  const capture = React.useCallback(
    () => {
      const imageSrc = webcamRef.current.getScreenshot();
      handleCapture(imageSrc);
    },
    [webcamRef, handleCapture]
  );

  return (
    <>
      <Webcam
        audio={false}
        height={400}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        // mirrored
        width={400}
        videoConstraints={videoConstraints}
      />
      <div className="row">
        <div className="col-6">
          <button onClick={capture} type="button" className="btn btn-sm btn-outline">Capture photo</button>
        </div>
        <div className="col-6">
          <button onClick={cancelWebcam} type="button" className="btn btn-sm btn-outline">Cancel</button>
        </div>
      </div>
    </>
  );
};
