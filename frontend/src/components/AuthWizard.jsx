import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneStep from './steps/PhoneStep';
import OTPStep from './steps/OTPStep';
import ProfileStep from './steps/ProfileStep';

export default function AuthWizard({ onComplete }) {
    const [step, setStep] = useState(0);

    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    const steps = [
        <PhoneStep onNext={next} key="phone" />,
        <OTPStep onNext={next} onBack={back} key="otp" />,
        <ProfileStep onNext={onComplete} key="profile" />
    ];

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                    {steps[step]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
