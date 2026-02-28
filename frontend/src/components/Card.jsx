import React from 'react';

const Card = ({ children, title }) => (
    <div className="glass p-6 rounded-2xl">
        {title && <h3 className="text-xl font-semibold mb-4 text-blue-400">{title}</h3>}
        {children}
    </div>
);

export default Card;
