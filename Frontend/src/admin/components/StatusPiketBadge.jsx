// src/admin/components/StatusPiketBadge.jsx
// Komponen untuk menampilkan badge status piket

import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const StatusPiketBadge = ({ status }) => {
    const statusConfig = {
        "Selesai": {
            bg: "bg-green-200",
            text: "text-green-900",
            border: "border-green-400",
            icon: <CheckCircle size={16} />
        },
        "Tidak Selesai": {
            bg: "bg-yellow-200",
            text: "text-yellow-900",
            border: "border-yellow-400",
            icon: <AlertCircle size={16} />
        },
        "Tidak Piket": {
            bg: "bg-red-200",
            text: "text-red-900",
            border: "border-red-400",
            icon: <XCircle size={16} />
        }
    };

    const config = statusConfig[status] || statusConfig["Tidak Piket"];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg} ${config.text} border-2 ${config.border} font-medium text-sm`}>
            {config.icon}
            {status}
        </span>
    );
};

export default StatusPiketBadge;
