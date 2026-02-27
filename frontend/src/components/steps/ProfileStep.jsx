import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const questions = [
    {
        id: 'name',
        label: "What should I call you?",
        placeholder: "Your Name",
        type: "text"
    },
    {
        id: 'age',
        label: "How old are you?",
        placeholder: "Age",
        type: "number"
    },
    {
        id: 'tone',
        label: "How should I speak to you?",
        options: ["Soft & Gentle", "Energetic", "Formal", "Casual"]
    }
];

export default function ProfileStep({ onNext }) {
    const [currentQ, setCurrentQ] = useState(0);
    const question = questions[currentQ];

    const handleNext = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(currentQ + 1);
        } else {
            onNext();
        }
    };

    return (
        <div className="flex flex-col h-96 justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQ}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col space-y-8"
                >
                    <h2 className="text-4xl font-serif font-bold text-sage">{question.label}</h2>

                    {question.options ? (
                        <div className="grid grid-cols-2 gap-4">
                            {question.options.map(opt => (
                                <button key={opt} onClick={handleNext} className="p-4 text-xl border-2 border-sage/20 rounded-xl hover:bg-sage hover:text-white transition-all text-left">
                                    {opt}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <input
                            type={question.type}
                            placeholder={question.placeholder}
                            className="w-full text-3xl bg-transparent border-b-2 border-sage/30 py-4 focus:outline-none focus:border-sage placeholder-sage/30 transition-colors"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        />
                    )}

                    {!question.options && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNext}
                            className="w-full bg-clay text-white text-xl font-medium py-4 rounded-2xl shadow-lg shadow-clay/20 hover:shadow-xl hover:bg-[#b06a4b] transition-all"
                        >
                            Continue
                        </motion.button>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
