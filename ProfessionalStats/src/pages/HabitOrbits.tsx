import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Plane, Sphere } from "@react-three/drei";
import { X, Flame, Shield, TrendingUp } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";
import type { Habit } from "@/types";

/* =========================
   Starfield Background
   ========================= */

function StarfieldBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);
    mountRef.current.appendChild(renderer.domElement);

    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 10000;
    const positions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
        // Limit range for deeper immersion
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    camera.position.z = 10;

    let animationId = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      stars.rotation.y += 0.0001;
      stars.rotation.x += 0.00005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0 bg-black pointer-events-none" />;
}

/* =========================
   Floating Card (Habit)
   ========================= */

function FloatingCard({
  habit,
  position,
  onClick
}: {
  habit: Habit;
  position: { x: number; y: number; z: number; rotationX: number; rotationY: number; rotationZ: number };
  onClick: (h: Habit) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick(habit);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <Plane
        ref={meshRef}
        args={[4.5, 6]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0.01]}
        style={{
          transition: "all 0.3s ease",
          transform: hovered ? "scale(1.15)" : "scale(1)",
          pointerEvents: "none",
        }}
      >
        <div
          className="w-40 h-52 rounded-2xl overflow-hidden shadow-2xl p-4 select-none flex flex-col items-center justify-center relative"
          style={{
            background: "linear-gradient(135deg, rgba(31, 33, 33, 0.4), rgba(10, 15, 30, 0.6))",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: hovered
              ? "0 25px 50px rgba(79, 195, 247, 0.5), 0 0 30px rgba(79, 195, 247, 0.3)"
              : "0 15px 30px rgba(0, 0, 0, 0.6)",
            border: hovered ? "2px solid rgba(79, 195, 247, 0.7)" : "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          {/* Stellar Abstract BG inside Card */}
          <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80')] bg-cover bg-center" />
          
          <div className="relative z-10 flex flex-col items-center">
             <span className="text-5xl mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">{habit.icon}</span>
             <p className="text-white text-md font-bold text-center leading-tight truncate w-full px-2 drop-shadow-md">
                 {habit.name}
             </p>
             <p className="text-xs text-blue-200 mt-2 font-mono tracking-widest uppercase">{habit.category}</p>
          </div>
        </div>
      </Html>
    </group>
  );
}

/* =========================
   Habit Galaxy (Orbit Logic)
   ========================= */

function HabitGalaxy({ habits, onSelectHabit }: { habits: Habit[], onSelectHabit: (h: Habit) => void }) {
  const habitPositions = useMemo(() => {
    const positions = [];
    const numCards = habits.length;
    // Fallback if empty
    if (numCards === 0) return [];
    
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < numCards; i++) {
        // Use a spherical fibonacci distribution for orbits
      const y = 1 - (i / (numCards - 1 || 1)) * 2; 
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = (2 * Math.PI * i) / goldenRatio;
      
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      
      // Calculate layer radius to push items further out based on index modulo grouping
      const layerRadius = 12 + (i % 3) * 5;

      positions.push({
        x: x * layerRadius,
        y: y * layerRadius,
        z: z * layerRadius,
        rotationX: Math.atan2(z, Math.sqrt(x * x + y * y)),
        rotationY: Math.atan2(x, z),
        rotationZ: (Math.random() - 0.5) * 0.2,
      });
    }
    return positions;
  }, [habits]);

  return (
    <>
      {/* Orbital shells (No central planet) */}
      <Sphere args={[12, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4fc3f7" transparent opacity={0.03} wireframe />
      </Sphere>
      <Sphere args={[17, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4fc3f7" transparent opacity={0.02} wireframe />
      </Sphere>
      <Sphere args={[22, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4fc3f7" transparent opacity={0.01} wireframe />
      </Sphere>

      {habits.map((habit, i) => (
        <FloatingCard 
          key={habit.id} 
          habit={habit} 
          position={habitPositions[i]} 
          onClick={onSelectHabit}
        />
      ))}
    </>
  );
}

/* =========================
   Modal for Selected Habit
   ========================= */

function HabitModal({ habit, onClose }: { habit: Habit, onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.5s ease-out";
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={handleBackdropClick}>
      <div className="relative max-w-sm w-full mx-4">
        <button onClick={onClose} className="absolute -top-12 right-0 text-white hover:text-[#4fc3f7] transition-colors z-10">
          <X className="w-8 h-8" />
        </button>

        <div style={{ perspective: "1000px" }} className="w-full">
          <div
            ref={cardRef}
            className="relative cursor-pointer rounded-2xl p-6 transition-all duration-500 ease-out w-full liquid-glass"
            style={{
              transformStyle: "preserve-3d",
              background: "linear-gradient(135deg, rgba(20, 25, 40, 0.8), rgba(10, 15, 30, 0.9))",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2)"
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => {
                if (cardRef.current) cardRef.current.style.transition = 'none';
            }}
          >
            <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#4fc3f7]/20 to-purple-500/20 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(79,195,247,0.3)]">
                    {habit.icon}
                </div>
            </div>

            <h3 className="text-white text-2xl font-bold mb-2 text-center drop-shadow-md">{habit.name}</h3>
            <p className="text-[#4fc3f7] text-center text-sm font-mono tracking-widest mb-6 uppercase">
                {habit.category}
            </p>

            <div className="space-y-4">
              <div className="bg-black/30 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                 <Shield size={20} className="text-[#4fc3f7]" />
                 <div className="flex-1">
                    <p className="text-xs text-slate-400">Nivel de Esfuerzo</p>
                    <p className="text-sm text-white font-mono">{habit.effortLevel} / 10</p>
                 </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                 <Flame size={20} className="text-[#FFD93D]" />
                 <div className="flex-1">
                    <p className="text-xs text-slate-400">Motivación Requerida</p>
                    <p className="text-sm text-white font-mono">{habit.baseMotivation} / 10</p>
                 </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                 <TrendingUp size={20} className="text-emerald-400" />
                 <div className="flex-1">
                    <p className="text-xs text-slate-400">Frecuencia</p>
                    <p className="text-sm text-white font-mono">{habit.isDaily ? 'Diario' : 'Ocasional'}</p>
                 </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
                 {habit.visionBoardTags.length > 0 && (
                     <div className="flex flex-wrap gap-2 justify-center">
                         {habit.visionBoardTags.map(tag => (
                             <span key={tag} className="text-[10px] uppercase font-mono tracking-widest py-1 px-3 rounded-full border border-white/10 text-slate-300">
                                 {tag}
                             </span>
                         ))}
                     </div>
                 )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Main View
   ========================= */

export function HabitOrbits() {
  const { profile } = useProfile();
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const habits = profile.habits || [];

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black text-white">
      {/* Background Layer */}
      <StarfieldBackground />

      {/* Title Overlay */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 drop-shadow-lg font-mono">
            Órbitas de Hábitos
        </h1>
        <p className="text-sm text-blue-200/70 mt-2 font-mono tracking-wider">
            {habits.length > 0 ? `${habits.length} Objetos estelares en gravedad` : 'No hay hábitos gravitando. Visita La Forja.'}
        </p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Arrastra para rotar la cámara. Scroll para zoom. Clickea un hábito orbital para inspeccionarlo.
        </p>
      </div>

      {/* 3D Canvas */}
      {habits.length > 0 && (
          <Canvas
            camera={{ position: [0, 5, 25], fov: 60 }}
            className="absolute inset-0 z-10"
            onCreated={({ gl }) => {
              gl.domElement.style.pointerEvents = "auto";
            }}
          >
            <Suspense fallback={null}>
              <Environment preset="night" />
              <ambientLight intensity={0.4} />
              <pointLight position={[10, 10, 10]} intensity={0.6} />
              <pointLight position={[-10, -10, -10]} intensity={0.3} />
              
              <HabitGalaxy habits={habits} onSelectHabit={setSelectedHabit} />
              
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={5}
                maxDistance={50}
                autoRotate={true}
                autoRotateSpeed={0.3}
                rotateSpeed={0.5}
                zoomSpeed={1.2}
                panSpeed={0.8}
                target={[0, 0, 0]}
              />
            </Suspense>
          </Canvas>
      )}

      {/* Selected Habit Detail */}
      {selectedHabit && (
          <HabitModal habit={selectedHabit} onClose={() => setSelectedHabit(null)} />
      )}
    </div>
  );
}
