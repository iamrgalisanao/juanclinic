import React, { useState } from 'react';

const SDEForm = ({ config, value = {}, onChange }) => {
    const [activeSystemId, setActiveSystemId] = useState(config.systems[0]?.id || null);

    const activeSystem = config.systems.find(s => s.id === activeSystemId);
    const systemData = value[activeSystemId] || { symptoms: {}, remarks: '', wnl: false };

    const handleSymptomToggle = (symptomId) => {
        const newSystemData = { ...systemData, wnl: false }; // Clear WNL if specific symptom is checked
        if (newSystemData.symptoms[symptomId]) {
            delete newSystemData.symptoms[symptomId];
        } else {
            newSystemData.symptoms[symptomId] = { selected: true, modifiers: {} };
        }
        onChange(activeSystemId, newSystemData);
    };

    const handleModifierChange = (symptomId, modifierId, modifierValue) => {
        const newSystemData = { ...systemData };
        if (!newSystemData.symptoms[symptomId]) return;

        newSystemData.symptoms[symptomId].modifiers = {
            ...newSystemData.symptoms[symptomId].modifiers,
            [modifierId]: modifierValue
        };
        onChange(activeSystemId, newSystemData);
    };

    const handleRemarksChange = (val) => {
        const newSystemData = { ...systemData, remarks: val };
        onChange(activeSystemId, newSystemData);
    };

    const toggleWNL = () => {
        const newIsWNL = !systemData.wnl;
        const newSystemData = { 
            symptoms: {}, // Clear specific symptoms if setting WNL
            remarks: systemData.remarks,
            wnl: newIsWNL 
        };
        onChange(activeSystemId, newSystemData);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {/* System Tabs */}
            <div className="flex bg-slate-50 border-b border-slate-200 overflow-x-auto scrollbar-hide">
                {config.systems.map((system) => {
                    const hasSelections = value[system.id] && (Object.keys(value[system.id].symptoms || {}).length > 0 || value[system.id].wnl);
                    return (
                        <button
                            key={system.id}
                            onClick={() => setActiveSystemId(system.id)}
                            className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                                activeSystemId === system.id
                                    ? 'bg-white border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {system.label}
                            {hasSelections && (
                                <span className={`ml-2 w-2 h-2 rounded-full inline-block ${value[system.id]?.wnl ? 'bg-indigo-400' : 'bg-emerald-500'}`} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="p-5 min-h-[400px]">
                {activeSystem ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                        {/* WNL Header Toggle */}
                        <div className="flex justify-between items-center bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-indigo-900">{activeSystem.label} Status</span>
                                <span className="text-[10px] text-indigo-400 font-medium">Mapped to {activeSystem.concept_id}</span>
                            </div>
                            <button
                                onClick={toggleWNL}
                                className={`px-4 py-2 rounded-lg text-xs font-black transition-all border flex items-center gap-2 ${
                                    systemData.wnl 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                                        : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                                }`}
                            >
                                {systemData.wnl ? (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                                        WITHIN NORMAL LIMITS (WNL)
                                    </>
                                ) : (
                                    'MARK SYSTEM NORMAL (WNL)'
                                )}
                            </button>
                        </div>

                        {!systemData.wnl ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeSystem.symptoms.map((symptom) => {
                                    const isSelected = !!systemData.symptoms[symptom.id];
                                    return (
                                        <div key={symptom.id} className={`p-4 rounded-xl border transition-all ${
                                            isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'
                                        }`}>
                                            <div className="flex items-start justify-between">
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSymptomToggle(symptom.id)}
                                                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                                            {symptom.label}
                                                        </span>
                                                        <span className="text-[8px] font-mono text-slate-400">{symptom.concept_id}</span>
                                                    </div>
                                                </label>
                                            </div>

                                            {isSelected && symptom.modifiers && symptom.modifiers.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-indigo-100 grid grid-cols-1 gap-3 animate-in fade-in zoom-in-95 duration-200">
                                                    {symptom.modifiers.map((mod) => (
                                                        <div key={mod.id} className="flex flex-col gap-1">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{mod.label}</span>
                                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                                {mod.options.map((opt) => (
                                                                    <button
                                                                        key={opt}
                                                                        onClick={() => handleModifierChange(symptom.id, mod.id, opt)}
                                                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                                                            systemData.symptoms[symptom.id].modifiers[mod.id] === opt
                                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                                                : 'bg-white border-indigo-100 text-indigo-400 hover:bg-indigo-50'
                                                                        }`}
                                                                    >
                                                                        {opt}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-10 bg-indigo-50/30 rounded-2xl border border-dashed border-indigo-200 animate-in fade-in zoom-in-95 duration-500">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-indigo-100 mb-4">
                                    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-black text-indigo-900 tracking-tight">System Within Normal Limits</h3>
                                <p className="text-sm text-indigo-400 font-medium text-center mt-2 max-w-xs">
                                    All constituent symptoms for {activeSystem.label} are marked as negative.
                                </p>
                            </div>
                        )}

                        {/* Remarks Fallback */}
                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                {activeSystem.label} Remarks / Nuances
                            </label>
                            <textarea
                                value={systemData.remarks || ''}
                                onChange={(e) => handleRemarksChange(e.target.value)}
                                placeholder={`Add specific ${activeSystem.label.toLowerCase()} details not covered by selections...`}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all min-h-[80px]"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-[200px] text-slate-400 text-sm font-medium">
                        Select a system from the tabs above to begin structured entry.
                    </div>
                )}
            </div>
            
            {/* Feedback Footer */}
            <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                        Hardened SDE Mode
                    </span>
                    <div className="h-3 w-[1px] bg-slate-700" />
                    <span className="text-[9px] font-mono text-slate-500 uppercase">
                        SNOMED CT / ICD-10 Mapped
                    </span>
                </div>
                <span className="text-[10px] font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    Discrete Data Engine Active
                </span>
            </div>
        </div>
    );
};

export default SDEForm;
