import React, { useState } from 'react';

const Messages = () => {
    const [activeThread, setActiveThread] = useState(1);

    const threads = [
        { id: 1, name: 'Dr. Sarah Connor', role: 'Chief Surgeon', lastMsg: 'The patient in Room 302 needs...', time: '2m ago', unread: true, avatar: 'SC' },
        { id: 2, name: 'Lab Alert', role: 'System', lastMsg: 'Critical result for PAT-6458...', time: '15m ago', unread: true, avatar: 'LA' },
        { id: 3, name: 'Receptionist - Maria', role: 'Staff', lastMsg: 'New appointment scheduled for...', time: '1h ago', unread: false, avatar: 'RM' },
        { id: 4, name: 'Pharmacy Dept', role: 'Department', lastMsg: 'Medication stock updated for...', time: '3h ago', unread: false, avatar: 'PD' },
    ];

    const currentMessages = [
        { id: 1, sender: 'Dr. Sarah Connor', text: 'Hello, regarding the patient in Room 302, can we review the latest HL7 order?', time: '10:30 AM', isMe: false },
        { id: 2, sender: 'Me', text: 'Sure, I just ingested the message. It looks like a standard LAB_CBC request.', time: '10:32 AM', isMe: true },
        { id: 3, sender: 'Dr. Sarah Connor', text: 'Great. Please prioritize it as STAT.', time: '10:35 AM', isMe: false },
    ];

    return (
        <div className="flex bg-white rounded-[2.5rem] shadow-sleek border border-his-slate-100 overflow-hidden h-[calc(100vh-200px)]">
            {/* Thread List */}
            <div className="w-80 border-r border-his-slate-50 flex flex-col">
                <div className="p-8 border-b border-his-slate-50">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Messages</h2>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">Internal Communications</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {threads.map((thread) => (
                        <div
                            key={thread.id}
                            onClick={() => setActiveThread(thread.id)}
                            className={`p-6 cursor-pointer transition-all border-b border-his-slate-50 relative group ${activeThread === thread.id ? 'bg-his-slate-50' : 'hover:bg-slate-50/50'}`}
                        >
                            {activeThread === thread.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-his-green-500 rounded-r-full" />
                            )}
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-105 ${thread.unread ? 'bg-his-green-50 text-his-green-500' : 'bg-slate-100 text-slate-400'}`}>
                                    {thread.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-black text-sm text-slate-900 truncate">{thread.name}</h3>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">{thread.time}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{thread.role}</p>
                                    <p className={`text-xs truncate ${thread.unread ? 'font-bold text-slate-600' : 'text-slate-400'}`}>
                                        {thread.lastMsg}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50/30">
                <div className="p-8 bg-white/50 backdrop-blur-md border-b border-his-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-his-green-50 text-his-green-500 flex items-center justify-center font-black text-xs">
                            {threads.find(t => t.id === activeThread)?.avatar}
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 leading-none">{threads.find(t => t.id === activeThread)?.name}</h3>
                            <p className="text-[10px] font-bold text-his-green-500 mt-1 uppercase tracking-widest">Online • Typing...</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-xl bg-white border border-his-slate-100 flex items-center justify-center text-slate-400 hover:text-his-green-500 hover:shadow-md transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </button>
                        <button className="w-10 h-10 rounded-xl bg-white border border-his-slate-100 flex items-center justify-center text-slate-400 hover:text-his-green-500 hover:shadow-md transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-10 overflow-y-auto space-y-8">
                    {currentMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${msg.isMe ? 'order-1' : 'order-2'}`}>
                                <div className={`p-5 rounded-[2rem] text-sm shadow-sm ${msg.isMe
                                    ? 'bg-slate-900 text-white rounded-tr-none'
                                    : 'bg-white text-slate-700 rounded-tl-none border border-his-slate-50'}`}>
                                    {msg.text}
                                </div>
                                <p className={`text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest ${msg.isMe ? 'text-right' : 'text-left'}`}>
                                    {msg.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-white/50 backdrop-blur-md border-t border-his-slate-50">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Type your message here..."
                            className="w-full bg-white border-none rounded-2xl py-5 pl-8 pr-32 text-sm font-semibold focus:ring-2 focus:ring-his-green-500/20 shadow-md transition-all"
                        />
                        <div className="absolute right-3 top-2 bottom-2 flex gap-2">
                            <button className="w-10 h-10 rounded-xl bg-his-slate-50 text-slate-400 flex items-center justify-center hover:bg-his-slate-100 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            </button>
                            <button className="px-6 h-10 bg-his-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-his-green-500/20 hover:bg-his-green-600 transition-all">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;
