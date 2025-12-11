import React, { useState, useEffect } from 'react';
import { Clock, Save, Trash2, AlertCircle, CheckCircle2, Calendar, RefreshCw, UserCircle, LogOut, UserPlus, Calculator } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDoc, setDoc } from 'firebase/firestore';

// --- 1. CONFIGURACIÓN DE FIREBASE (PEGA TUS LLAVES AQUÍ) ---
const firebaseConfig = {

    apiKey: "AIzaSyAVGEp9Kg71HKMpAoLLWfr8ogytEAx4LRY",

    authDomain: "tracker-desconexiones.firebaseapp.com",

    projectId: "tracker-desconexiones",

    storageBucket: "tracker-desconexiones.firebasestorage.app",

    messagingSenderId: "1051827757232",

    appId: "1:1051827757232:web:a5f5091e9187598a18db75"

};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Componente de Login Inteligente (Pregunta nombre solo si es nuevo) ---
const LoginScreen = ({ onLogin }) => {
    const [step, setStep] = useState('ID'); // 'ID' o 'NAME'
    const [empId, setEmpId] = useState('');
    const [empName, setEmpName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleIdSubmit = async (e) => {
        e.preventDefault();
        if (!empId.trim()) {
            setError('Please enter your Employee ID');
            return;
        }
        setLoading(true);
        setError('');

        try {
            // Verificar si el usuario ya existe en Firestore
            const docRef = doc(db, 'tracker_users', empId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // Si existe, loguear con el nombre guardado
                onLogin(empId, docSnap.data().name);
            } else {
                // Si no existe, pedir nombre
                setStep('NAME');
            }
        } catch (err) {
            console.error(err);
            setError('Error checking ID. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!empName.trim()) {
            setError('Please enter your full name');
            return;
        }
        setLoading(true);

        try {
            // Guardar nuevo usuario
            await setDoc(doc(db, 'tracker_users', empId), {
                name: empName,
                createdAt: Date.now()
            });
            onLogin(empId, empName);
        } catch (err) {
            console.error(err);
            setError('Error registering user.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'NAME') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-6">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">New Employee</h1>
                        <p className="text-slate-500">ID <span className="font-mono font-bold text-slate-700">{empId}</span> not found.</p>
                        <p className="text-sm text-slate-400">Please enter your name to register.</p>
                    </div>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input type="text" value={empName} onChange={(e) => setEmpName(e.target.value)} placeholder="e.g. John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-center text-lg" autoFocus />
                        </div>
                        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</div>}
                        <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                            {loading ? 'Registering...' : 'Save & Continue'}
                        </button>
                        <button type="button" onClick={() => setStep('ID')} className="w-full text-slate-400 text-sm hover:text-slate-600">Cancel</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserCircle className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
                    <p className="text-slate-500">Enter your Employee ID</p>
                </div>
                <form onSubmit={handleIdSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                        <input type="text" value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="e.g., 12345" className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center text-lg font-mono tracking-wider" autoFocus />
                    </div>
                    {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</div>}
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                        {loading ? 'Checking...' : 'Access Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Aplicación Principal ---
export default function App() {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('trackerUser');
        return saved ? JSON.parse(saved) : null;
    });

    const [isAuthReady, setIsAuthReady] = useState(false);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        disconnectTime: '',
        reconnectTime: '',
        reason: 'Internet',
        isMUT: false,
        mutDate: '',
        mutStartTime: '',
        mutEndTime: ''
    });

    const [error, setError] = useState('');

    // Estados calculados para Preview
    const [previewLost, setPreviewLost] = useState(null);
    const [previewMut, setPreviewMut] = useState(null);

    // Inicialización Auth
    useEffect(() => {
        signInAnonymously(auth).catch((err) => console.error(err));
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    // Persistencia Local
    useEffect(() => {
        if (user) {
            localStorage.setItem('trackerUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('trackerUser');
        }
    }, [user]);

    // Cargar Logs
    useEffect(() => {
        if (!isAuthReady || !user) return;
        setLoading(true);
        const q = query(collection(db, 'tracker_logs'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLogs(allLogs.filter(log => log.employeeId === user.id));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [isAuthReady, user]);

    // --- Lógica de Cálculo de Tiempo ---
    const getMinutes = (start, end) => {
        if (!start || !end) return 0;
        const s = new Date(`2000-01-01T${start}`);
        const e = new Date(`2000-01-01T${end}`);
        let diff = (e - s) / 60000; // minutos
        if (diff < 0) diff += 24 * 60;
        return Math.floor(diff);
    };

    const formatDuration = (minutes) => {
        if (!minutes) return "0m";
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    // Efecto para actualizar Previews en tiempo real
    useEffect(() => {
        // 1. Calcular tiempo perdido
        if (formData.disconnectTime && formData.reconnectTime) {
            const mins = getMinutes(formData.disconnectTime, formData.reconnectTime);
            setPreviewLost(mins);
        } else {
            setPreviewLost(null);
        }

        // 2. Calcular tiempo MUT
        if (formData.isMUT && formData.mutStartTime && formData.mutEndTime) {
            const mins = getMinutes(formData.mutStartTime, formData.mutEndTime);
            setPreviewMut(mins);
        } else {
            setPreviewMut(null);
        }
    }, [formData]);

    const handleLogin = (id, name) => {
        setUser({ id, name });
    };

    const handleLogout = () => {
        setUser(null);
        setLogs([]);
    };

    const reasons = [
        "Internet", "Power Outage", "Personal Emergency",
        "Personal (bathroom)", "Coaching", "Meeting", "Training", "Computer", "LINC"
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.date || !formData.disconnectTime || !formData.reconnectTime) {
            setError('Please fill in Date and Disconnection times.');
            return;
        }
        if (formData.isMUT && (!formData.mutDate || !formData.mutStartTime || !formData.mutEndTime)) {
            setError('Please fill in all MUT fields.');
            return;
        }

        // CALCULAR TIEMPOS LOCALMENTE AL MOMENTO DE ENVIAR (Para asegurar precisión)
        const lostMinutes = getMinutes(formData.disconnectTime, formData.reconnectTime);
        const mutMinutes = formData.isMUT ? getMinutes(formData.mutStartTime, formData.mutEndTime) : 0;

        const durationText = formatDuration(lostMinutes);
        const mutDurationText = formData.isMUT ? formatDuration(mutMinutes) : null;

        // Calcular el estado del MUT para guardarlo permanentemente
        let statusData = null;
        if (formData.isMUT) {
            const diff = mutMinutes - lostMinutes; // Positivo = Extra, Negativo = Falta

            if (diff < 0) {
                statusData = {
                    status: 'WARNING',
                    message: `Done: ${mutDurationText}`,
                    subMessage: `Missing: ${formatDuration(Math.abs(diff))}`
                };
            } else if (diff === 0) {
                statusData = {
                    status: 'OK',
                    message: `Done: ${mutDurationText}`,
                    subMessage: 'Fully Restored'
                };
            } else {
                statusData = {
                    status: 'EXTRA',
                    message: `Done: ${mutDurationText}`,
                    subMessage: `(+${formatDuration(diff)} Extra)`
                };
            }
        }

        const newLog = {
            employeeId: user.id,
            employeeName: user.name, // Guardamos también el nombre en el log por si acaso
            createdAt: Date.now(),
            date: formData.date,
            disconnectTime: formData.disconnectTime,
            reconnectTime: formData.reconnectTime,
            reason: formData.reason,
            duration: durationText,
            durationMinutes: lostMinutes, // Guardamos numérico para cálculos futuros
            isMUT: formData.isMUT,
            mutDetails: formData.isMUT ? {
                date: formData.mutDate,
                start: formData.mutStartTime,
                end: formData.mutEndTime,
                duration: mutDurationText,
                durationMinutes: mutMinutes,
                status: statusData // GUARDAMOS EL ESTADO CALCULADO
            } : null
        };

        try {
            await addDoc(collection(db, 'tracker_logs'), newLog);
            setFormData(prev => ({
                ...prev,
                disconnectTime: '', reconnectTime: '',
                mutDate: '', mutStartTime: '', mutEndTime: ''
            }));
        } catch (err) {
            console.error("Error saving log:", err);
            setError("Connection error. Try again.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this entry?")) {
            await deleteDoc(doc(db, 'tracker_logs', id)).catch(err => console.error(err));
        }
    };

    const exportToCSV = () => {
        let csv = "data:text/csv;charset=utf-8,ID,Name,Date,Reason,Start,End,Lost Duration,MUT Required,MUT Date,MUT Start,MUT End,Restored Duration,Status\n";
        logs.forEach(r => {
            let mut = "No,,,,";
            let statusText = "N/A";

            if (r.isMUT) {
                mut = `Yes,${r.mutDetails.date},${r.mutDetails.start},${r.mutDetails.end},${r.mutDetails.duration}`;
                statusText = r.mutDetails.status ? `${r.mutDetails.status.message} (${r.mutDetails.status.subMessage})` : "Restored";
            }

            csv += `${user.id},${user.name},${r.date},${r.reason},${r.disconnectTime},${r.reconnectTime},${r.duration},${mut},${statusText}\n`;
        });
        const link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = `logs_${user.id}.csv`;
        link.click();
    };

    if (!user) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    // Lógica de validación visual MUT (Formulario)
    const renderMutStatus = () => {
        if (!previewLost || !previewMut) return null;
        const remaining = previewLost - previewMut;

        if (remaining > 0) {
            // Falta tiempo (ROJO)
            return (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                        <p className="text-xs font-bold text-red-800 uppercase">Insufficient Makeup Time</p>
                        <p className="text-sm text-red-600 font-medium">
                            You still need to cover: <span className="font-bold">{formatDuration(remaining)}</span>
                        </p>
                    </div>
                </div>
            );
        } else {
            // Tiempo cubierto (VERDE)
            return (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                        <p className="text-xs font-bold text-green-800 uppercase">Requirement Met</p>
                        <p className="text-sm text-green-600 font-medium">
                            Time fully restored! {remaining < 0 && `(Extra: ${formatDuration(Math.abs(remaining))})`}
                        </p>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header Personalizado */}
                <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Dashboard</p>
                            <h1 className="text-xl font-bold text-slate-800">{user.name}</h1>
                            <p className="text-sm text-indigo-600 font-mono">ID: {user.id}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors px-4 py-2 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100">
                        <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Formulario */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
                            <div className="flex items-center gap-2 mb-6 text-indigo-600">
                                <Clock className="w-6 h-6" />
                                <h2 className="text-xl font-bold">New Entry</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <div className="relative">
                                        <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    </div>
                                </div>

                                {/* Disconnection Area */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start</label>
                                            <input type="time" name="disconnectTime" value={formData.disconnectTime} onChange={handleInputChange} className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End</label>
                                            <input type="time" name="reconnectTime" value={formData.reconnectTime} onChange={handleInputChange} className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                                        </div>
                                    </div>
                                    {/* LIVE PREVIEW TIME */}
                                    {previewLost !== null && (
                                        <div className="flex items-center justify-between text-sm bg-white px-3 py-2 rounded-lg border border-slate-200">
                                            <span className="text-slate-500 font-medium">Total Lost:</span>
                                            <span className="font-bold text-indigo-600">{formatDuration(previewLost)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Reason */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                                    <div className="relative">
                                        <select name="reason" value={formData.reason} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none">
                                            {reasons.map((r, i) => <option key={i} value={r}>{r}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* MUT Section */}
                                <div className="pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                        <input type="checkbox" name="isMUT" checked={formData.isMUT} onChange={handleInputChange} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 transition cursor-pointer" />
                                        <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">MUT Required</span>
                                    </label>

                                    {formData.isMUT && (
                                        <div className="mt-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <h3 className="text-xs font-bold text-indigo-600 uppercase mb-3 flex items-center gap-1"><Calculator className="w-3 h-3" /> Make Up Calculation</h3>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                                                    <input type="date" name="mutDate" value={formData.mutDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg outline-none text-sm" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">Start</label>
                                                        <input type="time" name="mutStartTime" value={formData.mutStartTime} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg outline-none text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">End</label>
                                                        <input type="time" name="mutEndTime" value={formData.mutEndTime} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg outline-none text-sm" />
                                                    </div>
                                                </div>

                                                {/* VALIDACIÓN VISUAL (ROJO/VERDE) */}
                                                {renderMutStatus()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {error && <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100"><AlertCircle className="w-4 h-4" />{error}</div>}

                                <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Entry'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[600px]">
                            <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-white">
                                <div>
                                    <h1 className="text-xl font-bold text-slate-800">Connection Log</h1>
                                    <p className="text-sm text-slate-500">Records for {user.name}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-600">{logs.length} Records</span>
                                    {logs.length > 0 && <button onClick={exportToCSV} className="text-sm text-indigo-600 hover:underline">Download CSV</button>}
                                </div>
                            </div>

                            <div className="overflow-x-auto flex-grow">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-semibold border-b border-slate-200">Date</th>
                                            <th className="p-4 font-semibold border-b border-slate-200">Incident</th>
                                            <th className="p-4 font-semibold border-b border-slate-200">Make Up Status</th>
                                            <th className="p-4 border-b border-slate-200"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading && logs.length === 0 ? (
                                            <tr><td colSpan="4" className="p-10 text-center text-slate-500">Loading your data...</td></tr>
                                        ) : logs.length === 0 ? (
                                            <tr><td colSpan="4" className="p-10 text-center text-slate-400"><div className="flex flex-col items-center justify-center gap-3"><CheckCircle2 className="w-12 h-12 opacity-20" /><p>No logs found.</p></div></td></tr>
                                        ) : (
                                            logs.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-50 transition-colors text-sm">
                                                    <td className="p-4 align-top font-medium text-slate-700 whitespace-nowrap">{log.date}</td>
                                                    <td className="p-4 align-top">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-1 ${log.reason === 'Internet' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>{log.reason}</span>
                                                        <div className="flex items-center gap-1 font-mono text-xs text-slate-600">
                                                            <span className="text-red-500">{log.disconnectTime}</span>→<span className="text-green-600">{log.reconnectTime}</span>
                                                        </div>
                                                        <div className="text-xs font-bold text-slate-700 mt-1">Lost: {log.duration}</div>
                                                    </td>
                                                    <td className="p-4 align-top">
                                                        {log.isMUT ? (
                                                            <div className={`border rounded p-2 text-xs max-w-[200px] ${log.mutDetails?.status?.status === 'WARNING'
                                                                    ? 'bg-red-50 border-red-200 text-red-700'
                                                                    : 'bg-green-50 border-green-200 text-green-700'
                                                                }`}>
                                                                <div className="flex items-center gap-1 font-bold mb-1">
                                                                    {log.mutDetails?.status?.status === 'WARNING' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                                                    {log.mutDetails?.status?.message || "Restored"}
                                                                </div>
                                                                <div className="font-semibold mb-1">
                                                                    {log.mutDetails?.status?.subMessage}
                                                                </div>
                                                                <div className="opacity-75 font-mono text-[10px]">
                                                                    {log.mutDetails.date} <br /> {log.mutDetails.start}-{log.mutDetails.end}
                                                                </div>
                                                            </div>
                                                        ) : <span className="text-slate-400 text-xs italic">N/A</span>}
                                                    </td>
                                                    <td className="p-4 align-middle text-center">
                                                        <button onClick={() => handleDelete(log.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}