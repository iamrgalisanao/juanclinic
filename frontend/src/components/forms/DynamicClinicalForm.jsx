import React from 'react';

const DynamicClinicalForm = ({ schema, formData, onChange }) => {
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        onChange(name, type === 'number' ? parseFloat(value) : value);
    };

    return (
        <div className="space-y-4">
            {schema.map((field) => (
                <div key={field.name} className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>

                    {field.type === 'textarea' ? (
                        <textarea
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleInputChange}
                            required={field.required}
                        />
                    ) : field.type === 'select' ? (
                        <select
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white"
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleInputChange}
                            required={field.required}
                        >
                            <option value="">-- Select Option --</option>
                            {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={field.type}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleInputChange}
                            required={field.required}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default DynamicClinicalForm;
