import React, { createContext, useContext, useState, useCallback } from 'react';

const DialogContext = createContext();

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};

export const DialogProvider = ({ children }) => {
    const [dialog, setDialog] = useState({
        isOpen: false,
        type: 'ALERT', // 'ALERT' | 'CONFIRM' | 'PROMPT'
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        inputValue: '',
        onResolve: null,
    });

    const closeDialog = useCallback((value) => {
        setDialog(prev => ({ ...prev, isOpen: false }));
        if (dialog.onResolve) {
            dialog.onResolve(value);
        }
    }, [dialog]);

    const showDialog = useCallback((type, options) => {
        return new Promise((resolve) => {
            setDialog({
                isOpen: true,
                type,
                title: options.title || (type === 'ALERT' ? 'Notice' : type === 'CONFIRM' ? 'Confirm Action' : 'Input Required'),
                message: options.message || '',
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                inputValue: options.defaultValue || '',
                onResolve: resolve,
            });
        });
    }, []);

    const alert = (options) => {
        const msg = typeof options === 'string' ? { message: options } : options;
        return showDialog('ALERT', msg);
    };

    const confirm = (options) => {
        const msg = typeof options === 'string' ? { message: options } : options;
        return showDialog('CONFIRM', msg);
    };

    const prompt = (options) => {
        const msg = typeof options === 'string' ? { message: options } : options;
        return showDialog('PROMPT', msg);
    };

    const setPromptValue = (val) => {
        setDialog(prev => ({ ...prev, inputValue: val }));
    };

    return (
        <DialogContext.Provider value={{ alert, confirm, prompt, dialog, closeDialog, setPromptValue }}>
            {children}
        </DialogContext.Provider>
    );
};
