import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Upload, CheckCircle, AlertCircle, Loader,
  ArrowLeft, User, FileText, Camera, X, RotateCcw
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

// Convert file to base64
const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const ImageUpload = ({ label, name, value, onChange, required = true }) => {
  const [preview, setPreview] = useState(value || null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File too large. Max size is 2MB.');
      return;
    }
    const b64 = await toBase64(file);
    setPreview(b64);
    onChange(name, b64);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all ${
        preview ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-400 bg-gray-50'
      }`}>
        {preview ? (
          <div className="relative">
            <img src={preview} alt={label} className="w-full h-40 object-cover" />
            <button
              type="button"
              onClick={() => { setPreview(null); onChange(name, ''); }}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all">
              <X size={14} />
            </button>
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              <CheckCircle size={11} /> Uploaded
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
            <Upload size={28} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 font-medium">Click to upload</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG — max 2MB</p>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        )}
      </div>
    </div>
  );
};

// ── Live camera selfie capture (no gallery picker — must be a real-time photo) ──
const SelfieCapture = ({ label, name, value, onChange }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Always release the camera when the component unmounts
  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    setError('');
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access was denied. Please allow camera permission in your browser settings, or upload a photo instead.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera was found on this device. You can upload a photo instead.');
      } else {
        setError('Could not access the camera. You can upload a photo instead.');
      }
    } finally {
      setStarting(false);
    }
  };

  // Attach the stream once the <video> element exists
  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraOpen]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    // Draw the real (non-mirrored) frame so any text on the Aadhaar card stays legible.
    // The <video> preview below is mirrored via CSS purely for a natural selfie feel.
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreview(dataUrl);
    onChange(name, dataUrl);
    stopCamera();
  };

  const retake = () => {
    setPreview(null);
    onChange(name, '');
    startCamera();
  };

  const handleFallbackUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File too large. Max size is 2MB.');
      return;
    }
    const b64 = await toBase64(file);
    setPreview(b64);
    onChange(name, b64);
    setError('');
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex gap-2 mb-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-red-700">{error}</p>
          </div>
          <label className="inline-flex items-center text-xs font-semibold text-indigo-600 cursor-pointer hover:underline">
            <Upload size={12} className="mr-1" /> Upload a photo instead
            <input type="file" accept="image/*" className="hidden" onChange={handleFallbackUpload} />
          </label>
        </div>
      )}

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-green-400 bg-green-50">
          <img src={preview} alt={label} className="w-full h-64 object-cover" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
            <CheckCircle size={11} /> Captured
          </div>
          <button
            type="button"
            onClick={retake}
            className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 text-gray-700 text-xs px-3 py-1.5 rounded-full font-semibold hover:bg-white transition-all shadow">
            <RotateCcw size={13} /> Retake
          </button>
        </div>
      ) : isCameraOpen ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-indigo-400 bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          <div className="absolute top-3 left-3 right-3 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full text-center">
            Hold your Aadhaar card next to your face
          </div>
          <button
            type="button"
            onClick={stopCamera}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all">
            <X size={16} />
          </button>
          <div className="absolute inset-x-0 bottom-0 py-4 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent">
            <button
              type="button"
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-white border-4 border-indigo-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
              <Camera size={24} className="text-indigo-600" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={startCamera}
          disabled={starting}
          className="w-full h-40 border-2 border-dashed border-gray-300 hover:border-indigo-400 bg-gray-50 rounded-xl flex flex-col items-center justify-center transition-all disabled:opacity-60">
          {starting ? (
            <Loader className="animate-spin text-indigo-500 mb-2" size={24} />
          ) : (
            <Camera size={28} className="text-gray-400 mb-2" />
          )}
          <p className="text-sm text-gray-500 font-medium">{starting ? 'Opening camera…' : 'Click to open camera'}</p>
          <p className="text-xs text-gray-400 mt-1">Live photo only — gallery uploads aren't accepted here</p>
        </button>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const KYCPage = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');

  const [kycStatus, setKycStatus]       = useState(null);  // existing submission
  const [loading,   setLoading]         = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [error, setError]               = useState('');

  const [form, setForm] = useState({
    fullName:      localStorage.getItem('userName') || '',
    dateOfBirth:   '',
    address:       '',
    aadhaarNumber: '',
    aadhaarFront:  '',
    aadhaarBack:   '',
    panNumber:     '',
    panFront:      '',
    selfie:        '',
    gstCertificate: '',
  });

  // Load existing KYC status
  useEffect(() => {
    const load = async () => {
      const data = await apiFetch('/api/kyc/my');
      if (data.success) {
        setKycStatus(data.data);
        if (data.data.submission) {
          // Pre-fill name from existing submission
          setForm(prev => ({ ...prev, fullName: data.data.submission.fullName || prev.fullName }));
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const setImageField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all required fields
    const required = ['fullName', 'dateOfBirth', 'address', 'aadhaarNumber', 'aadhaarFront', 'aadhaarBack', 'panNumber', 'panFront', 'selfie'];
    for (const field of required) {
      if (!form[field]) {
        setError(`Please fill in / upload: ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    // Basic Aadhaar validation (12 digits)
    if (!/^\d{12}$/.test(form.aadhaarNumber.replace(/\s/g, ''))) {
      setError('Aadhaar number must be 12 digits.');
      return;
    }

    // Basic PAN validation
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase())) {
      setError('PAN number format is invalid (e.g. ABCDE1234F).');
      return;
    }

    setSubmitting(true);
    const data = await apiFetch('/api/kyc/submit', {
      method: 'POST',
      body: JSON.stringify({ ...form, panNumber: form.panNumber.toUpperCase() }),
    });
    setSubmitting(false);

    if (data.success) {
      setSubmitted(true);
    } else {
      setError(data.message || 'Submission failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  // Already verified
  if (kycStatus?.kycStatus === 'verified') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="text-green-600" size={42} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Verified!</h2>
          <p className="text-gray-500 mb-6">Your identity has been verified. You can now {role === 'organizer' ? 'post jobs' : 'apply for gigs'}.</p>
          <button onClick={() => navigate(role === 'organizer' ? '/organizer' : '/volunteer')}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Under review / submitted
  if ((kycStatus?.kycStatus === 'in_progress' || kycStatus?.submission?.status === 'submitted' || kycStatus?.submission?.status === 'under_review') && !submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Shield className="text-amber-600" size={42} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Under Review</h2>
          <p className="text-gray-500 mb-3">Your documents have been submitted and are being reviewed by our team.</p>
          <p className="text-sm text-gray-400 mb-6">Verification typically takes 24–48 hours.</p>
          <button onClick={() => navigate(role === 'organizer' ? '/organizer' : '/volunteer')}
            className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Success after submit
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="text-green-600" size={42} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents Submitted!</h2>
          <p className="text-gray-500 mb-3">Your KYC documents have been submitted successfully. Our admin team will review them within 24 hours.</p>
          <p className="text-sm text-gray-400 mb-6">You'll be notified once your verification is complete.</p>
          <button onClick={() => navigate(role === 'organizer' ? '/organizer' : '/volunteer')}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isRejected = kycStatus?.kycStatus === 'rejected' || kycStatus?.submission?.status === 'rejected';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              KYC Verification
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Rejection banner */}
        {isRejected && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={22} />
              <div>
                <p className="font-bold text-red-800 mb-1">KYC Rejected</p>
                <p className="text-sm text-red-700">
                  {kycStatus?.submission?.rejectionReason || 'Documents were unclear or invalid.'}
                </p>
                <p className="text-sm text-red-600 mt-2">Please re-submit with clearer documents.</p>
              </div>
            </div>
          </div>
        )}

        {/* Info banner */}
        <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <div className="flex gap-3">
            <Shield className="text-indigo-600 flex-shrink-0 mt-0.5" size={22} />
            <div>
              <p className="font-bold text-indigo-800 mb-1">Why KYC is required</p>
              <p className="text-sm text-indigo-700">
                KYC (Know Your Customer) ensures a safe platform for everyone.
                {role === 'organizer'
                  ? ' Verified organizers can post jobs and hire volunteers.'
                  : ' Verified volunteers can apply for gigs and get hired.'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Personal Details ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <User size={20} className="text-indigo-600" /> Personal Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name (as on Aadhaar) *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="As per government ID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Address *</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={2}
                  placeholder="Street, City, State, PIN"
                  required
                />
              </div>
            </div>
          </div>

          {/* ── Aadhaar ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <FileText size={20} className="text-indigo-600" /> Aadhaar Card
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Aadhaar Number *</label>
              <input
                type="text"
                value={form.aadhaarNumber}
                onChange={e => setForm(p => ({ ...p, aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono tracking-widest"
                placeholder="1234 5678 9012"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <ImageUpload label="Aadhaar Front" name="aadhaarFront" value={form.aadhaarFront} onChange={setImageField} />
              <ImageUpload label="Aadhaar Back"  name="aadhaarBack"  value={form.aadhaarBack}  onChange={setImageField} />
            </div>
          </div>

          {/* ── PAN ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <FileText size={20} className="text-indigo-600" /> PAN Card
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">PAN Number *</label>
              <input
                type="text"
                value={form.panNumber}
                onChange={e => setForm(p => ({ ...p, panNumber: e.target.value.toUpperCase().slice(0, 10) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono tracking-widest"
                placeholder="ABCDE1234F"
                required
              />
            </div>
            <ImageUpload label="PAN Card Photo" name="panFront" value={form.panFront} onChange={setImageField} />
          </div>

          {/* ── Live Selfie with Aadhaar ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Camera size={20} className="text-indigo-600" /> Selfie Verification
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Take a live photo of yourself holding your Aadhaar card. This must be captured in real time through your camera — gallery uploads aren't accepted for this step.
            </p>
            <SelfieCapture label="Live Selfie with Aadhaar" name="selfie" value={form.selfie} onChange={setImageField} />
          </div>

          {/* ── GST (organizer only) ── */}
          {role === 'organizer' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" /> GST Certificate <span className="text-sm font-normal text-gray-400">(Optional)</span>
              </h3>
              <ImageUpload label="GST Registration Certificate" name="gstCertificate" value={form.gstCertificate} onChange={setImageField} required={false} />
            </div>
          )}

          {/* Submit */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Privacy Notice</p>
              <p>Your documents are securely stored and used only for identity verification. They will not be shared with third parties.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg
              hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70">
            {submitting
              ? <><Loader className="animate-spin" size={22} /> Submitting...</>
              : <><Shield size={22} /> {isRejected ? 'Re-submit KYC Documents' : 'Submit KYC Documents'}</>
            }
          </button>
        </form>
      </main>
    </div>
  );
};

export default KYCPage;