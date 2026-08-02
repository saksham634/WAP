import React, { useRef, useEffect, useState } from 'react';

export default function CameraSnapshotModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let localStream = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { width: 640, height: 480 } })
        .then((s) => {
          localStream = s;
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Camera access error:', err);
          setError('Camera permission denied or camera device unavailable.');
          setLoading(false);
        });
    } else {
      setError('Webcam API is not supported in this browser.');
      setLoading(false);
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    // Mirror image for natural selfie feel
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    onCapture(dataUrl);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-content-card"
        style={{ maxWidth: 460 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Take Profile Picture</h3>
          <button className="modal-close-btn" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '300px',
              backgroundColor: '#0f172a',
              borderRadius: '14px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            {error ? (
              <p style={{ color: '#ef4444', padding: '20px', fontSize: '14px' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
                {error}
              </p>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                  }}
                />
                {loading && (
                  <div style={{ position: 'absolute', color: '#ffffff', fontSize: '14px' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                    Connecting to camera...
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={handleCapture}
              disabled={loading || !!error}
              style={{ flex: 1, padding: '12px' }}
            >
              <i className="fa-solid fa-camera"></i> Capture & Save
            </button>
            <button className="btn btn-outline" onClick={handleClose} style={{ padding: '12px 20px' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
