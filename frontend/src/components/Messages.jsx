import React, { useState, useEffect, useRef } from 'react';
import { getMessageThreads, getMessageHistory, sendMessage, getDoctors, createGroupChat } from '../services/api';
import echo from '../services/echo';

const Messages = ({ currentUser }) => {
    const [threads, setThreads] = useState([]);
    const [threadSearch, setThreadSearch] = useState('');
    const [threadTypeFilter, setThreadTypeFilter] = useState('ALL'); // ALL | DIRECT | GROUP
    const [activeThread, setActiveThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showUserList, setShowUserList] = useState(false);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);
    const scrollRef = useRef(null);

    const isMounted = useRef(false);

    const [mobileView, setMobileView] = useState('threads'); // 'threads' | 'chat'

    useEffect(() => {
        if (!isMounted.current) {
            fetchThreads();
            fetchAvailableUsers();
            isMounted.current = true;
        }
    }, []);

    // Switch to chat view on mobile when a thread is activated
    useEffect(() => {
        if (activeThread && mobileView === 'threads') {
            setMobileView('chat');
        }
    }, [activeThread]);

    useEffect(() => {
        if (activeThread) {
            const isConversation = threads.some(t => t.id === activeThread);
            if (isConversation) {
                fetchHistory(activeThread);
                // Real-time listener replaces polling
                const channel = echo.private(`conversation.${activeThread}`)
                    .listen('.message.sent', (e) => {
                        setMessages((prev) => {
                            // Prevent duplicates if sender also fetches history
                            if (prev.some(m => m.id === e.id)) return prev;
                            return [...prev, e];
                        });
                        // Also refresh threads for unread count/last message updates
                        fetchThreads();
                    });

                return () => {
                    echo.leave(`conversation.${activeThread}`);
                };
            } else {
                // New DM discovery, clear messages
                setMessages([]);
            }
        }
    }, [activeThread, threads]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchThreads = async () => {
        try {
            const data = await getMessageThreads();
            setThreads(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch threads", err);
        }
    };

    const fetchAvailableUsers = async () => {
        try {
            const users = await getDoctors();
            setAvailableUsers(users);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const fetchHistory = async (convId) => {
        try {
            const data = await getMessageHistory(convId);
            setMessages(data);
        } catch (err) {
            console.error("Failed to fetch history", err);
            // If fetching history by ID fails, it might be a raw user ID (new chat)
            setMessages([]);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeThread) return;

        // Determine if activeThread is a conversation ID or a user ID
        // In the new system, threads from getMessageThreads() ARE conversations.
        const existingConv = threads.find(t => t.id === activeThread);

        try {
            const payload = existingConv
                ? { conversation_id: activeThread, content: newMessage }
                : { receiver_id: activeThread, content: newMessage };

            const response = await sendMessage(payload);
            setNewMessage('');

            // Refresh threads to catch the new conversation ID if it was a DM discovery
            const updatedThreads = await getMessageThreads();
            setThreads(updatedThreads);

            if (!existingConv && response.conversation_id) {
                setActiveThread(response.conversation_id);
            } else {
                fetchHistory(activeThread);
            }
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const startNewChat = (user) => {
        setActiveThread(user.id);
        setShowUserList(false);
        setIsCreatingGroup(false);
        setMobileView('chat');
        setMessages([]);
    };

    const toggleUserSelection = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;
        try {
            const newGroup = await createGroupChat(groupName, selectedUsers);
            setIsCreatingGroup(false);
            setGroupName('');
            setSelectedUsers([]);
            fetchThreads();
            setActiveThread(newGroup.id);
            setMobileView('chat');
        } catch (err) {
            console.error("Failed to create group chat", err);
        }
    };

    if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse">Initializing Secure Comms...</div>;

    const normalizedSearch = threadSearch.trim().toLowerCase();
    const filteredThreads = threads.filter((thread) => {
        if (threadTypeFilter === 'GROUP' && thread.type !== 'GROUP') return false;
        if (threadTypeFilter === 'DIRECT' && thread.type === 'GROUP') return false;
        if (!normalizedSearch) return true;
        const haystack = `${thread.name ?? ''} ${thread.last_message ?? ''}`.toLowerCase();
        return haystack.includes(normalizedSearch);
    });

    const currentThread = threads.find(t => t.id === activeThread) || availableUsers.find(u => u.id === activeThread);

    return (
        <div className="flex bg-white rounded-3xl md:rounded-[2.5rem] shadow-sleek border border-his-slate-100 overflow-hidden h-[calc(100vh-140px)] md:h-[calc(100vh-200px)]">
            {/* Thread List */}
            <div className={`w-full md:w-80 border-r border-his-slate-50 flex flex-col ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 md:p-8 border-b border-his-slate-50 flex flex-col gap-4 bg-white/50 sticky top-0 z-20">
                    <div className="flex justify-between items-center mb-2 md:mb-6">
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Messages</h2>
                            <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1 md:mt-2">Internal Chat</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsCreatingGroup(!isCreatingGroup);
                                    setShowUserList(false);
                                    setSelectedUsers([]);
                                    setGroupName('');
                                }}
                                className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${isCreatingGroup ? 'bg-his-green-500 text-white' : 'bg-his-slate-900 text-white hover:bg-black'}`}
                                title="New Group Chat"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </button>
                            <button
                                onClick={() => {
                                    setShowUserList(!showUserList);
                                    setIsCreatingGroup(false);
                                }}
                                className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${showUserList ? 'bg-his-green-500 text-white' : 'bg-his-green-50 text-his-green-500 hover:bg-his-green-500 hover:text-white'}`}
                                title="New Message"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search threads..."
                                value={threadSearch}
                                onChange={(e) => setThreadSearch(e.target.value)}
                                className="w-full bg-slate-50 border border-his-slate-100 rounded-xl pl-10 pr-4 py-2.5 md:py-3 text-[10px] md:text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-his-green-500/20 focus:border-his-green-400 outline-none transition-all"
                            />
                            <svg className="w-4 h-4 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-his-slate-100">
                            <button
                                type="button"
                                onClick={() => setThreadTypeFilter('ALL')}
                                className={`flex-1 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${threadTypeFilter === 'ALL' ? 'bg-white text-his-green-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => setThreadTypeFilter('DIRECT')}
                                className={`flex-1 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${threadTypeFilter === 'DIRECT' ? 'bg-white text-his-green-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Direct
                            </button>
                            <button
                                type="button"
                                onClick={() => setThreadTypeFilter('GROUP')}
                                className={`flex-1 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${threadTypeFilter === 'GROUP' ? 'bg-white text-his-green-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Groups
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto relative">
                    {showUserList && (
                        <div className="absolute inset-0 bg-white z-10 animate-in slide-in-from-left duration-300">
                            <div className="p-4 bg-his-slate-50 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-his-slate-100 flex justify-between items-center">
                                <span>Select Staff Member</span>
                                <button onClick={() => setShowUserList(false)} className="text-slate-300 hover:text-rose-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            {availableUsers.filter(u => u.id !== currentUser.id).map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => startNewChat(user)}
                                    className="p-5 md:p-6 hover:bg-his-slate-50 cursor-pointer border-b border-his-slate-50 flex gap-4 items-center group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-xs group-hover:bg-his-green-50 group-hover:text-his-green-500 transition-all">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-black text-[11px] md:text-xs text-slate-700">{user.name}</p>
                                        <p className="text-[8px] md:text-[9px] font-bold text-his-green-500 uppercase tracking-tighter">{user.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isCreatingGroup && (
                        <div className="absolute inset-0 bg-white z-10 animate-in slide-in-from-left duration-300 flex flex-col">
                            <div className="p-4 bg-his-slate-900 text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest border-b border-his-slate-100 flex justify-between items-center">
                                <span>Create Group Chat</span>
                                <button onClick={() => setIsCreatingGroup(false)} className="text-slate-400 hover:text-white">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="p-6 border-b border-his-slate-50">
                                <input
                                    type="text"
                                    placeholder="Group Name (e.g., Radiology Team)"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-his-green-500/20"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {availableUsers.filter(u => u.id !== currentUser.id).map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleUserSelection(user.id)}
                                        className={`p-5 md:p-6 hover:bg-his-slate-50 cursor-pointer border-b border-his-slate-50 flex gap-4 items-center group ${selectedUsers.includes(user.id) ? 'bg-his-green-50/30' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selectedUsers.includes(user.id) ? 'bg-his-green-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-his-green-50 group-hover:text-his-green-500'}`}>
                                            {selectedUsers.includes(user.id) ? (
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                                            ) : (
                                                <span className="text-[10px] font-black">{user.name.split(' ').map(n => n[0]).join('')}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-[11px] md:text-xs text-slate-700">{user.name}</p>
                                            <p className="text-[8px] md:text-[9px] font-bold text-his-green-500 uppercase tracking-tighter">{user.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-slate-50 border-t border-his-slate-100">
                                <button
                                    onClick={handleCreateGroup}
                                    disabled={!groupName.trim() || selectedUsers.length === 0}
                                    className="w-full py-3.5 md:py-4 bg-his-green-500 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-his-green-500/20 hover:bg-his-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Launch Group ({selectedUsers.length})
                                </button>
                            </div>
                        </div>
                    )}

                    {threads.length === 0 && !showUserList && (
                        <div className="p-10 text-center opacity-40 mt-10">
                            <svg className="w-10 h-10 md:w-12 md:h-12 mx-auto text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No active threads.<br />Start a new conversation.</p>
                        </div>
                    )}

                    {filteredThreads.map((thread) => (
                        <div
                            key={thread.id}
                            onClick={() => setActiveThread(thread.id)}
                            className={`p-5 md:p-6 cursor-pointer transition-all border-b border-his-slate-50 relative group ${activeThread === thread.id ? 'bg-his-slate-50' : 'hover:bg-slate-50/50'}`}
                        >
                            {activeThread === thread.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-his-green-500 rounded-r-full" />
                            )}
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xs md:text-sm shadow-sm transition-transform group-hover:scale-105 ${thread.unread_count > 0 ? 'bg-his-green-50 text-his-green-500' : 'bg-slate-100 text-slate-400'}`}>
                                    {thread.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="font-black text-xs md:text-sm text-slate-900 truncate">{thread.name}</h3>
                                        {thread.unread_count > 0 && (
                                            <span className="w-4 h-4 rounded-full bg-his-green-500 text-white text-[7px] md:text-[8px] flex items-center justify-center font-black animate-bounce">{thread.unread_count}</span>
                                        )}
                                    </div>
                                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{thread.role}</p>
                                    <p className={`text-[11px] md:text-xs truncate ${thread.unread_count > 0 ? 'font-bold text-slate-600' : 'text-slate-400'}`}>
                                        {thread.last_message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-slate-50/30 ${mobileView === 'threads' ? 'hidden md:flex' : 'flex'}`}>
                {activeThread ? (
                    <>
                        <div className="p-5 md:p-8 bg-white/50 backdrop-blur-md border-b border-his-slate-50 flex justify-between items-center sticky top-0 z-20">
                            <div className="flex items-center gap-3 md:gap-4">
                                <button
                                    onClick={() => setMobileView('threads')}
                                    className="flex md:hidden w-8 h-8 items-center justify-center rounded-lg bg-his-slate-100 text-slate-500 active:scale-90 transition-all mr-1"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-[10px] md:text-xs ${currentThread?.type === 'GROUP' ? 'bg-his-slate-900 text-white' : 'bg-his-green-50 text-his-green-500'}`}>
                                    {currentThread?.avatar || '?'}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 leading-none text-sm md:text-base">{currentThread?.name || 'New Conversation'}</h3>
                                    <p className="text-[8px] md:text-[10px] font-bold text-his-green-500 mt-1 uppercase tracking-widest">
                                        {currentThread?.type === 'GROUP' ? 'Group Discussion' : (currentThread?.role || 'Direct Message')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white border border-his-slate-100 flex items-center justify-center text-slate-400 hover:text-his-green-500 hover:shadow-md transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </button>
                            </div>
                        </div>

                        <div ref={scrollRef} className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 md:space-y-8">
                            {messages.map((msg) => {
                                // Use == for ID comparison to handle potential string/number mismatch
                                const isMe = msg.sender_id == currentUser?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className="max-w-[85%] md:max-w-[70%]">
                                            <div className={`p-4 md:p-5 rounded-2xl md:rounded-[2rem] text-[13px] md:text-sm shadow-sm ${isMe
                                                ? 'bg-slate-900 text-white rounded-tr-none'
                                                : 'bg-white text-slate-700 rounded-tl-none border border-his-slate-50'}`}>

                                                {/* Show sender name in Groups if it's not me */}
                                                {currentThread?.type === 'GROUP' && !isMe && (
                                                    <p className="text-[8px] md:text-[9px] font-black text-his-green-500 uppercase mb-1 md:mb-2">
                                                        {msg.sender?.name || 'Staff Member'}
                                                    </p>
                                                )}

                                                {msg.content}
                                            </div>
                                            <p className={`text-[8px] md:text-[10px] font-bold text-slate-400 mt-1.5 md:mt-2 uppercase tracking-widest ${isMe ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSend} className="p-5 md:p-8 bg-white/50 backdrop-blur-md border-t border-his-slate-50 sticky bottom-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="w-full bg-white border-none rounded-2xl py-4 md:py-5 pl-6 md:pl-8 pr-28 md:pr-32 text-xs md:text-sm font-semibold focus:ring-2 focus:ring-his-green-500/20 shadow-md transition-all"
                                />
                                <div className="absolute right-2 top-2 bottom-2 flex gap-2">
                                    <button type="submit" className="px-4 md:px-6 h-full bg-his-green-500 text-white rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-his-green-500/20 hover:bg-his-green-600 transition-all active:scale-95">
                                        Send
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 md:mb-8 border border-white">
                            <svg className="w-10 h-10 md:w-12 md:h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Secure Communications</h3>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-2 max-w-[240px] md:max-w-xs leading-relaxed uppercase tracking-widest">Select a staff member from the left to start a secure internal conversation.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
