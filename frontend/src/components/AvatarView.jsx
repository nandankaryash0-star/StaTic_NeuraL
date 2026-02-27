import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, OrbitControls } from '@react-three/drei';

function AnimatedSphere() {
    const sphereRef = useRef();

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (sphereRef.current) {
            sphereRef.current.distort = 0.4 + Math.sin(t) * 0.1;
        }
    });

    return (
        <Sphere visible args={[1, 100, 200]} scale={2.2} ref={sphereRef}>
            <MeshDistortMaterial
                color="#6B8E23" // Sage Green
                attach="material"
                distort={0.4}
                speed={1.5}
                roughness={0.4}
            />
        </Sphere>
    );
}

export default function AvatarView() {
    return (
        <div className="h-full w-full">
            <Canvas className="h-full w-full" camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#D27D59" /> {/* Clay tint */}

                <AnimatedSphere />

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
}
