// components/LoadingOverlay.jsx
import React from 'react';

const LoadingOverlay = ({
    isLoading,
    message = 'Memuat...',
    fullScreen = true,
    transparent = false
}) => {
    if (!isLoading) return null;

    const overlayClass = fullScreen
        ? 'fixed inset-0 z-50'
        : 'absolute inset-0 z-10';

    const bgClass = transparent
        ? 'bg-white bg-opacity-70'
        : 'bg-black bg-opacity-50';

    return (
        <div className={`${overlayClass} ${bgClass} flex items-center justify-center`}>
            <div className="bg-white p-6 rounded-xl shadow-2xl border-2 border-gray-200 max-w-sm w-full mx-4">
                <div className="flex flex-col items-center">
                    {/* Spinner */}
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
                    </div>

                    {/* Message */}
                    <p className="mt-4 text-gray-700 font-medium text-center">
                        {message}
                    </p>

                    {/* Optional sub-message */}
                    <p className="mt-2 text-sm text-gray-500 text-center">
                        Mohon tunggu sebentar...
                    </p>
                </div>
            </div>
        </div>
    );
};

// Loading spinner component (smaller, inline version)
export const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-4',
        xl: 'h-16 w-16 border-4'
    };

    const colorClasses = {
        blue: 'border-blue-500',
        green: 'border-green-500',
        red: 'border-red-500',
        gray: 'border-gray-500'
    };

    return (
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-gray-200`}>
            <div className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} border-t-transparent absolute`}></div>
        </div>
    );
};

// Loading skeleton component
export const LoadingSkeleton = ({ count = 1, height = 'h-4', className = '' }) => {
    return (
        <div className={`space-y-3 ${className}`}>
            {[...Array(count)].map((_, index) => (
                <div
                    key={index}
                    className={`${height} bg-gray-200 rounded animate-pulse`}
                ></div>
            ))}
        </div>
    );
};

// Loading card skeleton
export const LoadingCard = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 animate-pulse">
            <div className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
        </div>
    );
};

// Loading table skeleton
export const LoadingTable = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
            {/* Table header */}
            <div className="bg-gray-50 border-b-2 border-gray-200 p-4">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {[...Array(columns)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-gray-200">
                {[...Array(rows)].map((_, rowIndex) => (
                    <div key={rowIndex} className="p-4">
                        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                            {[...Array(columns)].map((_, colIndex) => (
                                <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LoadingOverlay;
