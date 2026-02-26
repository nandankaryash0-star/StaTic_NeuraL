import React from 'react';
import { motion } from 'framer-motion';

export default function PhoneStep({ onNext }) {
    return (
        <div className="flex flex-col space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-4xl font-serif font-bold text-sage mb-2">Welcome to Sarthi</h2>
                <p className="text-lg text-charcoal/80">Your companion is waiting. Let's start with your number.</p>
            </motion.div>

            <div className="space-y-4">
                <div className="relative">
                    <label htmlFor="phone" className="sr-only">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        className="w-full text-3xl bg-transparent border-b-2 border-sage/30 py-4 focus:outline-none focus:border-sage placeholder-sage/30 transition-colors"
                        placeholder="+1 (555) 000-0000"
                        autoFocus
                    />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNext}
                    className="w-full bg-sage text-white text-xl font-medium py-4 rounded-2xl shadow-lg shadow-sage/20 hover:shadow-xl hover:bg-[#5b7a1e] transition-all"
                >
                    Send Code
                </motion.button>
            </div>

            <p className="text-center text-sm text-charcoal/50">
                By continuing, you agree to our Terms & Privacy Policy.
            </p>
        </div>
    );
}
