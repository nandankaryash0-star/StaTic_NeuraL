import React from 'react';

export default function ProfilePage() {
    return (
        <div className="flex-1 p-8 max-w-4xl mx-auto w-full bg-cream">
            <h1 className="text-4xl font-serif font-bold text-sage mb-8">Your Profile</h1>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage/10 space-y-4">
                <div className="flex justify-between border-b border-gray-100 pb-4">
                    <span className="text-charcoal/60">Phone</span>
                    <span className="font-medium text-charcoal">{localStorage.getItem('sarthi_phone') || 'Not Connected'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-4">
                    <span className="text-charcoal/60">Subscription</span>
                    <span className="font-medium text-sage">Free Plan</span>
                </div>
            </div>
        </div>
    );
}
