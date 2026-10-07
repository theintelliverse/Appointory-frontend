import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    Building2, Stethoscope, Calendar, CalendarOff, ArrowRight, ArrowLeft,
    MapPin, Phone, CheckCircle, AlertCircle, Loader, Search, Clock, Activity, Zap, Check, ChevronRight, X, CalendarDays, ShieldCheck, GraduationCap, Briefcase,
    Users, UserCheck, UserPlus, Lock, KeyRound, Shield, Sparkles, QrCode
} from 'lucide-react';
import SEO from '../../components/SEO';
import { API_URL } from '../../config/runtime';
import { normalizeIndianPhone } from '../../utils/phone';
import { trackEvent } from '../../utils/analytics';
const MAX_BOOKING_DAYS = 14;
const DEFAULT_WORKING_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const WEEKDAY_MAP = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const toLocalDateTimeKey = (dateInput) => {
    const d = new Date(dateInput);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const BookAppointment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const rescheduleApp = location.state?.rescheduleApp;

    // 🌐 URL Query Params (QR Reception Landing / Direct Link)
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const urlClinicParam = searchParams.get('clinic') || searchParams.get('clinicId');
    const urlDoctorParam = searchParams.get('doctor') || searchParams.get('doctorId');
    const isFromQr = searchParams.get('utm_source') === 'qr' || Boolean(searchParams.get('qr'));

    const initialClinicId = rescheduleApp?.clinicId?._id 
        || (typeof rescheduleApp?.clinicId === 'string' ? rescheduleApp.clinicId : '') 
        || rescheduleApp?.clinicId?.toString?.() 
        || '';
    const initialDoctorId = rescheduleApp?.doctorId?._id 
        || (typeof rescheduleApp?.doctorId === 'string' ? rescheduleApp.doctorId : '') 
        || rescheduleApp?.doctorId?.toString?.() 
        || '';
    const initialQueueId = rescheduleApp?.queueId?._id 
        || (typeof rescheduleApp?.queueId === 'string' ? rescheduleApp.queueId : '') 
        || rescheduleApp?.queueId?.toString?.() 
        || rescheduleApp?._id?.toString?.() 
        || '';

    const [step, setStep] = useState(rescheduleApp ? 3 : 1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [clinics, setClinics] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [clinicHolidays, setClinicHolidays] = useState([]);
    const [doctorLeaves, setDoctorLeaves] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);
    const [searchClinic, setSearchClinic] = useState('');
    const [selectedDate, setSelectedDate] = useState(() => {
        if (rescheduleApp?.appointmentDate) {
            const d = new Date(rescheduleApp.appointmentDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (!isNaN(d.getTime()) && d >= today) {
                return d;
            }
        }
        return new Date();
    });

    // 🔒 10-Minute Slot Hold State
    const [holdToken, setHoldToken] = useState(null);
    const [holdTimeRemaining, setHoldTimeRemaining] = useState(0);
    const [isHoldingSlot, setIsHoldingSlot] = useState(false);

    // 👨‍👩‍👧‍👦 Family Member & Profile State ("Konā mate?")
    const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('token')));
    const [primaryPatient, setPrimaryPatient] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [selectedFor, setSelectedFor] = useState('myself'); // 'myself' | 'family' | 'new_family'
    const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState('');
    const [newMember, setNewMember] = useState({
        name: '',
        relationship: 'Child',
        age: '',
        gender: 'Male',
        guardianConsent: false
    });

    // 🔐 Just-In-Time Authentication State (Step 4 for non-logged in users)
    const [authMode, setAuthMode] = useState('phone'); // 'phone' | 'login' | 'signup'
    const [authPhone, setAuthPhone] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authOtp, setAuthOtp] = useState('');
    const [authName, setAuthName] = useState('');
    const [authAge, setAuthAge] = useState('');
    const [authGender, setAuthGender] = useState('Male');
    const [authWhatsappOptIn, setAuthWhatsappOptIn] = useState(false);
    const [authConsentAgreed, setAuthConsentAgreed] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [otpCountdown, setOtpCountdown] = useState(0);

    const [formData, setFormData] = useState({
        clinicId: initialClinicId,
        doctorId: initialDoctorId,
        appointmentDate: '',
        appointmentType: rescheduleApp?.appointmentType || 'new',
        reason: rescheduleApp?.reason || 'Rescheduled consultation visit',
        slotMode: 'quick',
        rescheduleAppointmentId: initialQueueId
    });

    useEffect(() => {
        if (rescheduleApp) {
            const cId = rescheduleApp.clinicId?._id || (typeof rescheduleApp.clinicId === 'string' ? rescheduleApp.clinicId : '') || rescheduleApp.clinicId?.toString?.() || '';
            const dId = rescheduleApp.doctorId?._id || (typeof rescheduleApp.doctorId === 'string' ? rescheduleApp.doctorId : '') || rescheduleApp.doctorId?.toString?.() || '';
            const qId = rescheduleApp.queueId?._id || (typeof rescheduleApp.queueId === 'string' ? rescheduleApp.queueId : '') || rescheduleApp.queueId?.toString?.() || rescheduleApp._id?.toString?.() || '';

            setFormData(prev => ({
                ...prev,
                clinicId: cId || prev.clinicId,
                doctorId: dId || prev.doctorId,
                appointmentType: rescheduleApp.appointmentType || prev.appointmentType,
                reason: rescheduleApp.reason !== undefined ? rescheduleApp.reason : prev.reason,
                rescheduleAppointmentId: qId || prev.rescheduleAppointmentId
            }));

            if (rescheduleApp.appointmentDate) {
                const d = new Date(rescheduleApp.appointmentDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (!isNaN(d.getTime()) && d >= today) {
                    setSelectedDate(d);
                }
            }
            setStep(3);
        }
    }, [rescheduleApp]);

    // Fallback: match clinic by name if clinicId was not resolved from object
    useEffect(() => {
        if (rescheduleApp && !formData.clinicId && clinics.length > 0) {
            const nameToFind = rescheduleApp.clinicName || rescheduleApp.clinicId?.name;
            if (nameToFind) {
                const matched = clinics.find(c => c.name?.toLowerCase().trim() === nameToFind.toLowerCase().trim());
                if (matched) {
                    setFormData(prev => ({ ...prev, clinicId: matched._id }));
                }
            }
        }
    }, [clinics, rescheduleApp, formData.clinicId]);

    // Fallback: match doctor by name once doctors list is available
    useEffect(() => {
        if (rescheduleApp && !formData.doctorId && doctors.length > 0) {
            const nameToFind = rescheduleApp.doctorName || rescheduleApp.doctorId?.name;
            if (nameToFind) {
                const clean = nameToFind.replace(/^Dr\.?\s*/i, '').trim().toLowerCase();
                const matched = doctors.find(d => d.name?.toLowerCase().includes(clean) || clean.includes(d.name?.toLowerCase()));
                if (matched) {
                    setFormData(prev => ({ ...prev, doctorId: matched._id }));
                }
            }
        }
    }, [doctors, rescheduleApp, formData.doctorId]);

    // 📍 Auto-select clinic from URL parameter (e.g. /book?clinic=SHARDA&utm_source=qr)
    useEffect(() => {
        if (!rescheduleApp && clinics.length > 0 && urlClinicParam && !formData.clinicId) {
            const queryClean = urlClinicParam.trim().toLowerCase();
            const matchedClinic = clinics.find(c => 
                c._id?.toString() === urlClinicParam ||
                c.clinicCode?.toLowerCase() === queryClean ||
                c.slug?.toLowerCase() === queryClean ||
                c.name?.toLowerCase().includes(queryClean)
            );

            if (matchedClinic) {
                setFormData(prev => ({ ...prev, clinicId: matchedClinic._id }));
                setStep(prev => (prev === 1 ? 2 : prev));
            }
        }
    }, [clinics, urlClinicParam, rescheduleApp, formData.clinicId]);

    // 👨‍⚕️ Auto-select doctor from URL parameter if present
    useEffect(() => {
        if (!rescheduleApp && doctors.length > 0 && urlDoctorParam && !formData.doctorId) {
            const docQuery = urlDoctorParam.trim().toLowerCase();
            const matchedDoc = doctors.find(d => 
                d._id?.toString() === urlDoctorParam ||
                d.name?.toLowerCase().includes(docQuery)
            );
            if (matchedDoc) {
                setFormData(prev => ({ ...prev, doctorId: matchedDoc._id }));
                setStep(prev => (prev < 3 ? 3 : prev));
            }
        }
    }, [doctors, urlDoctorParam, rescheduleApp, formData.doctorId]);

    // Generate date strip for Step 3
    const dateStrip = useMemo(() => {
        const dates = [];
        for (let i = 0; i < MAX_BOOKING_DAYS; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, []);

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/api/clinic/public/list`);
                if (res.data.success) {
                    setClinics(res.data.data);
                }
            } catch {
                setError('Failed to load clinical facilities.');
            } finally {
                setLoading(false);
            }
        };
        fetchClinics();
    }, []);

    useEffect(() => {
        if (formData.clinicId) {
            const fetchDoctors = async () => {
                try {
                    setLoading(true);
                    const res = await axios.get(`${API_URL}/api/clinic/public/doctors/${formData.clinicId}`);
                    if (res.data.success) {
                        setDoctors(res.data.data);
                    }
                } catch {
                    setError('Could not retrieve specialist list.');
                } finally {
                    setLoading(false);
                }
            };
            fetchDoctors();

            const fetchClinicLeaves = async () => {
                try {
                    const res = await axios.get(`${API_URL}/api/clinic/public/leaves/${formData.clinicId}`);
                    if (res.data.success) {
                        setClinicHolidays(res.data.data.holidays || []);
                        setDoctorLeaves(res.data.data.doctorLeaves || []);
                    }
                } catch {
                    setClinicHolidays([]);
                    setDoctorLeaves([]);
                }
            };
            fetchClinicLeaves();
        }
    }, [formData.clinicId]);

    const getSelectedClinic = useCallback(() => {
        const found = clinics.find(c => c._id === formData.clinicId);
        if (found) return found;
        if (rescheduleApp) {
            return {
                _id: formData.clinicId,
                name: rescheduleApp.clinicName || rescheduleApp.clinicId?.name || 'Clinic Facility',
                address: rescheduleApp.clinicAddress || rescheduleApp.clinicId?.address || 'Clinical Facility'
            };
        }
        return null;
    }, [clinics, formData.clinicId, rescheduleApp]);

    const getSelectedDoctor = useCallback(() => {
        const found = doctors.find(d => d._id === formData.doctorId);
        if (found) return found;
        if (rescheduleApp) {
            return {
                _id: formData.doctorId,
                name: rescheduleApp.doctorName || rescheduleApp.doctorId?.name || 'Consultant Specialist',
                specialization: rescheduleApp.doctorSpecialization || rescheduleApp.doctorId?.specialization || 'Specialist'
            };
        }
        return null;
    }, [doctors, formData.doctorId, rescheduleApp]);

    const formatDocTitle = useCallback((name) => {
        if (!name) return 'Specialist';
        const clean = name.replace(/^(dr\.?\s*)/i, '').trim();
        return `Dr. ${clean}`;
    }, []);

    const getDoctorInitial = useCallback((name) => {
        if (!name) return 'D';
        const clean = name.replace(/^(dr\.?\s*)/i, '').trim();
        return (clean.charAt(0) || name.charAt(0) || 'D').toUpperCase();
    }, []);

    const getDateAvailability = useCallback((date) => {
        if (!date || isNaN(date.getTime())) {
            return { isAvailable: true };
        }

        const weekday = WEEKDAY_MAP[date.getDay()];
        const selectedClinic = getSelectedClinic();
        const workingDays = selectedClinic?.workingDays?.length
            ? selectedClinic.workingDays.map(w => w.toLowerCase())
            : DEFAULT_WORKING_DAYS;

        // 1. Clinic weekly schedule (e.g. Sunday or off-days)
        if (!workingDays.includes(weekday)) {
            const isSunday = weekday === 'sunday';
            return {
                isAvailable: false,
                type: isSunday ? 'sunday_off' : 'weekly_off',
                badgeText: isSunday ? 'Sun Closed' : 'Closed',
                reason: isSunday
                    ? 'The clinic is closed on Sundays (Weekly Holiday).'
                    : `The clinic is closed on ${weekday.charAt(0).toUpperCase() + weekday.slice(1)}s (Weekly Off).`
            };
        }

        // 2. Doctor custom weekly available days
        const selectedDoc = getSelectedDoctor();
        if (selectedDoc && Array.isArray(selectedDoc.availableDays) && selectedDoc.availableDays.length > 0) {
            const docDays = selectedDoc.availableDays.map(d => d.toLowerCase());
            if (!docDays.includes(weekday)) {
                const shortDay = weekday.slice(0, 3).charAt(0).toUpperCase() + weekday.slice(1, 3);
                return {
                    isAvailable: false,
                    type: 'doctor_weekly_off',
                    badgeText: `No ${shortDay}`,
                    reason: `Dr. ${selectedDoc.name} is not available on ${weekday.charAt(0).toUpperCase() + weekday.slice(1)}s. Available days: ${selectedDoc.availableDays.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ')}.`
                };
            }
        }

        // 3. Clinic-wide holiday
        const checkTime = new Date(date).setHours(12, 0, 0, 0);
        for (const holiday of clinicHolidays) {
            const start = new Date(holiday.startDate).setHours(0, 0, 0, 0);
            const end = new Date(holiday.endDate).setHours(23, 59, 59, 999);
            if (checkTime >= start && checkTime <= end) {
                return {
                    isAvailable: false,
                    type: 'clinic_holiday',
                    badgeText: 'Holiday',
                    title: holiday.title,
                    reason: `Clinic Holiday: ${holiday.title}${holiday.reason ? ` (${holiday.reason})` : ''}`
                };
            }
        }

        // 4. Doctor-specific leave
        if (formData.doctorId) {
            for (const leave of doctorLeaves) {
                const leaveDocId = leave.doctorId?._id || leave.doctorId;
                if (leaveDocId && leaveDocId.toString() === formData.doctorId.toString()) {
                    const start = new Date(leave.startDate).setHours(0, 0, 0, 0);
                    const end = new Date(leave.endDate).setHours(23, 59, 59, 999);
                    if (checkTime >= start && checkTime <= end) {
                        return {
                            isAvailable: false,
                            type: 'doctor_leave',
                            badgeText: 'On Leave',
                            title: leave.title,
                            reason: `Dr. ${selectedDoc?.name || 'Specialist'} is on leave on this date: "${leave.title}"${leave.reason ? ` (${leave.reason})` : ''}`
                        };
                    }
                }
            }
        }

        // 5. Doctor is LIVE on walk-in queue — block all dates in the live range
        if (selectedDoc && selectedDoc.isAvailable === false) {
            const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0);
            const checkDay = new Date(date); checkDay.setHours(0, 0, 0, 0);
            const liveEnd = selectedDoc.liveUntilDate
                ? (() => { const d = new Date(selectedDoc.liveUntilDate); d.setHours(23,59,59,999); return d; })()
                : (() => { const d = new Date(todayMidnight); d.setHours(23,59,59,999); return d; })();
            if (checkDay >= todayMidnight && checkDay <= liveEnd) {
                const untilLabel = selectedDoc.liveUntilDate
                    ? new Date(selectedDoc.liveUntilDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : null;
                return {
                    isAvailable: false,
                    type: 'doctor_live',
                    badgeText: untilLabel ? `Live→${untilLabel}` : 'Live',
                    reason: untilLabel
                        ? `Dr. ${selectedDoc.name} is on live walk-in queue until ${untilLabel}. Book after that date.`
                        : `Dr. ${selectedDoc.name} is handling live walk-in patients today. Please book for a future date.`
                };
            }
        }

        return { isAvailable: true };
    }, [getSelectedClinic, getSelectedDoctor, clinicHolidays, doctorLeaves, formData.doctorId]);

    const getClinicTimingConfig = useCallback(() => {
        const selectedClinic = clinics.find(c => c._id === formData.clinicId) || {};
        return {
            openingTime: selectedClinic.openingTime || '09:00',
            closingTime: selectedClinic.closingTime || '17:00',
            breakStartTime: selectedClinic.breakStartTime || '12:00',
            breakEndTime: selectedClinic.breakEndTime || '14:00',
            slotDurationMinutes: Number(selectedClinic.slotDurationMinutes || 30),
            workingDays: selectedClinic.workingDays?.length ? selectedClinic.workingDays : DEFAULT_WORKING_DAYS
        };
    }, [clinics, formData.clinicId]);

    const fetchBookedSlots = useCallback(async () => {
        if (!formData.clinicId || !formData.doctorId) return;
        try {
            const startStr = selectedDate.toISOString().split('T')[0];
            const res = await axios.get(
                `${API_URL}/api/clinic/public/booked-slots/${formData.clinicId}/${formData.doctorId}`,
                { params: { startDate: startStr, endDate: startStr } }
            );

            if (res.data.success) {
                const bookedTimeSlots = res.data.data.map(slot => toLocalDateTimeKey(slot.appointmentDate || slot.timeSlot));
                setBookedSlots(bookedTimeSlots);
                return bookedTimeSlots;
            }
            return [];
        } catch {
            setBookedSlots([]);
            return [];
        }
    }, [formData.clinicId, formData.doctorId, selectedDate]);

    useEffect(() => {
        let active = true;
        if (formData.doctorId && step === 3) {
            Promise.resolve().then(() => {
                if (active) fetchBookedSlots();
            });
        }
        return () => { active = false; };
    }, [formData.doctorId, selectedDate, step, fetchBookedSlots]);

    const generateAvailableSlots = useCallback(() => {
        const slots = [];
        const { openingTime, closingTime, breakStartTime, breakEndTime, slotDurationMinutes, workingDays } = getClinicTimingConfig();

        const [openHour, openMinute] = openingTime.split(':').map(Number);
        const [closeHour, closeMinute] = closingTime.split(':').map(Number);
        const [breakStartHour, breakStartMinute] = breakStartTime.split(':').map(Number);
        const [breakEndHour, breakEndMinute] = breakEndTime.split(':').map(Number);

        const currentDay = WEEKDAY_MAP[selectedDate.getDay()];
        if (!workingDays.includes(currentDay) || !getDateAvailability(selectedDate).isAvailable) {
            setAvailableSlots([]);
            return;
        }

        const start = new Date(selectedDate);
        start.setHours(openHour, openMinute, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(closeHour, closeMinute, 0, 0);
        const breakStart = new Date(selectedDate);
        breakStart.setHours(breakStartHour, breakStartMinute, 0, 0);
        const breakEnd = new Date(selectedDate);
        breakEnd.setHours(breakEndHour, breakEndMinute, 0, 0);

        const finalDuration = formData.slotMode === 'quick' ? 60 : slotDurationMinutes;
        const now = new Date();

        for (let slot = new Date(start); slot < end; slot = new Date(slot.getTime() + finalDuration * 60000)) {
            if (slot >= breakStart && slot < breakEnd) continue;
            // Filter out past slots for today
            if (selectedDate.toDateString() === now.toDateString() && slot < now) continue;
            const slotKey = toLocalDateTimeKey(slot);
            if (bookedSlots.includes(slotKey)) continue;
            slots.push(new Date(slot));
        }
        setAvailableSlots(slots);
    }, [bookedSlots, getClinicTimingConfig, selectedDate, formData.slotMode, getDateAvailability]);

    useEffect(() => {
        let active = true;
        if (formData.clinicId && formData.doctorId && step === 3) {
            Promise.resolve().then(() => {
                if (active) generateAvailableSlots();
            });
        }
        return () => { active = false; };
    }, [formData.clinicId, formData.doctorId, bookedSlots, selectedDate, step, generateAvailableSlots]);

    // AI Wait Prediction (Dynamic from API)
    useEffect(() => {
        if (formData.clinicId && formData.doctorId) {
            const fetchWaitTime = async () => {
                try {
                    const params = {
                        clinicId: formData.clinicId,
                        doctorId: formData.doctorId,
                        visitType: formData.appointmentType
                    };
                    if (formData.appointmentDate) {
                        params.appointmentDate = formData.appointmentDate;
                        if (formData.appointmentDate.includes('T')) {
                            params.appointmentTime = formData.appointmentDate.split('T')[1];
                        }
                    } else {
                        params.appointmentDate = selectedDate.toISOString();
                    }
                    const res = await axios.get(`${API_URL}/api/queue/public/estimate-wait`, { params });
                    if (res.data.success) {
                        setEstimatedWaitTime(res.data.estimatedWait);
                    }
                } catch (error) {
                    console.error("Wait time estimation failed", error);
                    // Fallback to experience-based estimate if API fails
                    const doc = getSelectedDoctor();
                    const baseWait = doc?.experience ? Math.max(10, 30 - doc.experience) : 15;
                    setEstimatedWaitTime(baseWait);
                }
            };
            fetchWaitTime();
        }
    }, [formData.clinicId, formData.doctorId, formData.appointmentType, formData.appointmentDate, selectedDate, getSelectedDoctor]);

    // 🔒 Hold Slot & Proceed to Step 4
    const handleHoldSlotAndProceed = async (e) => {
        if (e) e.stopPropagation();
        if (!formData.appointmentDate) {
            setError('Please pick an appointment slot first.');
            return;
        }

        const datePart = formData.appointmentDate.split('T')[0];
        const [y, m, d] = datePart.split('-').map(Number);
        const targetDate = new Date(y, m - 1, d);
        const dateAvail = getDateAvailability(targetDate);
        if (!dateAvail.isAvailable) {
            setError(`Cannot book appointment: ${dateAvail.reason}`);
            Swal.fire({
                icon: 'error',
                title: 'Date Unavailable',
                text: dateAvail.reason,
                confirmButtonColor: '#0D9488'
            });
            return;
        }

        const timePart = formData.appointmentDate.split('T')[1];
        setIsHoldingSlot(true);
        setError(null);

        try {
            const res = await axios.post(`${API_URL}/api/slots/hold`, {
                clinicId: formData.clinicId,
                doctorId: formData.doctorId,
                slotDate: datePart,
                slotTime: timePart
            });

            if (res.data.success) {
                setHoldToken(res.data.holdToken);
                setHoldTimeRemaining(600); // 10 minutes

                // If user is already logged in, fetch saved family profiles
                const currentToken = localStorage.getItem('token');
                if (currentToken) {
                    try {
                        const famRes = await axios.get(`${API_URL}/api/auth/patient/family-members`, {
                            headers: { Authorization: `Bearer ${currentToken}` }
                        });
                        if (famRes.data.success) {
                            setFamilyMembers(famRes.data.familyMembers || []);
                            setPrimaryPatient(famRes.data.primary || null);
                        }
                    } catch (famErr) {
                        console.warn("Could not load family members:", famErr.message);
                    }
                }

                setStep(4);
            }
        } catch (holdErr) {
            const msg = holdErr.response?.data?.message || 'This slot is temporarily held or booked. Please select another slot.';
            setError(msg);
            Swal.fire({
                icon: 'warning',
                title: 'Slot Unavailable',
                text: msg,
                confirmButtonColor: '#0D9488'
            });
            fetchBookedSlots();
        } finally {
            setIsHoldingSlot(false);
        }
    };

    const releaseSlotHold = useCallback(async (tokenToRelease) => {
        const token = tokenToRelease || holdToken;
        if (!token) return;
        try {
            await axios.post(`${API_URL}/api/slots/release`, { holdToken: token });
        } catch (e) {
            console.warn("Slot release error:", e.message);
        }
        setHoldToken(null);
        setHoldTimeRemaining(0);
    }, [holdToken]);

    // Cleanup hold on unmount
    useEffect(() => {
        return () => {
            if (holdToken) {
                axios.post(`${API_URL}/api/slots/release`, { holdToken }).catch(() => {});
            }
        };
    }, [holdToken]);

    // Timer countdown for slot reservation
    useEffect(() => {
        let timer = null;
        if (holdToken && step === 4 && holdTimeRemaining > 0) {
            timer = setInterval(() => {
                setHoldTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        Swal.fire({
                            icon: 'info',
                            title: 'Slot Reservation Expired',
                            text: 'Your 10-minute temporary slot hold has expired. Please select a time slot again.',
                            confirmButtonColor: '#0D9488'
                        }).then(() => {
                            setHoldToken(null);
                            setStep(3);
                            fetchBookedSlots();
                        });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [holdToken, step, holdTimeRemaining, fetchBookedSlots]);

    const formatRemainingTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // 🔐 Inline Auth: Check Phone Number
    const handleCheckPhone = async () => {
        setAuthError(null);
        const { isValid, normalized, error: phoneErr } = normalizeIndianPhone(authPhone);
        if (!isValid) {
            setAuthError(phoneErr);
            return;
        }

        setAuthLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/patient/send-otp`, {
                phone: normalized,
                isRegistration: true
            });

            if (res.data.success) {
                setAuthMode('signup');
                setOtpCountdown(30);
            }
        } catch (err) {
            if (err.response?.data?.isDuplicate) {
                setAuthMode('login');
            } else {
                setAuthError(err.response?.data?.message || 'Failed to verify phone number.');
            }
        } finally {
            setAuthLoading(false);
        }
    };

    // 🔐 Inline Auth: Login with Password
    const handleInlineLogin = async () => {
        setAuthError(null);
        if (!authPassword) {
            setAuthError('Please enter your password.');
            return;
        }

        const { isValid, normalized } = normalizeIndianPhone(authPhone);
        if (!isValid) {
            setAuthError('Invalid phone number.');
            return;
        }

        setAuthLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/patient/login-with-password`, {
                phone: normalized,
                password: authPassword
            });

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                setIsLoggedIn(true);
                setPrimaryPatient(res.data.patient);

                // Fetch family members
                try {
                    const famRes = await axios.get(`${API_URL}/api/auth/patient/family-members`, {
                        headers: { Authorization: `Bearer ${res.data.token}` }
                    });
                    if (famRes.data.success) {
                        setFamilyMembers(famRes.data.familyMembers || []);
                    }
                } catch (famFetchErr) {
                    console.warn("Could not load family members:", famFetchErr.message);
                }
            }
        } catch (err) {
            setAuthError(err.response?.data?.message || 'Invalid password. Please try again.');
        } finally {
            setAuthLoading(false);
        }
    };

    // 🔐 Inline Auth: Register with OTP & Password
    const handleInlineSignup = async () => {
        setAuthError(null);
        if (!authName.trim()) {
            setAuthError('Please enter your full name.');
            return;
        }
        if (!authOtp || authOtp.length !== 6) {
            setAuthError('Please enter the 6-digit OTP sent to your phone.');
            return;
        }
        if (!authPassword || authPassword.length < 8) {
            setAuthError('Password must be at least 8 characters long for security.');
            return;
        }
        if (!authConsentAgreed) {
            setAuthError('You must agree to the Terms of Service & Privacy Policy to proceed.');
            return;
        }

        const { isValid, normalized } = normalizeIndianPhone(authPhone);
        if (!isValid) {
            setAuthError('Invalid phone number.');
            return;
        }

        setAuthLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/patient/register-with-otp-password`, {
                phone: normalized,
                otp: authOtp,
                name: authName.trim(),
                age: authAge ? parseInt(authAge) : undefined,
                gender: authGender,
                password: authPassword,
                whatsappOptIn: authWhatsappOptIn,
                consentVersion: 'v1.0'
            });

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                setIsLoggedIn(true);
                setPrimaryPatient(res.data.patient);
            }
        } catch (err) {
            setAuthError(err.response?.data?.message || 'Registration failed. Please check your OTP.');
        } finally {
            setAuthLoading(false);
        }
    };

    // OTP Countdown effect
    useEffect(() => {
        let timer = null;
        if (otpCountdown > 0) {
            timer = setInterval(() => setOtpCountdown(prev => prev - 1), 1000);
        }
        return () => { if (timer) clearInterval(timer); };
    }, [otpCountdown]);

    // Resend OTP
    const handleResendOTP = async () => {
        const { isValid, normalized } = normalizeIndianPhone(authPhone);
        if (!isValid) return;
        try {
            await axios.post(`${API_URL}/api/auth/patient/send-otp`, { phone: normalized, isRegistration: true });
            setOtpCountdown(30);
            Swal.fire({
                icon: 'success',
                title: 'OTP Sent',
                text: 'A new 6-digit verification code has been sent to your phone.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            setAuthError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
        }
    };

    // 📋 Final Confirmation & Submission
    const handleConfirmBooking = async () => {
        if (!formData.appointmentDate) { setError('Selection required: Please pick a clinical slot.'); return; }
        if (!formData.reason.trim()) { setError('Required: Please state the purpose of your visit.'); return; }

        let token = localStorage.getItem('token');
        if (!token) {
            setError('Please sign in or complete registration above to confirm your booking.');
            return;
        }

        const datePart = formData.appointmentDate.split('T')[0];
        const [y, m, d] = datePart.split('-').map(Number);
        const targetDate = new Date(y, m - 1, d);
        const dateAvail = getDateAvailability(targetDate);
        if (!dateAvail.isAvailable) {
            setError(`Cannot book appointment: ${dateAvail.reason}`);
            Swal.fire({
                icon: 'error',
                title: 'Date Unavailable',
                text: dateAvail.reason,
                confirmButtonColor: '#0D9488'
            });
            return;
        }

        setLoading(true);
        setError(null);
        try {
            let patientMemberId = undefined;

            // Handle family member selection or creation
            if (selectedFor === 'family' && selectedFamilyMemberId) {
                patientMemberId = selectedFamilyMemberId;
            } else if (selectedFor === 'new_family') {
                if (!newMember.name.trim()) {
                    setError('Please enter the family member name.');
                    setLoading(false);
                    return;
                }
                const isMinor = Boolean(newMember.age && parseInt(newMember.age) < 18);
                if (isMinor && !newMember.guardianConsent) {
                    setError('Lawful guardian declaration is required for individuals under 18 years of age (DPDP Act).');
                    setLoading(false);
                    return;
                }

                // Persist new family member to user account
                const famCreateRes = await axios.post(`${API_URL}/api/auth/patient/family-members`, {
                    name: newMember.name.trim(),
                    relationship: newMember.relationship,
                    age: newMember.age ? parseInt(newMember.age) : undefined,
                    gender: newMember.gender,
                    guardianConsent: newMember.guardianConsent
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (famCreateRes.data.success) {
                    patientMemberId = famCreateRes.data.member._id;
                }
            }

            const res = await axios.post(
                `${API_URL}/api/auth/patient/book-appointment`,
                {
                    clinicId: formData.clinicId,
                    doctorId: formData.doctorId,
                    appointmentDate: formData.appointmentDate,
                    appointmentType: formData.appointmentType,
                    reason: formData.reason,
                    rescheduleAppointmentId: formData.rescheduleAppointmentId,
                    patientMemberId,
                    holdToken
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                // GA4 Event Tracking
                trackEvent('appointment_booked', {
                    clinic_id: formData.clinicId,
                    doctor_id: formData.doctorId
                });

                if (res.data.isFirstAppointment) {
                    trackEvent('clinic_first_appointment', {
                        clinic_id: formData.clinicId
                    });
                }

                setHoldToken(null);

                Swal.fire({
                    icon: 'success',
                    title: formData.rescheduleAppointmentId ? 'Reschedule Submitted!' : 'Booking Confirmed!',
                    text: formData.rescheduleAppointmentId
                        ? 'Your reschedule request has been submitted to the receptionist for confirmation.'
                        : 'Your appointment request has been submitted. The receptionist will verify and confirm shortly.',
                    background: '#F8FAFC',
                    confirmButtonColor: '#0D9488',
                    customClass: {
                        popup: 'rounded-[2rem]',
                        confirmButton: 'rounded-xl px-10 py-3 font-semibold text-sm'
                    }
                }).then(() => navigate('/patient/dashboard?tab=appointments'));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'The clinical server encountered an error.');
        } finally {
            setLoading(false);
        }
    };

    const filteredClinics = clinics.filter(c => c.name.toLowerCase().includes(searchClinic.toLowerCase()) || c.address.toLowerCase().includes(searchClinic.toLowerCase()));

    return (
        <div className="px-4 py-4 md:p-6 lg:p-10 max-w-6xl mx-auto w-full">
            <SEO title="Book Appointment" noindex={true} />

            <div className="w-full">
                {/* Header Section */}
                <header className="flex items-center justify-between gap-3 mb-5 md:mb-8 lg:mb-10">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold uppercase tracking-wider border border-teal-100">
                                {rescheduleApp ? (step === 4 ? 'Review Reschedule' : 'Step 1/2 • Pick Date & Slot') : (step === 4 ? 'Final Review' : `Step ${step}/4`)}
                            </span>
                        </div>
                        <h1 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            {rescheduleApp ? 'Reschedule Appointment' : 'Book Appointment'} <span className="text-teal-600 hidden md:inline">.</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-xs mt-0.5 hidden sm:block">
                            {rescheduleApp ? 'Pick a new date and convenient time slot for your consultation.' : 'Schedule your next clinical consultation.'}
                        </p>
                    </div>

                    {step > 1 && (
                        <button
                            onClick={() => {
                                if (rescheduleApp && step === 3) {
                                    navigate('/patient/dashboard');
                                } else {
                                    setStep(step - 1);
                                }
                            }}
                            className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm active:scale-95 font-semibold text-xs shrink-0"
                        >
                            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    )}
                </header>

                {/* Progress Tracker - Responsive */}
                <div className="grid grid-cols-4 gap-1.5 md:gap-4 mb-5 md:mb-12">
                    <StepBar num={1} label="Clinic" active={step >= 1 || !!rescheduleApp} current={step === 1} />
                    <StepBar num={2} label="Doctor" active={step >= 2 || !!rescheduleApp} current={step === 2} />
                    <StepBar num={3} label="Time" active={step >= 3} current={step === 3} />
                    <StepBar num={4} label="Confirm" active={step >= 4} current={step === 4} />
                </div>

                {/* Main Content Area */}
                <main className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {step === 1 && (
                        <div className="space-y-4 md:space-y-10">
                            {/* QR Check-in Banner */}
                            {isFromQr && getSelectedClinic() && (
                                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
                                            <QrCode size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                                                <span>Checked-In via Reception Desk QR</span>
                                                <span className="px-1.5 py-0.5 rounded bg-teal-200 text-teal-800 text-[10px] font-semibold">Live OPD</span>
                                            </p>
                                            <p className="text-xs text-teal-700">Pre-selected: <span className="font-semibold">{getSelectedClinic()?.name}</span></p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setStep(2)} 
                                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto flex items-center gap-1.5"
                                    >
                                        <span>Select Doctor</span>
                                        <ArrowRight size={13} />
                                    </button>
                                </div>
                            )}

                            {/* Search Bar */}
                            <div className="relative group">
                                <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search clinic or city..."
                                    className="w-full pl-12 md:pl-16 pr-4 py-3.5 md:py-6 bg-white border border-slate-100 rounded-2xl md:rounded-3xl outline-none focus:border-teal-500 text-sm md:text-base font-medium shadow-sm transition-all placeholder:text-slate-300"
                                    value={searchClinic}
                                    onChange={(e) => setSearchClinic(e.target.value)}
                                />
                            </div>

                            {/* Clinic Grid — 1 column on mobile, 2 on md, 3 on lg */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                {loading ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-24 md:h-64 bg-slate-50 animate-pulse rounded-2xl md:rounded-[2.5rem]" />)
                                ) : filteredClinics.length > 0 ? (
                                    filteredClinics.map(clinic => (
                                        <button
                                            key={clinic._id}
                                            onClick={() => { setFormData({ ...formData, clinicId: clinic._id }); setStep(2); }}
                                            className="bg-white w-full rounded-2xl md:rounded-[2.5rem] border border-slate-100 text-left hover:border-teal-400 hover:shadow-xl transition-all group relative overflow-hidden active:scale-[0.99]"
                                        >
                                            {/* Mobile: horizontal row layout */}
                                            <div className="md:hidden flex items-center gap-3 p-4">
                                                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500 group-active:bg-teal-600 group-active:text-white transition-all shrink-0">
                                                    <Building2 size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-teal-600 transition-colors">{clinic.name}</h3>
                                                    <p className="text-xs font-normal text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                                        <MapPin size={10} className="text-teal-500 shrink-0" /> {clinic.address}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100">{clinic.doctorCount || '0'} Dr</span>
                                                    <ArrowRight size={16} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                                                </div>
                                            </div>

                                            {/* Desktop: vertical card layout */}
                                            <div className="hidden md:block p-8">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-[4rem] -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                                                <div className="flex justify-between items-start mb-8 relative z-10">
                                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                                                        <Building2 size={28} />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold border border-green-100">
                                                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" /> Available
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3 group-hover:text-teal-600 transition-colors">{clinic.name}</h3>
                                                <div className="space-y-3 mb-8">
                                                    <div className="flex items-start gap-3 text-slate-500 text-sm font-normal">
                                                        <MapPin size={14} className="text-teal-500 shrink-0" /> {clinic.address}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-slate-500 text-sm font-normal">
                                                        <Phone size={14} className="text-teal-500 shrink-0" /> {clinic.contactPhone}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-6 border-t border-slate-50 relative z-10">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-sm font-bold">{clinic.doctorCount || '0'}</span>
                                                        <span className="text-xs font-medium text-slate-500">Specialists</span>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all">
                                                        <ArrowRight size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 md:py-20 text-center">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search size={28} className="text-slate-200" />
                                        </div>
                                        <h3 className="text-base md:text-xl font-bold text-slate-400">No Clinics Found</h3>
                                        <p className="text-xs md:text-sm font-normal text-slate-400 mt-1">Try a different name or city.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 md:space-y-10">
                            {/* Selected clinic banner — fully visible & responsive */}
                            <div className="bg-slate-900 p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl text-white shadow-lg relative overflow-hidden border border-slate-800">
                                <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 rotate-12 hidden md:block pointer-events-none">
                                    <Activity size={180} />
                                </div>
                                <div className="relative z-10 flex flex-col gap-2">
                                    {/* Top Row: Tag + Change Button */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                            <span className="text-[10px] md:text-xs font-bold text-teal-300 uppercase tracking-wider">Facility Confirmed</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setStep(1)} 
                                            className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl text-white font-semibold text-xs uppercase tracking-wider transition-all border border-white/15 shrink-0 cursor-pointer shadow-xs"
                                        >
                                            Change
                                        </button>
                                    </div>

                                    {/* Full Clinic Name - No truncation */}
                                    <h3 className="text-base sm:text-lg md:text-2xl font-bold tracking-tight text-white leading-snug break-words mt-0.5">
                                        {getSelectedClinic()?.name}
                                    </h3>

                                    {/* Full Address - No truncation */}
                                    {getSelectedClinic()?.address && (
                                        <p className="text-slate-300/80 text-xs md:text-sm font-normal flex items-start gap-1.5 leading-relaxed break-words">
                                            <MapPin size={13} className="text-teal-400 shrink-0 mt-0.5" /> 
                                            <span>{getSelectedClinic()?.address}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8">
                                {doctors.map(doctor => {
                                    const onLeave = doctor.isOnLeaveToday;
                                    const isLiveToday = !onLeave && doctor.isAvailable === false;
                                    const liveUntilLabel = isLiveToday && doctor.liveUntilDate
                                        ? new Date(doctor.liveUntilDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                        : null;
                                    const WEEK_DAYS = [
                                        { key: 'monday', label: 'Mon' },
                                        { key: 'tuesday', label: 'Tue' },
                                        { key: 'wednesday', label: 'Wed' },
                                        { key: 'thursday', label: 'Thu' },
                                        { key: 'friday', label: 'Fri' },
                                        { key: 'saturday', label: 'Sat' },
                                        { key: 'sunday', label: 'Sun' }
                                    ];
                                    const docAvailableDays = Array.isArray(doctor.availableDays) && doctor.availableDays.length > 0
                                        ? doctor.availableDays.map(d => d.toLowerCase())
                                        : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                    const docInitial = getDoctorInitial(doctor.name);
                                    const docTitle = formatDocTitle(doctor.name);
                                    return (
                                    <div
                                        key={doctor._id}
                                        className={`bg-white rounded-2xl md:rounded-[2.5rem] border text-left transition-all group flex flex-col ${onLeave ? 'border-orange-200 opacity-90' : isLiveToday ? 'border-red-200 opacity-90' : 'border-slate-100 hover:border-teal-400 hover:shadow-xl'}`}
                                    >
                                        {/* Mobile: compact row */}
                                        <div className="md:hidden flex items-center gap-3 p-4">
                                            <div className="relative shrink-0">
                                                <div className={`w-12 h-12 bg-gradient-to-br rounded-2xl flex items-center justify-center text-xl font-bold transition-all duration-300 shadow-sm ${onLeave ? 'from-orange-100 to-amber-100 text-orange-400' : isLiveToday ? 'from-red-100 to-rose-100 text-red-500' : 'from-slate-100 to-slate-200 text-slate-600 group-hover:from-teal-500 group-hover:to-indigo-600 group-hover:text-white'}`}>
                                                    {docInitial}
                                                </div>
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${onLeave ? 'bg-orange-400' : isLiveToday ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide truncate">{doctor.specialization || 'General'}</p>
                                                <h3 className="text-sm font-bold text-slate-900 truncate">{docTitle}</h3>
                                                <p className="text-xs font-medium text-slate-400 mt-0.5">{doctor.experience || 0} yrs exp</p>
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {WEEK_DAYS.map(d => {
                                                        const isActive = docAvailableDays.includes(d.key);
                                                        return (
                                                            <span
                                                                key={d.key}
                                                                title={isActive ? `${d.label}: Active / Available` : `${d.label}: Not Active / Off`}
                                                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                                                                    isActive
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                                        : 'bg-rose-50 text-rose-600 border-rose-200'
                                                                }`}
                                                            >
                                                                {d.label}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                                {onLeave && (
                                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-semibold border border-orange-200">
                                                        <CalendarOff size={9} /> On Leave Today{doctor.leaveTodayTitle ? `: ${doctor.leaveTodayTitle}` : ''}
                                                    </span>
                                                )}
                                                {isLiveToday && (
                                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-semibold border border-red-200">
                                                        <Zap size={9} className="fill-current" />
                                                        {liveUntilLabel ? `Live until ${liveUntilLabel}` : 'Live Today'}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => { setFormData({ ...formData, doctorId: doctor._id }); setStep(3); }}
                                                className={`px-3 py-2 rounded-xl font-semibold text-xs tracking-wide transition-all active:scale-95 shrink-0 flex items-center gap-1 ${onLeave ? 'bg-orange-50 text-orange-500 hover:bg-orange-100 border border-orange-200' : isLiveToday ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200' : 'bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white'}`}
                                            >
                                                {onLeave ? 'Future >' : isLiveToday ? 'Future >' : <>Pick <ArrowRight size={12} /></>}
                                            </button>
                                        </div>

                                        {/* Desktop: full card */}
                                        <div className="hidden md:flex flex-col flex-1 p-8">
                                            <div>
                                                <div className="flex items-start gap-6 mb-6">
                                                    <div className="relative shrink-0">
                                                        <div className={`w-20 h-20 bg-gradient-to-br rounded-[2rem] flex items-center justify-center text-2xl font-bold transition-all duration-500 shadow-xl ${onLeave ? 'from-orange-100 to-amber-100 text-orange-400' : isLiveToday ? 'from-red-100 to-rose-100 text-red-500' : 'from-slate-100 to-slate-200 text-slate-500 group-hover:from-teal-500 group-hover:to-indigo-600 group-hover:text-white group-hover:rotate-6'}`}>
                                                            {docInitial}
                                                        </div>
                                                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full ${onLeave ? 'bg-orange-400' : isLiveToday ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'}`} />
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider">{doctor.specialization || 'General Practitioner'}</p>
                                                            {onLeave && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold border border-orange-200 uppercase tracking-wide">
                                                                    <CalendarOff size={9} /> On Leave Today
                                                                </span>
                                                            )}
                                                            {isLiveToday && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold border border-red-200 uppercase tracking-wide">
                                                                    <Zap size={9} className="fill-current" />
                                                                    {liveUntilLabel ? `Live until ${liveUntilLabel}` : 'Live Today'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {WEEK_DAYS.map(d => {
                                                                const isActive = docAvailableDays.includes(d.key);
                                                                return (
                                                                    <span
                                                                        key={d.key}
                                                                        title={isActive ? `${d.label}: Active / Available` : `${d.label}: Not Active / Off`}
                                                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                                                                            isActive
                                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                                                : 'bg-rose-50 text-rose-600 border-rose-200'
                                                                        }`}
                                                                    >
                                                                        {d.label}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight truncate">{docTitle}</h3>
                                                        {doctor.education && (
                                                            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                                                                <GraduationCap size={14} className="text-teal-500 shrink-0" /> {doctor.education}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {onLeave && (
                                                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 mb-6 text-sm text-orange-700 font-medium">
                                                        <CalendarOff size={15} className="shrink-0 text-orange-400" />
                                                        <span>
                                                            Not available today{doctor.leaveTodayTitle ? ` — ${doctor.leaveTodayTitle}` : ''}. You can still book for a future date.
                                                        </span>
                                                    </div>
                                                )}
                                                {isLiveToday && (
                                                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-6 text-sm text-red-700 font-medium">
                                                        <Zap size={15} className="shrink-0 text-red-400 fill-current" />
                                                        <span>
                                                            {liveUntilLabel
                                                                ? `On live walk-in queue until ${liveUntilLabel}. Appointments are blocked for this period — book after that date.`
                                                                : `Currently seeing walk-in patients live today. Today's slots are unavailable — book for a future date.`}
                                                        </span>
                                                    </div>
                                                )}

                                                {doctor.bio && (
                                                    <p className="text-sm text-slate-600 italic line-clamp-2 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100/50 mb-6">
                                                        &ldquo;{doctor.bio}&rdquo;
                                                    </p>
                                                )}

                                                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500 mb-6">
                                                    <div className="flex items-center gap-1.5 bg-slate-50/50 px-3.5 py-2 rounded-xl border border-slate-100/20">
                                                        <Briefcase size={13} className="text-teal-500" /> {doctor.experience || 0} Yrs Exp
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border ${onLeave ? 'bg-orange-50/50 border-orange-100/20 text-orange-500' : isLiveToday ? 'bg-red-50/50 border-red-100/20 text-red-500' : 'bg-slate-50/50 border-slate-100/20'}`}>
                                                        <Clock size={13} className={onLeave ? 'text-orange-400' : isLiveToday ? 'text-red-400' : 'text-teal-500'} />
                                                        {onLeave ? 'On Leave' : isLiveToday ? 'Live Queue' : 'Active'}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => { setFormData({ ...formData, doctorId: doctor._id }); setStep(3); }}
                                                className={`w-full py-4 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 ${onLeave ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200' : isLiveToday ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white'}`}
                                            >
                                                {onLeave ? <><CalendarOff size={15} /> Book for Future Date</> : isLiveToday ? <><Zap size={15} className="fill-current" /> Book for Future Date</> : <>Select Doctor <ArrowRight size={16} /></>}
                                            </button>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-5">

                            {/* Reschedule Overview Card */}
                            {formData.rescheduleAppointmentId && (
                                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-5 md:p-6 rounded-3xl text-white shadow-xl border border-teal-500/20 relative overflow-hidden animate-in fade-in duration-300">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                        <Calendar size={120} />
                                    </div>
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-teal-300 text-xs font-semibold uppercase tracking-wider">
                                                <Clock size={12} className="animate-pulse" /> Rescheduling Appointment
                                            </div>
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                                                    {getSelectedClinic()?.name || 'Clinic Consultation'}
                                                </h3>
                                                <p className="text-teal-300 text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                                                    <Stethoscope size={15} />
                                                    {formatDocTitle(getSelectedDoctor()?.name)}
                                                    {getSelectedDoctor()?.specialization && (
                                                        <span className="text-xs text-slate-400 font-medium">• {getSelectedDoctor()?.specialization}</span>
                                                    )}
                                                </p>
                                            </div>
                                            {rescheduleApp?.appointmentDate && (
                                                <p className="text-xs text-slate-400 font-medium">
                                                    Original Date: <span className="text-slate-300 font-semibold">{new Date(rescheduleApp.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 self-start md:self-center">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 transition-all active:scale-95"
                                            >
                                                Change Clinic/Dr
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ─── DOCTOR WEEKLY SCHEDULE BANNER ─── */}
                            {(() => {
                                const doc = getSelectedDoctor();
                                if (!doc || !Array.isArray(doc.availableDays) || doc.availableDays.length === 0 || doc.availableDays.length >= 7) return null;
                                const ALL_DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                                const DAY_3 = d => d.charAt(0).toUpperCase() + d.slice(1, 3);
                                return (
                                    <div className="bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                                            <Calendar size={15} className="text-teal-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-teal-800 mb-1.5">{formatDocTitle(doc.name)}'s Weekly Schedule</p>
                                            <div className="flex flex-wrap gap-1">
                                                {ALL_DAYS.map(d => {
                                                    const avail = doc.availableDays.map(x => x.toLowerCase()).includes(d);
                                                    return (
                                                        <span key={d} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                                            avail
                                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                                                : 'bg-rose-50 text-rose-600 border-rose-200'
                                                        }`}>
                                                            {DAY_3(d)}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-600 font-semibold shrink-0 hidden sm:block leading-tight">
                                            <span className="text-emerald-700 font-bold">Green</span>: Available<br />
                                            <span className="text-rose-600 font-bold">Red</span>: Closed
                                        </p>
                                    </div>
                                );
                            })()}

                            {/* ─── DATE SELECTION ─── */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                                            <CalendarDays size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">Choose New Date</h3>
                                            <p className="text-xs font-medium text-slate-400">
                                                Selected: {selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-100 cursor-pointer flex items-center gap-1.5 transition-colors">
                                            <Calendar size={13} />
                                            <span>Pick Date</span>
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                className="sr-only"
                                                value={selectedDate.toISOString().split('T')[0]}
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        const [y, m, d] = e.target.value.split('-').map(Number);
                                                        const newD = new Date(y, m - 1, d);
                                                        setSelectedDate(newD);
                                                        setFormData(prev => ({ ...prev, appointmentDate: '' }));
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Date Strip – tight, scrollable with availability badges */}
                                <div className="flex gap-2.5 overflow-x-auto px-5 pb-5 no-scrollbar">
                                    {dateStrip.map((date, idx) => {
                                        const isSelected = selectedDate.toDateString() === date.toDateString();
                                        const dateAvail = getDateAvailability(date);
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => { setSelectedDate(date); setFormData({ ...formData, appointmentDate: '' }); }}
                                                className={`relative flex flex-col items-center shrink-0 min-w-[62px] py-2.5 px-1 rounded-2xl border-2 transition-all ${isSelected
                                                    ? (dateAvail.isAvailable
                                                        ? 'border-teal-500 bg-teal-600 text-white shadow-lg shadow-teal-500/25 scale-105'
                                                        : 'border-rose-500 bg-rose-600 text-white shadow-lg shadow-rose-500/25 scale-105')
                                                    : (!dateAvail.isAvailable
                                                        ? 'border-rose-100 bg-rose-50/50 text-rose-500 hover:border-rose-300'
                                                        : 'border-slate-100 bg-slate-50/60 text-slate-500 hover:border-teal-200 hover:bg-white')
                                                    }`}
                                            >
                                                <span className={`text-[11px] font-semibold mb-0.5 ${isSelected ? (dateAvail.isAvailable ? 'text-teal-100' : 'text-rose-100') : (!dateAvail.isAvailable ? 'text-rose-400' : 'text-slate-400')}`}>
                                                    {idx === 0 ? 'Today' : WEEKDAY_MAP[date.getDay()].slice(0, 3)}
                                                </span>
                                                <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                                                {!dateAvail.isAvailable && (
                                                    <span className={`mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded leading-none whitespace-nowrap ${
                                                        isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                                                    }`}>
                                                        {dateAvail.badgeText}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Unavailable Alert Banner for Selected Date */}
                                {(() => {
                                    const selectedAvail = getDateAvailability(selectedDate);
                                    if (!selectedAvail.isAvailable) {
                                        return (
                                            <div className="mx-5 mb-5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center gap-3 text-rose-700 animate-in fade-in duration-200">
                                                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
                                                    <CalendarOff size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-bold leading-tight">Bookings Closed on this Date</p>
                                                        <span className="text-[10px] uppercase font-black px-1.5 py-0.5 bg-rose-200/70 rounded text-rose-800">
                                                            {selectedAvail.badgeText}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-rose-600/90 mt-0.5 leading-snug">{selectedAvail.reason}</p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            {/* ─── SLOT SELECTION ─── */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                {(() => {
                                    const selectedAvail = getDateAvailability(selectedDate);
                                    if (!selectedAvail.isAvailable) {
                                        return (
                                            <div className="p-8 text-center bg-rose-50/30">
                                                <div className="w-14 h-14 mx-auto mb-3 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
                                                    <CalendarOff size={26} />
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-800">
                                                    {selectedAvail.type === 'weekly_off' ? 'Weekly Closed Day' :
                                                     selectedAvail.type === 'doctor_weekly_off' ? 'Specialist Weekly Off' :
                                                     selectedAvail.type === 'clinic_holiday' ? 'Clinic Holiday / Festival Closure' : 'Specialist on Leave'}
                                                </h4>
                                                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                                                    {selectedAvail.reason}. Please select another date from the calendar strip above to view open slots.
                                                </p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <>
                                            {/* Header + Mode Toggle */}
                                            <div className="px-5 pt-5 pb-3">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                                                            <Clock size={16} />
                                                        </div>
                                                        <h3 className="text-sm font-bold text-slate-900">Select Time Slot</h3>
                                                    </div>
                                                </div>
                                                {/* Slot Mode Tabs */}
                                                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 gap-1">
                                                    {[['quick', 'Hourly Slots'], ['shift', 'Shift Booking'], ['manual', 'Custom Time']].map(([mode, label]) => (
                                                        <button
                                                            key={mode}
                                                            onClick={() => setFormData({ ...formData, slotMode: mode, appointmentDate: '' })}
                                                            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${formData.slotMode === mode
                                                                ? 'bg-white text-teal-600 shadow-sm border border-slate-100'
                                                                : 'text-slate-400'
                                                                }`}
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Slot Grid – quick mode */}
                                            {formData.slotMode === 'quick' && (
                                                <div className="px-5 pb-5">
                                                    {availableSlots.length > 0 ? (
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                                                            {availableSlots.map((slot, idx) => {
                                                                const slotKey = toLocalDateTimeKey(slot);
                                                                const isActive = formData.appointmentDate === slotKey;
                                                                return (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => setFormData({ ...formData, appointmentDate: slotKey })}
                                                                        className={`py-3 px-2 rounded-xl border-2 transition-all text-center ${isActive
                                                                            ? 'border-teal-500 bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                                                                            : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-teal-200 hover:bg-white'
                                                                            }`}
                                                                    >
                                                                        <div className="text-sm font-bold tracking-tight leading-none">
                                                                            {slot.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                                                            <p className="text-slate-400 font-medium text-xs">No availability on this date</p>
                                                            <p className="text-xs text-slate-400 mt-1">Try another date from the strip above.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Shift Mode */}
                                            {formData.slotMode === 'shift' && (
                                                <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {/* Morning */}
                                                    <button
                                                        disabled={(() => {
                                                            const now = new Date();
                                                            if (selectedDate.toDateString() !== now.toDateString()) return false;
                                                            const [bh, bm] = getClinicTimingConfig().breakStartTime.split(':').map(Number);
                                                            const breakStart = new Date(selectedDate);
                                                            breakStart.setHours(bh, bm, 0, 0);
                                                            return now >= breakStart;
                                                        })()}
                                                        onClick={() => {
                                                            const { openingTime } = getClinicTimingConfig();
                                                            const slotKey = `${selectedDate.toISOString().split('T')[0]}T${openingTime}`;
                                                            setFormData({ ...formData, appointmentDate: slotKey });
                                                        }}
                                                        className={`p-5 rounded-2xl border-2 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed ${formData.appointmentDate.endsWith(getClinicTimingConfig().openingTime)
                                                            ? 'border-teal-500 bg-teal-600 text-white shadow-lg'
                                                            : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:border-teal-200 hover:bg-white'
                                                            }`}
                                                    >
                                                        <h4 className="text-sm font-bold mb-1">Morning Shift</h4>
                                                        <p className={`text-xs font-medium ${formData.appointmentDate.endsWith(getClinicTimingConfig().openingTime) ? 'text-teal-100' : 'text-slate-400'}`}>
                                                            {getClinicTimingConfig().openingTime} - {getClinicTimingConfig().breakStartTime}
                                                        </p>
                                                    </button>

                                                    {/* Afternoon */}
                                                    <button
                                                        disabled={(() => {
                                                            const now = new Date();
                                                            if (selectedDate.toDateString() !== now.toDateString()) return false;
                                                            const [ch, cm] = getClinicTimingConfig().closingTime.split(':').map(Number);
                                                            const closeTime = new Date(selectedDate);
                                                            closeTime.setHours(ch, cm, 0, 0);
                                                            return now >= closeTime;
                                                        })()}
                                                        onClick={() => {
                                                            const { breakEndTime } = getClinicTimingConfig();
                                                            const slotKey = `${selectedDate.toISOString().split('T')[0]}T${breakEndTime}`;
                                                            setFormData({ ...formData, appointmentDate: slotKey });
                                                        }}
                                                        className={`p-5 rounded-2xl border-2 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed ${formData.appointmentDate.endsWith(getClinicTimingConfig().breakEndTime)
                                                            ? 'border-teal-500 bg-teal-600 text-white shadow-lg'
                                                            : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:border-teal-200 hover:bg-white'
                                                            }`}
                                                    >
                                                        <h4 className="text-sm font-bold mb-1">Afternoon Shift</h4>
                                                        <p className={`text-xs font-medium ${formData.appointmentDate.endsWith(getClinicTimingConfig().breakEndTime) ? 'text-teal-100' : 'text-slate-400'}`}>
                                                            {getClinicTimingConfig().breakEndTime} - {getClinicTimingConfig().closingTime}
                                                        </p>
                                                    </button>
                                                </div>
                                            )}

                                            {/* Custom Time */}
                                            {formData.slotMode === 'manual' && (
                                                <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-slate-500 ml-1">Selected Date</label>
                                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-900 text-sm flex items-center justify-between">
                                                            {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            <Calendar size={16} className="text-teal-500" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-slate-500 ml-1">Select Time</label>
                                                        <input
                                                            type="time"
                                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-teal-500 font-semibold text-slate-900 text-sm"
                                                            value={formData.appointmentDate.split('T')[1] || '10:00'}
                                                            onChange={(e) => setFormData({ ...formData, appointmentDate: `${selectedDate.toISOString().split('T')[0]}T${e.target.value}` })}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            {/* ─── WAIT INTELLIGENCE + VERIFY BOOKING ─── */}
                            <div
                                onClick={() => {
                                    Swal.fire({
                                        title: 'Predictive Wait Intelligence 🧠',
                                        html: `
                                            <div class="text-left space-y-4 text-slate-600 font-sans mt-4">
                                                <p>This estimate is dynamically computed using Appointory's AI Engine based on:</p>
                                                <ul class="list-disc pl-5 space-y-2 text-[14px]">
                                                    <li>Doctor's average consultation duration.</li>
                                                    <li>Today's active queue load &amp; scheduling density.</li>
                                                    <li>Statistical delay factor (~14 min per ahead patient).</li>
                                                </ul>
                                                <div class="p-4 bg-teal-50 rounded-2xl border border-teal-100 mt-6 text-center">
                                                    <p class="text-teal-700 font-bold text-sm">Estimated Waiting: ~${estimatedWaitTime || 15} mins</p>
                                                </div>
                                            </div>
                                        `,
                                        confirmButtonColor: '#0D9488',
                                        confirmButtonText: 'Understood',
                                        customClass: {
                                            popup: 'rounded-[2rem]',
                                            confirmButton: 'rounded-xl px-10 py-3 font-semibold text-sm'
                                        }
                                    });
                                }}
                                className="bg-slate-900 rounded-2xl overflow-hidden cursor-pointer hover:bg-slate-800 active:scale-[0.99] transition-all"
                            >
                                {/* Wait Info Row */}
                                <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-teal-400 shrink-0">
                                        <Activity size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Predictive Wait Intelligence</p>
                                        <p className="text-white font-bold text-base tracking-tight mt-0.5">
                                            Est. Wait: <span className="text-teal-300">{estimatedWaitTime || 15} Mins</span>
                                        </p>
                                    </div>
                                    <ChevronRight size={16} className="text-white/30 shrink-0" />
                                </div>

                                {/* Verify Booking Button */}
                                {(() => {
                                    let isValid = false;
                                    let errorMsg = '';
                                    const selectedAvail = getDateAvailability(selectedDate);

                                    if (!selectedAvail.isAvailable) {
                                        errorMsg = selectedAvail.badgeText || 'Date Closed';
                                    } else if (formData.appointmentDate) {
                                        const parts = formData.appointmentDate.split('T');
                                        if (parts.length === 2) {
                                            const [year, month, day] = parts[0].split('-').map(Number);
                                            const [hour, min] = parts[1].split(':').map(Number);
                                            const selectedDateTime = new Date(year, month - 1, day, hour, min);
                                            if (selectedDateTime < new Date()) {
                                                errorMsg = 'Time has passed';
                                            } else {
                                                const { closingTime, openingTime } = getClinicTimingConfig();
                                                const [ch, cm] = closingTime.split(':').map(Number);
                                                const [oh, om] = openingTime.split(':').map(Number);
                                                const closeDateTime = new Date(year, month - 1, day, ch, cm);
                                                const openDateTime = new Date(year, month - 1, day, oh, om);
                                                if (selectedDateTime > closeDateTime) { errorMsg = 'Clinic Closed'; }
                                                else if (selectedDateTime < openDateTime) { errorMsg = 'Before Clinic Opens'; }
                                                else { isValid = true; }
                                            }
                                        }
                                    }
                                    return (
                                        <button
                                            onClick={(e) => handleHoldSlotAndProceed(e)}
                                            disabled={!isValid || isHoldingSlot}
                                            className="w-full py-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:grayscale text-white font-semibold text-sm transition-all flex items-center justify-center gap-3 active:scale-95"
                                        >
                                            {!selectedAvail.isAvailable ? (
                                                <><CalendarOff size={16} /> {selectedAvail.badgeText || 'Bookings Closed on this Date'}</>
                                            ) : !formData.appointmentDate ? (
                                                <><Clock size={16} /> Select a Slot First</>
                                            ) : !isValid ? (
                                                <><Clock size={16} /> {errorMsg}</>
                                            ) : isHoldingSlot ? (
                                                <><Loader size={16} className="animate-spin" /> Reserving Slot (10m)...</>
                                            ) : (
                                                <><CheckCircle size={16} /> Reserve Slot & Continue</>
                                            )}
                                            {isValid && !isHoldingSlot && <ArrowRight size={16} />}
                                        </button>
                                    );
                                })()}
                            </div>

                        </div>
                    )}

                    {step === 4 && (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden">
                <div className="p-6 md:p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-xl md:text-2xl text-slate-900 tracking-tight">Final Confirmation</h3>
                        <p className="text-xs font-medium text-slate-400 mt-1">Review your visit details, select patient, and confirm</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                releaseSlotHold();
                                setStep(3);
                            }}
                            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-2xs"
                        >
                            Change Slot
                        </button>
                        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center border border-teal-100 shrink-0"><ShieldCheck size={24} /></div>
                    </div>
                </div>

                <div className="p-6 md:p-12 space-y-8 md:space-y-10">
                    {/* ⏳ 10-Minute Slot Hold Banner */}
                    {holdToken && holdTimeRemaining > 0 && (
                        <div className="p-4 bg-teal-50 border border-teal-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-teal-900 shadow-sm animate-in fade-in duration-500">
                            <div className="flex items-center gap-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-600"></span>
                                </span>
                                <div>
                                    <p className="text-xs font-bold text-teal-950">Slot Temporarily Reserved For You</p>
                                    <p className="text-[11px] text-teal-700">Complete verification to lock in this appointment before time runs out.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Time Left:</span>
                                <span className="px-3 py-1 bg-teal-600 text-white rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">
                                    {formatRemainingTime(holdTimeRemaining)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Summary of Facility & Doctor */}
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        <div className="space-y-6 md:space-y-8">
                            <ReviewItem icon={<Building2 size={18} />} label="Clinic Facility" val={getSelectedClinic()?.name} sub={getSelectedClinic()?.address} />
                            <ReviewItem icon={<Stethoscope size={18} />} label="Consulting Specialist" val={formatDocTitle(getSelectedDoctor()?.name)} sub={getSelectedDoctor()?.specialization} />
                            <ReviewItem
                                icon={<Calendar size={18} />}
                                label="Appointment Date"
                                val={formData.appointmentDate ? new Date(formData.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                sub={formData.appointmentDate ? WEEKDAY_MAP[new Date(formData.appointmentDate).getDay()] : ''}
                            />
                            <ReviewItem
                                icon={<Clock size={18} />}
                                label="Arrival Window"
                                val={
                                    formData.appointmentDate
                                        ? (formData.slotMode === 'shift'
                                            ? (formData.appointmentDate.endsWith(getClinicTimingConfig().openingTime) ? 'Morning Shift' : 'Afternoon / Evening Shift')
                                            : new Date(formData.appointmentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
                                        : ''
                                }
                                sub={
                                    formData.slotMode === 'shift'
                                        ? `Arrival around start time: ${formData.appointmentDate ? formData.appointmentDate.split('T')[1] : ''}`
                                        : "Check-in required 10m early"
                                }
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Consultation Type</label>
                                <div className="flex gap-3">
                                    {['new', 'followup'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, appointmentType: type })}
                                            className={`flex-1 py-3 rounded-2xl border-2 font-semibold text-xs uppercase tracking-wider transition-all ${formData.appointmentType === type ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
                                        >
                                            {type} Visit
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Clinical Notes / Reason</label>
                                <textarea
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-teal-500 text-sm font-medium resize-none shadow-sm"
                                    rows="3"
                                    placeholder="Briefly describe your symptoms or reason for visit..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 👨‍👩‍👧‍👦 Who is this visit for? ("Konā mate?") */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-5 md:p-8 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-100/60 text-teal-700 flex items-center justify-center shrink-0">
                                <Users size={20} />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900">Who is this visit for? <span className="text-teal-600">(Konā mate?)</span></h4>
                                <p className="text-xs text-slate-500">Ensure separate, private medical records for each patient</p>
                            </div>
                        </div>

                        {/* Selection Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Myself */}
                            <button
                                type="button"
                                onClick={() => { setSelectedFor('myself'); setSelectedFamilyMemberId(''); }}
                                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                    selectedFor === 'myself'
                                        ? 'border-teal-500 bg-white text-slate-900 shadow-md ring-2 ring-teal-500/20'
                                        : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Primary Account</span>
                                    {selectedFor === 'myself' && <CheckCircle size={16} className="text-teal-600" />}
                                </div>
                                <p className="text-sm font-bold text-slate-900 truncate">
                                    {primaryPatient?.name || (isLoggedIn ? 'Myself' : 'Myself (Primary)')}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">Account holder records</p>
                            </button>

                            {/* Saved Family Member (if logged in and has members) */}
                            {familyMembers.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedFor('family');
                                        if (!selectedFamilyMemberId && familyMembers[0]) {
                                            setSelectedFamilyMemberId(familyMembers[0]._id);
                                        }
                                    }}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                        selectedFor === 'family'
                                            ? 'border-teal-500 bg-white text-slate-900 shadow-md ring-2 ring-teal-500/20'
                                            : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Saved Family</span>
                                        {selectedFor === 'family' && <CheckCircle size={16} className="text-teal-600" />}
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 truncate">
                                        {familyMembers.find(f => f._id === selectedFamilyMemberId)?.name || `${familyMembers.length} Members`}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">Pick existing profile</p>
                                </button>
                            )}

                            {/* Add New Family Member */}
                            <button
                                type="button"
                                onClick={() => { setSelectedFor('new_family'); setSelectedFamilyMemberId(''); }}
                                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                    selectedFor === 'new_family'
                                        ? 'border-teal-500 bg-white text-slate-900 shadow-md ring-2 ring-teal-500/20'
                                        : 'border-dashed border-slate-300 bg-white/40 text-slate-600 hover:border-teal-400'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">+ Family Member</span>
                                    {selectedFor === 'new_family' && <CheckCircle size={16} className="text-teal-600" />}
                                </div>
                                <p className="text-sm font-bold text-slate-900">Add New Profile</p>
                                <p className="text-xs text-slate-400 mt-0.5">Child, Spouse, Parent</p>
                            </button>
                        </div>

                        {/* If Saved Family Member Selected */}
                        {selectedFor === 'family' && familyMembers.length > 0 && (
                            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 animate-in fade-in duration-300">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Family Member Profile</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {familyMembers.map((m) => (
                                        <button
                                            key={m._id}
                                            type="button"
                                            onClick={() => setSelectedFamilyMemberId(m._id)}
                                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                                                selectedFamilyMemberId === m._id
                                                    ? 'border-teal-500 bg-teal-50/50 text-teal-950 font-bold'
                                                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                                            }`}
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{m.name}</p>
                                                <p className="text-xs text-slate-500">{m.relationship || 'Family Member'} {m.age ? `• ${m.age} yrs` : ''}</p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-semibold text-slate-600">
                                                {m.relationship}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* If Add New Family Member Selected */}
                        {selectedFor === 'new_family' && (
                            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4 animate-in fade-in duration-300">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                                    <UserPlus size={15} /> Family Member Profile Details
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-600">Full Name *</label>
                                        <input
                                            type="text"
                                            placeholder="Patient's full name"
                                            value={newMember.name}
                                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-teal-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-600">Relationship *</label>
                                        <select
                                            value={newMember.relationship}
                                            onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-teal-500"
                                        >
                                            <option value="Child">Child (Son / Daughter)</option>
                                            <option value="Spouse">Spouse (Husband / Wife)</option>
                                            <option value="Parent">Parent (Mother / Father)</option>
                                            <option value="Sibling">Sibling (Brother / Sister)</option>
                                            <option value="Other">Other Family Member</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-600">Age</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 12"
                                            value={newMember.age}
                                            onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-teal-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-600">Gender</label>
                                        <select
                                            value={newMember.gender}
                                            onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-teal-500"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Lawful Guardian Consent (DPDP Act) */}
                                {(newMember.relationship === 'Child' || (newMember.age && parseInt(newMember.age) < 18)) && (
                                    <label className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-3 cursor-pointer text-xs text-amber-950 font-medium">
                                        <input
                                            type="checkbox"
                                            checked={newMember.guardianConsent}
                                            onChange={(e) => setNewMember({ ...newMember, guardianConsent: e.target.checked })}
                                            className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>
                                            <strong>Lawful Guardian Declaration (DPDP Act 2023):</strong> I confirm that I am the lawful parent or guardian providing lawful consent to book healthcare consultations and maintain medical records for this minor.
                                        </span>
                                    </label>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 🔐 Just-In-Time Authentication (If NOT logged in) */}
                    {!isLoggedIn && (
                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-5 md:p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-100/60 text-teal-700 flex items-center justify-center shrink-0">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-900">Patient Identification &amp; Account</h4>
                                    <p className="text-xs text-slate-500">Sign in or create your free account to lock in your appointment</p>
                                </div>
                            </div>

                            {authError && (
                                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
                                    <AlertCircle size={16} /> {authError}
                                </div>
                            )}

                            {authMode === 'phone' && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600">Mobile Number *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
                                            <input
                                                type="tel"
                                                maxLength="10"
                                                placeholder="9876543210"
                                                value={authPhone}
                                                onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-14 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-teal-500"
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400">Appointment updates &amp; receptionist confirmations are sent here.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCheckPhone}
                                        disabled={authLoading || authPhone.length < 10}
                                        className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                                    >
                                        {authLoading ? <Loader size={16} className="animate-spin" /> : <>Continue with Mobile <ArrowRight size={16} /></>}
                                    </button>
                                </div>
                            )}

                            {authMode === 'login' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200">
                                        <span>Phone: <strong>+91 {authPhone}</strong></span>
                                        <button type="button" onClick={() => setAuthMode('phone')} className="text-teal-600 font-semibold hover:underline">Change</button>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600">Account Password *</label>
                                        <input
                                            type="password"
                                            placeholder="Enter your password"
                                            value={authPassword}
                                            onChange={(e) => setAuthPassword(e.target.value)}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-teal-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleInlineLogin}
                                        disabled={authLoading || !authPassword}
                                        className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                                    >
                                        {authLoading ? <Loader size={16} className="animate-spin" /> : <><CheckCircle size={16} /> Sign In &amp; Continue</>}
                                    </button>
                                </div>
                            )}

                            {authMode === 'signup' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200">
                                        <span>Phone: <strong>+91 {authPhone}</strong> (OTP sent)</span>
                                        <button type="button" onClick={() => setAuthMode('phone')} className="text-teal-600 font-semibold hover:underline">Change</button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="space-y-1 sm:col-span-1">
                                            <label className="text-xs font-semibold text-slate-600">Your Full Name *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Ramesh Patel"
                                                value={authName}
                                                onChange={(e) => setAuthName(e.target.value)}
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-teal-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-600">Age</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 32"
                                                value={authAge}
                                                onChange={(e) => setAuthAge(e.target.value)}
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-teal-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-600">Gender</label>
                                            <select
                                                value={authGender}
                                                onChange={(e) => setAuthGender(e.target.value)}
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-teal-500"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold text-slate-600">6-Digit SMS OTP *</label>
                                                {otpCountdown > 0 ? (
                                                    <span className="text-[11px] text-slate-400 font-mono">Resend in {otpCountdown}s</span>
                                                ) : (
                                                    <button type="button" onClick={handleResendOTP} className="text-[11px] font-semibold text-teal-600 hover:underline">Resend OTP</button>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                maxLength="6"
                                                placeholder="123456"
                                                value={authOtp}
                                                onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, ''))}
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold tracking-widest text-center outline-none focus:border-teal-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-600">Create Password (min 8 chars) *</label>
                                            <input
                                                type="password"
                                                placeholder="Create secure password"
                                                value={authPassword}
                                                onChange={(e) => setAuthPassword(e.target.value)}
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-teal-500"
                                            />
                                        </div>
                                    </div>

                                    {/* DPDP Consent Checkboxes */}
                                    <div className="space-y-2.5 pt-2">
                                        <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={authConsentAgreed}
                                                onChange={(e) => setAuthConsentAgreed(e.target.checked)}
                                                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                                            />
                                            <span>
                                                I agree to Appointory's <a href="/terms" target="_blank" className="text-teal-600 underline">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-teal-600 underline">Privacy Notice</a>, and consent to processing my healthcare appointment information as per the DPDP Act 2023. *
                                            </span>
                                        </label>

                                        <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={authWhatsappOptIn}
                                                onChange={(e) => setAuthWhatsappOptIn(e.target.checked)}
                                                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                                            />
                                            <span>
                                                Receive instant appointment booking status, verification tokens, and reminder notifications on WhatsApp. (Optional)
                                            </span>
                                        </label>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleInlineSignup}
                                        disabled={authLoading || !authName || authOtp.length !== 6 || authPassword.length < 8 || !authConsentAgreed}
                                        className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                                    >
                                        {authLoading ? <Loader size={16} className="animate-spin" /> : <><Sparkles size={16} /> Create Account &amp; Continue</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold animate-in shake duration-500">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    <button
                        onClick={handleConfirmBooking}
                        disabled={loading}
                        className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-teal-600/25 flex items-center justify-center gap-3 transition-all active:scale-98 disabled:opacity-50"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : <><CheckCircle size={20} /> {formData.rescheduleAppointmentId ? 'Confirm Reschedule' : 'Finalize Appointment'}</>}
                    </button>
                    </div>
                </div>
            </div>
        )}
    </main>
            </div>
        </div>
    );
};

// UI Components
const StepBar = ({ num, label, active, current }) => (
    <div className={`relative transition-all duration-700 ${active ? 'opacity-100' : 'opacity-30'}`}>
        <div className={`h-1 md:h-1.5 w-full rounded-full transition-all duration-700 ${active ? 'bg-teal-600 shadow-[0_0_12px_rgba(13,148,136,0.4)]' : 'bg-slate-200'}`} />
        <div className="mt-2 md:mt-4 flex items-center gap-1.5 md:gap-3">
            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-700 ${current ? 'bg-teal-600 text-white shadow-lg md:shadow-xl md:rotate-12' : active ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                {active && !current ? <Check size={11} /> : num}
            </div>
            <span className={`text-[10px] md:text-xs font-semibold uppercase tracking-wider ${current ? 'text-teal-600' : 'text-slate-400'} hidden sm:inline`}>{label}</span>
        </div>
    </div>
);

const ReviewItem = ({ icon, label, val, sub }) => (
    <div className="flex items-start gap-6 group">
        <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all duration-300 shrink-0 shadow-sm">
            {icon}
        </div>
        <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-base font-bold text-slate-900 leading-tight">{val || '---'}</p>
            {sub && <p className="text-xs font-normal text-slate-400 mt-1">{sub}</p>}
        </div>
    </div>
);

export default BookAppointment;
