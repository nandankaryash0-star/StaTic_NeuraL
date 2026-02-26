import VoiceInterface from "@/components/voice/VoiceInterface";
import VoiceInput from "@/components/voice/VoiceInput";

export default function Home() {
    return (
        <main className="min-h-screen bg-[var(--bg-primary)]">
            <VoiceInterface />
            <VoiceInput />
        </main>
    );
}
