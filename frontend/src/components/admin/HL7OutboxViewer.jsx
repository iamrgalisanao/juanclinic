import React, { useState, useEffect } from 'react';
import { useDialog } from '../../context/DialogContext';
import { 
    Send, 
    RefreshCcw, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    FileText,
    Terminal,
    Search
} from 'lucide-react';
import { getHL7Outbox, retryHL7Message, processHL7Outbox } from '../../services/api';

const HL7OutboxViewer = () => {
    const { alert } = useDialog();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchOutbox();
    }, []);

    const fetchOutbox = async () => {
        setLoading(true);
        try {
            const data = await getHL7Outbox();
            setMessages(data.data || []);
        } catch (err) {
            console.error("Failed to fetch HL7 outbox", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async (id) => {
        try {
            await retryHL7Message(id);
            fetchOutbox(); // Refresh
        } catch (err) {
            await alert({
                title: 'HL7 Transmission Error',
                message: "Retry failed: " + err.message
            });
        }
    };

    const handleBatchProcess = async () => {
        setProcessing(true);
        try {
            await processHL7Outbox();
            setTimeout(fetchOutbox, 2000); // Give it time to process
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'SENT': return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1"><CheckCircle2 size={12}/> SENT</span>;
            case 'FAILED': return <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1"><AlertCircle size={12}/> FAILED</span>;
            default: return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1"><Clock size={12}/> PENDING</span>;
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">HL7 Transport Gateway</h2>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Outbound Clinical Data Synchronization</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handleBatchProcess}
                        disabled={processing}
                        className="px-6 py-4 bg-slate-100 text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest flex items-center gap-2"
                    >
                        <RefreshCcw size={16} className={processing ? 'animate-spin' : ''} />
                        Process Queue
                    </button>
                    <button 
                         onClick={fetchOutbox}
                        className="px-6 py-4 bg-his-green-500 text-white text-xs font-black rounded-2xl hover:bg-his-green-600 transition-all uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-his-green-500/20"
                    >
                        <RefreshCcw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 overflow-hidden">
                {/* Message List */}
                <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sleek flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-50 relative">
                        <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                            type="text" 
                            placeholder="Filter by ID, Type, or Status..." 
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-his-green-50/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 p-4 space-y-3">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <RefreshCcw className="animate-spin text-his-green-500" size={32} />
                            </div>
                        ) : messages.length > 0 ? messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                onClick={() => setSelectedMessage(msg)}
                                className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group ${
                                    selectedMessage?.id === msg.id ? 'bg-his-green-50 border-his-green-100 shadow-inner' : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50/50'
                                }`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${
                                        msg.message_type === 'ORU' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                                    }`}>
                                        {msg.message_type}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                                            {msg.model_type} #{msg.model_id}
                                            {getStatusBadge(msg.status)}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                            Created: {new Date(msg.created_at).toLocaleString()} • Retries: {msg.retry_count}
                                        </p>
                                    </div>
                                </div>
                                
                                {msg.status !== 'SENT' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleRetry(msg.id); }}
                                        className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-his-green-500 hover:border-his-green-100 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Send size={16} />
                                    </button>
                                )}
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                <Terminal size={48} className="mb-4 opacity-50" />
                                <p className="text-sm font-black uppercase tracking-widest">Outbox is empty</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Panel */}
                <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-his-green-500" />
                            Message Inspector
                        </h3>
                        {selectedMessage && (
                            <span className="text-[10px] font-black text-white/40 uppercase font-mono">ID: {selectedMessage.id}</span>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-10 font-mono text-emerald-400 text-xs leading-relaxed whitespace-pre-wrap selection:bg-his-green-500 selection:text-white">
                        {selectedMessage ? (
                            <div className="space-y-8">
                                <div>
                                    <p className="text-white/20 uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                                        <FileText size={14} /> Raw HL7 v2.3 Payload
                                    </p>
                                    <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                                        {selectedMessage.payload}
                                    </div>
                                </div>

                                {selectedMessage.last_error && (
                                    <div>
                                        <p className="text-rose-500/50 uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                                            <AlertCircle size={14} /> Transmission Error
                                        </p>
                                        <div className="bg-rose-500/10 p-6 rounded-2xl border border-rose-500/20 text-rose-400 italic">
                                            {selectedMessage.last_error}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-white/10 text-center px-10">
                                <p className="text-sm font-black uppercase tracking-widest">Select a message to inspect the wire protocol</p>
                            </div>
                        )}
                    </div>
                    
                    {selectedMessage && (
                        <div className="p-8 bg-black/20 mt-auto border-t border-white/5">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 rounded-2xl bg-white/5">
                                    <p className="text-[8px] font-black text-white/30 uppercase">Destination</p>
                                    <p className="text-[10px] font-bold text-white mt-1">MIRTH^LLP</p>
                                </div>
                                <div className="text-center p-3 rounded-2xl bg-white/5">
                                    <p className="text-[8px] font-black text-white/30 uppercase">Processed At</p>
                                    <p className="text-[10px] font-bold text-white mt-1">
                                        {selectedMessage.processed_at ? new Date(selectedMessage.processed_at).toLocaleTimeString() : 'N/A'}
                                    </p>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HL7OutboxViewer;
