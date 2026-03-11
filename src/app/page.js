"use client";
import { useState, useEffect } from "react";
import { studentSchema } from "@/app/lib/validation";

export default function StudentPage() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", age: "" });
  const [editingId, setEditingId] = useState(null); // Track which student is being edited
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      const json = await res.json();
      if (json.success) setStudents(json.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Show temporary feedback message
  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
  };

  // Populate form for editing
  const handleEdit = (student) => {
    setEditingId(student._id);
    setForm({
      name: student.name,
      email: student.email,
      age: student.age || "",
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing mode
  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", email: "", age: "" });
    setErrors({});
  };

  // Handle Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Client-side validation using Zod
    const validationResult = studentSchema.safeParse(form);
    
    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/students/${editingId}` : "/api/students";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validationResult.data),
      });
      
      const json = await res.json();
      
      if (json.success) {
        setForm({ name: "", email: "", age: "" });
        setEditingId(null);
        showFeedback("success", editingId ? "Student updated successfully!" : "Student enrolled successfully!");
        fetchStudents();
      } else {
        showFeedback("error", json.error || "Operation failed");
      }
    } catch (error) {
      showFeedback("error", "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showFeedback("success", "Student removed successfully");
        if (editingId === id) cancelEdit();
        fetchStudents();
      }
    } catch (error) {
      showFeedback("error", "Failed to delete student");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Animated Header */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-2xl mb-2">
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            Student Management
          </h1>
          <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
            Full **CRUD** interface with real-time MongoDB synchronization and secure validation.
          </p>
        </div>

        {/* Floating Feedback Toast */}
        {feedback.message && (
          <div className={`fixed top-6 right-6 z-50 flex items-center p-4 rounded-xl shadow-2xl border animate-in slide-in-from-right-full duration-300 ${
            feedback.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
          }`}>
            <div className={`mr-3 p-1 rounded-full ${feedback.type === "success" ? "bg-emerald-200" : "bg-rose-200"}`}>
              {feedback.type === "success" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            <span className="font-semibold text-sm">{feedback.message}</span>
          </div>
        )}

        {/* Interactive Form Card */}
        <div className={`bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border transition-all duration-500 ${editingId ? 'border-indigo-200 ring-2 ring-indigo-500/5' : 'border-slate-100'}`}>
          <div className="px-8 py-10 sm:p-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <span className={`w-1.5 h-8 rounded-full ${editingId ? 'bg-amber-500' : 'bg-indigo-600'}`}></span>
                {editingId ? "Update Student Profile" : "Enroll New Student"}
              </h2>
              {editingId && (
                <button 
                  onClick={cancelEdit}
                  className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2 group">
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                  <input 
                    id="name"
                    autoComplete="off"
                    className={`w-full rounded-xl border-2 px-5 py-4 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-4 focus:outline-none transition-all duration-300 ${
                      errors.name ? "border-rose-200 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-100 bg-slate-50/50 focus:border-indigo-500 focus:ring-indigo-500/10"
                    }`}
                    placeholder="e.g. Jane Doe" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                  />
                  {errors.name && <p className="text-xs font-bold text-rose-500 ml-1 animate-in fade-in slide-in-from-top-1">{errors.name}</p>}
                </div>
                <div className="space-y-2 group">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                  <input 
                    id="email"
                    type="email"
                    autoComplete="off"
                    className={`w-full rounded-xl border-2 px-5 py-4 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-4 focus:outline-none transition-all duration-300 ${
                      errors.email ? "border-rose-200 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-100 bg-slate-50/50 focus:border-indigo-500 focus:ring-indigo-500/10"
                    }`}
                    placeholder="jane@example.com" 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                  />
                  {errors.email && <p className="text-xs font-bold text-rose-500 ml-1 animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
                </div>
              </div>
              <div className="space-y-2 group">
                <label htmlFor="age" className="block text-sm font-semibold text-slate-700 ml-1">Age</label>
                <input 
                  id="age"
                  type="number" 
                  className={`w-full sm:w-1/3 rounded-xl border-2 px-5 py-4 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-4 focus:outline-none transition-all duration-300 ${
                    errors.age ? "border-rose-200 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-100 bg-slate-50/50 focus:border-indigo-500 focus:ring-indigo-500/10"
                  }`}
                  placeholder="21" 
                  value={form.age} 
                  onChange={e => setForm({...form, age: e.target.value})} 
                />
                {errors.age && <p className="text-xs font-bold text-rose-500 ml-1 animate-in fade-in slide-in-from-top-1">{errors.age}</p>}
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full overflow-hidden flex justify-center py-5 px-6 rounded-2xl text-lg font-bold text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r transition-all duration-300 group-hover:scale-110 group-active:scale-100 ${editingId ? 'from-amber-500 to-orange-600' : 'from-indigo-600 to-blue-600'}`}></div>
                  <span className="relative flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        {editingId ? "Updating..." : "Processing..."}
                      </>
                    ) : (
                      <>
                        {editingId ? "Save Changes" : "Confirm Enrollment"}
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Dynamic Students List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-extrabold text-slate-800">Verified Roster</h2>
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-slate-600 font-bold text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {students.length} Total Records
            </div>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50 animate-pulse">
                <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="font-semibold text-slate-400">Syncing with MongoDB...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="group relative text-center py-20 bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200 transition-colors hover:border-slate-300">
                <div className="mb-4 inline-block p-5 bg-white rounded-full shadow-sm text-slate-300 transition-transform group-hover:scale-110 duration-500">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">No Verified Students</h3>
                <p className="mt-2 text-slate-500 font-medium">Use the form above to add your first student record.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-700">
                {students.map((s, idx) => (
                  <div 
                    key={s._id} 
                    className={`group bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-2 ${editingId === s._id ? 'border-amber-200 ring-2 ring-amber-500/10' : 'border-slate-100'}`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-6 duration-300 border ${editingId === s._id ? 'bg-amber-50 border-amber-100' : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100'}`}>
                          <span className={`font-black text-2xl ${editingId === s._id ? 'text-amber-600' : 'text-indigo-600'}`}>
                            {s.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            {s.name}
                            {s.age && (
                              <span className="text-[10px] tracking-widest uppercase font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                Age {s.age}
                              </span>
                            )}
                          </h3>
                          <p className="text-slate-500 font-medium flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            {s.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleEdit(s)} 
                          className={`flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-3 rounded-xl font-bold transition-all duration-300 active:scale-95 ${editingId === s._id ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100'}`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          {editingId === s._id ? "Editing..." : "Edit"}
                        </button>
                        <button 
                          onClick={() => handleDelete(s._id)} 
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-3 rounded-xl font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-600 hover:text-white hover:border-transparent active:scale-95 transition-all duration-300 group/del"
                        >
                          <svg className="w-4 h-4 sm:mr-0 lg:mr-2 transition-transform group-hover/del:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="hidden lg:inline">Revoke</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-top { from { transform: translateY(-1rem); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slide-in-from-bottom { from { transform: translateY(0.5rem); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slide-in-from-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        
        .animate-in { animation: fade-in 0.3s ease-out; }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-top-4 { animation-name: slide-in-from-top; }
        .slide-in-from-bottom-2 { animation-name: slide-in-from-bottom; }
        .slide-in-from-right-full { animation: slide-in-from-right 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}
