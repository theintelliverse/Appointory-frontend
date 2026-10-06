import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  X, Phone, Lock, Eye, EyeOff, ShieldCheck, ArrowRight,
  ArrowLeft, CheckCircle2, AlertCircle, Loader2, Calendar, User
} from 'lucide-react';
import { API_URL } from '../../config/runtime';
import { trackEvent, setAnalyticsUser } from '../../utils/analytics';

const PatientAuthBookingModal = ({ isOpen, onClose, onAuthenticated }) => {
  const navigate = useNavigate();

  // 'phone' | 'password' | 'otp' | 'register'
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [debugOtp, setDebugOtp] = useState('');

  // Form State
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [existingPatientName, setExistingPatientName] = useState('');

  if (!isOpen) return null;

  const handleReset = () => {
    setStep('phone');
    setLoading(false);
    setError('');
    setShowPassword(false);
    setDebugOtp('');
    setPhone('');
    setPassword('');
    setOtp('');
    setName('');
    setAge('');
    setGender('Male');
    setExistingPatientName('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSuccessRedirect = (patientData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', 'patient');
    localStorage.setItem('patientName', patientData?.name || name || 'Valued Patient');
    localStorage.setItem('userPhone', patientData?.phone || phone);

    setAnalyticsUser({ _id: patientData?._id || patientData?.id, role: 'patient' });
    trackEvent('login', { role: 'patient', context: 'booking_modal' });

    handleClose();
    if (onAuthenticated) {
      onAuthenticated();
    } else {
      navigate('/patient/book-appointment');
    }
  };

  // 1. Submit Phone: Check if registered
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    setDebugOtp('');

    try {
      const checkRes = await axios.post(`${API_URL}/api/auth/patient/check-phone`, { phone: cleanPhone });
      const { isRegistered, name: foundName } = checkRes.data;

      if (isRegistered) {
        // User already has a registered password
        setExistingPatientName(foundName || '');
        setStep('password');
      } else {
        // New user or has no password -> send OTP for verification
        const otpRes = await axios.post(`${API_URL}/api/auth/patient/send-otp`, {
          phone: cleanPhone,
          isRegistration: false
        });

        if (otpRes.data.debugOtp) {
          setDebugOtp(otpRes.data.debugOtp);
        }
        setStep('otp');
      }
    } catch (err) {
      console.error('Check Phone Error:', err);
      setError(err.response?.data?.message || 'Failed to verify phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2A. Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Please enter your password (minimum 6 characters)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const res = await axios.post(`${API_URL}/api/auth/patient/login-with-password`, {
        phone: cleanPhone,
        password
      });

      if (res.data.success) {
        handleSuccessRedirect(res.data.patient, res.data.token);
      }
    } catch (err) {
      console.error('Password Login Error:', err);
      setError(err.response?.data?.message || 'Invalid password. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2B. Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.replace(/\D/g, '');
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const res = await axios.post(`${API_URL}/api/auth/patient/verify-otp`, {
        phone: cleanPhone,
        otp: cleanOtp
      });

      if (res.data.success) {
        setStep('register');
      }
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const otpRes = await axios.post(`${API_URL}/api/auth/patient/send-otp`, {
        phone: cleanPhone,
        isRegistration: false
      });
      if (otpRes.data.debugOtp) {
        setDebugOtp(otpRes.data.debugOtp);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // 3. Register & Complete Profile
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please create a password (minimum 6 characters)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const res = await axios.post(`${API_URL}/api/auth/patient/register-with-otp-password`, {
        phone: cleanPhone,
        otp,
        password,
        name: name.trim(),
        age: age ? parseInt(age, 10) : null,
        gender
      });

      if (res.data.success) {
        handleSuccessRedirect(res.data.patient, res.data.token);
      }
    } catch (err) {
      console.error('Registration Error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Book Doctor Appointment</h3>
              <p className="text-xs text-teal-100 font-medium">Fast Token &amp; Slot Confirmation</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {/* Global Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-semibold animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: ENTER PHONE NUMBER */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-slate-500 font-bold text-sm pointer-events-none">
                    <Phone size={16} className="text-teal-600" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    placeholder="Enter 10-digit mobile number"
                    autoFocus
                    className="w-full pl-20 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1.5 ml-1">
                  We check if you have an account or need a quick OTP verification.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-600/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Book</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2A: PASSWORD LOGIN (IF REGISTERED) */}
          {step === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-teal-700 font-bold">
                    Welcome back{existingPatientName ? `, ${existingPatientName}` : ''}!
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">+91 {phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setPassword('');
                    setError('');
                  }}
                  className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Account Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your password"
                    autoFocus
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    navigate('/patient/forgot-password');
                  }}
                  className="text-xs text-teal-600 font-bold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-600/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Login &amp; Book Appointment</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2B: OTP VERIFICATION (IF NEW / NOT REGISTERED) */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-700 font-bold">Verify Mobile Number</p>
                  <p className="text-[11px] text-slate-500 font-medium">OTP sent to +91 {phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                  className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {debugOtp && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center">
                  Dev Test OTP: <span className="font-mono tracking-widest text-emerald-950 font-black">{debugOtp}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="• • • • • •"
                  autoFocus
                  className="w-full py-3 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black text-xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-teal-600 font-bold hover:underline cursor-pointer disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-600/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify &amp; Continue</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: PATIENT DETAILS & PASSWORD (AFTER OTP) */}
          {step === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>+91 {phone} verified! Complete details to book.</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    placeholder="e.g. Ramesh Patel"
                    autoFocus
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim() || password.length < 6}
                className="w-full mt-2 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-600/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register &amp; Book Appointment</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy Note */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium text-center">
            <ShieldCheck size={14} className="text-teal-600 shrink-0" />
            <span>DPDP Act 2023 Compliant • AES-256 Health Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAuthBookingModal;
