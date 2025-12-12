import React, { useState, useEffect } from 'react';
import { Clock, Save, Trash2, AlertCircle, CheckCircle2, Calendar, RefreshCw, UserCircle, LogOut, UserPlus, Calculator, Lock, Users } from 'lucide-react';
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

// --- Componente de Login Inteligente (Soporta Admin) ---
const LoginScreen = ({ onLogin }) => {
  const [step, setStep] = useState('ID'); // 'ID', 'NAME', 'ADMIN_PASS'
  const [empId, setEmpId] = useState('');
  const [empName, setEmpName] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleIdSubmit = async (e) => {
    e.preventDefault();
    const cleanId = empId.trim().toUpperCase();
    
    if (!cleanId) {
      setError('Please enter your Employee ID');
      return;
    }

    // --- DETECCIÓN DE ADMIN ---
    if (cleanId === 'ADMIN') {
      setStep('ADMIN_PASS');
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const docRef = doc(db, 'tracker_users', cleanId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        onLogin(cleanId, docSnap.data().name, false); // false = no es admin
      } else {
        setStep('NAME');
      }
    } catch (err) {
      console.error(err);
      setError('Error checking ID. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (adminPass === 'admin123') { // CONTRASEÑA DE ADMIN
      onLogin('ADMIN', 'Administrator', true); // true = es admin
    } else {
      setError('Invalid Password');
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
      await setDoc(doc(db, 'tracker_users', empId), {
        name: empName,
        createdAt: Date.now()
      });
      onLogin(empId, empName, false);
    } catch (err) {
      console.error(err);
      setError('Error registering user.');
    } finally {
      setLoading(false);
    }
  };

  // Render: Admin Password
  if (step === 'ADMIN_PASS') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-700 w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-6">
            <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Access</h1>
            <p className="text-slate-500">Enter administrator password</p>
          </div>
          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div>
              <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none text-center text-lg" autoFocus />
            </div>
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</div>}
            <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all">
              Login
            </button>
            <button type="button" onClick={() => {setStep('ID'); setError(''); setAdminPass('');}} className="w-full text-slate-400 text-sm hover:text-slate-600">Cancel</button>
          </form>
        </div>
      </div>
    );
  }

  // Render: Registro Nuevo
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

  // Render: Login Normal
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
            <input type="text" value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="e.g., 12345 or ADMIN" className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center text-lg font-mono tracking-wider" autoFocus />
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

  // Formulario (Solo para empleados normales)
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

  // Cargar Logs (LÓGICA DE ADMIN AQUI)
  useEffect(() => {
    if (!isAuthReady || !user) return;
    setLoading(true);
    
    // Consulta general ordenada por fecha
    const q = query(collection(db, 'tracker_logs'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (user.isAdmin) {
        // Si es Admin, mostrar TODO
        setLogs(allLogs);
      } else {
        // Si es empleado, filtrar solo los suyos
        setLogs(allLogs.filter(log => log.employeeId === user.id));
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isAuthReady, user]);

  // --- Funciones Auxiliares ---
  const getMinutes = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(`2000-01-01T${start}`);
    const e = new Date(`2000-01-01T${end}`);
    let diff = (e - s) / 60000;
    if (diff < 0) diff += 24 * 60;
    return Math.floor(diff);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "0m";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  useEffect(() => {
    if (formData.disconnectTime && formData.reconnectTime) {
      setPreviewLost(getMinutes(formData.disconnectTime, formData.reconnectTime));
    } else {
      setPreviewLost(null);
    }
    if (formData.isMUT && formData.mutStartTime && formData.mutEndTime) {
      setPreviewMut(getMinutes(formData.mutStartTime, formData.mutEndTime));
    } else {
      setPreviewMut(null);
    }
  }, [formData]);

  const handleLogin = (id, name, isAdmin) => {
    setUser({ id, name, isAdmin });
  };

  const handleLogout = () => {
    setUser(null);
    setLogs([]);
  };

  const reasons = [
    "Internet", "Power Outage", "Personal Emergency", 
    "Personal (bathroom)", "Coaching", "Meeting", "Training"
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

    const lostMinutes = getMinutes(formData.disconnectTime, formData.reconnectTime);
    const mutMinutes = formData.isMUT ? getMinutes(formData.mutStartTime, formData.mutEndTime) : 0;
    
    const durationText = formatDuration(lostMinutes);
    const mutDurationText = formData.isMUT ? formatDuration(mutMinutes) : null;

    let statusData = null;
    if (formData.isMUT) {
        const diff = mutMinutes - lostMinutes;
        if (diff < 0) {
            statusData = { 
              status: 'WARNING', 
              message: `Done: ${mutDurationText}`,
              subMessage: `Missing: ${formatDuration(Math.abs(diff))}`
            };
        } else if (diff === 0) {
             statusData = { status: 'OK', message: `Done: ${mutDurationText}`, subMessage: 'Fully Restored' };
        } else {
             statusData = { status: 'EXTRA', message: `Done: ${mutDurationText}`, subMessage: `(+${formatDuration(diff)} Extra)` };
        }
    }

    const newLog = {
      employeeId: user.id,
      employeeName: user.name,
      createdAt: Date.now(),
      date: formData.date,
      disconnectTime: formData.disconnectTime,
      reconnectTime: formData.reconnectTime,
      reason: formData.reason,
      duration: durationText,
      durationMinutes: lostMinutes,
      isMUT: formData.isMUT,
      mutDetails: formData.isMUT ? {
        date: formData.mutDate,
        start: formData.mutStartTime,
        end: formData.mutEndTime,
        duration: mutDurationText,
        durationMinutes: mutMinutes,
        status: statusData
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
      // Incluimos siempre ID y Nombre (útil para el admin)
      csv += `${r.employeeId},${r.employeeName},${r.date},${r.reason},${r.disconnectTime},${r.reconnectTime},${r.duration},${mut},${statusText}\n`;
    });
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = user.isAdmin ? 'FULL_REPORT_ADMIN.csv' : `logs_${user.id}.csv`;
    link.click();
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // --- RENDERIZADO DEL DASHBOARD ---

  return (
    <div className={`min-h-screen font-sans p-4 md:p-8 ${user.isAdmin ? 'bg-slate-100' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className={`flex justify-between items-center mb-8 p-4 rounded-xl shadow-sm border ${user.isAdmin ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${user.isAdmin ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}>
              {user.isAdmin ? <Lock className="w-5 h-5"/> : user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className={`text-xs uppercase font-bold tracking-wider ${user.isAdmin ? 'text-slate-400' : 'text-slate-500'}`}>
                {user.isAdmin ? 'Admin Panel' : 'Dashboard'}
              </p>
              <h1 className={`text-xl font-bold ${user.isAdmin ? 'text-white' : 'text-slate-800'}`}>{user.name}</h1>
              {!user.isAdmin && <p className="text-sm text-indigo-600 font-mono">ID: {user.id}</p>}
            </div>
          </div>
          <button onClick={handleLogout} className={`flex items-center gap-2 text-sm transition-colors px-4 py-2 rounded-lg border border-transparent ${user.isAdmin ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100'}`}>
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Si NO es admin, muestra el formulario. Si ES admin, no muestra nada (espacio vacío o expandir tabla) */}
          {!user.isAdmin && (
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
                <div className="flex items-center gap-2 mb-6 text-indigo-600">
                  <Clock className="w-6 h-6" />
                  <h2 className="text-xl font-bold">New Entry</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none" />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start</label><input type="time" name="disconnectTime" value={formData.disconnectTime} onChange={handleInputChange} className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg outline-none text-sm" /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">End</label><input type="time" name="reconnectTime" value={formData.reconnectTime} onChange={handleInputChange} className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg outline-none text-sm" /></div>
                    </div>
                    {previewLost !== null && <div className="flex justify-between text-sm bg-white px-3 py-2 rounded-lg border border-slate-200"><span className="text-slate-500">Lost:</span><span className="font-bold text-indigo-600">{formatDuration(previewLost)}</span></div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                    <div className="relative">
                      <select name="reason" value={formData.reason} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg appearance-none outline-none">
                        {reasons.map((r, i) => <option key={i} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg"><input type="checkbox" name="isMUT" checked={formData.isMUT} onChange={handleInputChange} className="w-5 h-5 text-indigo-600 rounded" /><span className="font-semibold text-slate-700">MUT Required</span></label>
                    {formData.isMUT && (
                      <div className="mt-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 animate-in fade-in">
                        <h3 className="text-xs font-bold text-indigo-600 uppercase mb-3 flex gap-1"><Calculator className="w-3 h-3" /> Make Up Calculation</h3>
                        <div className="space-y-3">
                           <div><label className="block text-xs text-slate-600">Date</label><input type="date" name="mutDate" value={formData.mutDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg outline-none text-sm" /></div>
                           <div className="grid grid-cols-2 gap-3">
                             <div><label className="block text-xs text-slate-600">Start</label><input type="time" name="mutStartTime" value={formData.mutStartTime} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg outline-none text-sm" /></div>
                             <div><label className="block text-xs text-slate-600">End</label><input type="time" name="mutEndTime" value={formData.mutEndTime} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg outline-none text-sm" /></div>
                           </div>
                           {/* Status MUT Visual */}
                           {previewLost && previewMut && (previewLost - previewMut > 0) ? (
                             <div className="bg-red-50 border-red-200 rounded p-2 flex gap-2 items-center text-red-700 text-xs font-bold"><AlertCircle className="w-4 h-4"/> Missing: {formatDuration(previewLost - previewMut)}</div>
                           ) : previewLost && previewMut ? (
                             <div className="bg-green-50 border-green-200 rounded p-2 flex gap-2 items-center text-green-700 text-xs font-bold"><CheckCircle2 className="w-4 h-4"/> Covered!</div>
                           ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md">{loading ? 'Saving...' : 'Save Entry'}</button>
                </form>
              </div>
            </div>
          )}

          {/* Tabla (Ocupa todo el ancho si es Admin) */}
          <div className={`${user.isAdmin ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[600px]">
              <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-white">
                <div>
                  <h1 className="text-xl font-bold text-slate-800">{user.isAdmin ? 'All Employee Records' : 'Connection Log'}</h1>
                  <p className="text-sm text-slate-500">{user.isAdmin ? 'Monitoring Mode' : `Records for ${user.name}`}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-600">{logs.length} Records</span>
                  {logs.length > 0 && <button onClick={exportToCSV} className="text-sm text-indigo-600 hover:underline font-bold">Download CSV Report</button>}
                </div>
              </div>

              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      {/* Columnas Extra para Admin */}
                      {user.isAdmin && <th className="p-4 font-semibold border-b border-slate-200">Employee</th>}
                      <th className="p-4 font-semibold border-b border-slate-200">Date</th>
                      <th className="p-4 font-semibold border-b border-slate-200">Incident</th>
                      <th className="p-4 font-semibold border-b border-slate-200">Make Up Status</th>
                      <th className="p-4 border-b border-slate-200"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading && logs.length === 0 ? (
                      <tr><td colSpan={user.isAdmin ? 5 : 4} className="p-10 text-center text-slate-500">Loading data...</td></tr>
                    ) : logs.length === 0 ? (
                      <tr><td colSpan={user.isAdmin ? 5 : 4} className="p-10 text-center text-slate-400"><p>No logs found.</p></td></tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors text-sm">
                          {user.isAdmin && (
                            <td className="p-4 align-top">
                              <div className="font-bold text-slate-700">{log.employeeName || 'Unknown'}</div>
                              <div className="text-xs font-mono text-slate-400">{log.employeeId}</div>
                            </td>
                          )}
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
                              <div className={`border rounded p-2 text-xs max-w-[200px] ${
                                  log.mutDetails?.status?.status === 'WARNING' 
                                  ? 'bg-red-50 border-red-200 text-red-700' 
                                  : 'bg-green-50 border-green-200 text-green-700'
                              }`}>
                                <div className="flex items-center gap-1 font-bold mb-1">
                                    {log.mutDetails?.status?.status === 'WARNING' ? <AlertCircle className="w-3 h-3"/> : <CheckCircle2 className="w-3 h-3"/>}
                                    {log.mutDetails?.status?.message || "Restored"}
                                </div>
                                <div className="font-semibold mb-1">
                                    {log.mutDetails?.status?.subMessage}
                                </div>
                                <div className="opacity-75 font-mono text-[10px]">
                                    {log.mutDetails.date} <br/> {log.mutDetails.start}-{log.mutDetails.end}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700 flex items-center gap-1 font-bold">
                                <CheckCircle2 className="w-3 h-3"/>
                                Not Required
                              </div>
                            )}
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