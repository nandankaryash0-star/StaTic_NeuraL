import React from 'react';
import { motion } from 'framer-motion';

export default function OTPStep({ onNext, onBack }) {
    return (
        <div className="flex flex-col space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <button onClick={onBack} className="text-sm font-medium text-sage mb-4 hover:underline">
                    ← Back
                </button>
                <h2 className="text-4xl font-serif font-bold text-sage mb-2">Enter Code</h2>
                <p className="text-lg text-charcoal/80">We sent a 4-digit code to your phone.</p>
            </motion.div>

            <div className="flex gap-4 justify-center">
                {[0, 1, 2, 3].map((i) => (
                    <input
                        key={i}
                        type="text"
                        maxLength={1}
                        className="w-16 h-20 text-center text-4xl bg-cream border-2 border-sage/20 rounded-xl focus:border-sage focus:outline-none transition-colors"
                    />
                ))}
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNext}
                className="w-full bg-sage text-white text-xl font-medium py-4 rounded-2xl shadow-lg shadow-sage/20 hover:shadow-xl hover:bg-[#5b7a1e] transition-all"
            >
                Verify
            </motion.button>

            <button className="text-center text-sm text-sage font-medium hover:underline">
                Resend code
            </button>
        </div>
    );
}
