import React from 'react';

export default function Layout({ leftContent, rightContent }) {
    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-cream text-charcoal">
            {/* Left Side - Avatar / Visuals */}
            <div className="relative hidden w-1/2 lg:flex lg:flex-col lg:items-center lg:justify-center bg-cream">
                <div className="absolute inset-0 z-0">
                    {/* Background decoration or 3D view container */}
                    {leftContent}
                </div>
            </div>

            {/* Right Side - Auth / Interactions */}
            <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
                <div className="w-full max-w-xl">
                    {rightContent}
                </div>
            </div>
        </div>
    );
}
