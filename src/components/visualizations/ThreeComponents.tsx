'use client'

import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// Helper to convert HSL string to THREE.Color
const hslToThreeColor = (hslString: string): THREE.Color => {
  // Parse HSL string
  const hslMatch = hslString.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/) || 
                  hslString.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%(?:\s+\/\s+([\d.]+))?\)/)
  
  if (!hslMatch) {
    return new THREE.Color('#ffffff')
  }
  
  const h = parseInt(hslMatch[1]) / 360
  const s = parseInt(hslMatch[2]) / 100
  const l = parseInt(hslMatch[3]) / 100
  
  // Convert HSL to RGB
  const color = new THREE.Color()
  color.setHSL(h, s, l)
  return color
}

// Particles component
function Particles({ traits, count = 50 }) {
  const { openness = 3, conscientiousness = 3, extraversion = 3, agreeableness = 3, neuroticism = 3 } = traits || {}
  
  // Create particles
  const particlesRef = useRef<THREE.Points>(null)
  const [positions, setPositions] = useState<Float32Array | null>(null)
  const [sizes, setSizes] = useState<Float32Array | null>(null)
  const [colors, setColors] = useState<Float32Array | null>(null)
  
  // Generate particles based on traits
  useEffect(() => {
    const particleCount = Math.floor(20 + extraversion * 10)
    const posArray = new Float32Array(particleCount * 3)
    const sizeArray = new Float32Array(particleCount)
    const colorArray = new Float32Array(particleCount * 3)
    
    // Trait colors
    const traitColors = [
      new THREE.Color(0x9c27b0), // Purple for openness
      new THREE.Color(0x4caf50), // Green for conscientiousness
      new THREE.Color(0x2196f3), // Blue for extraversion
      new THREE.Color(0xffc107), // Yellow for agreeableness
      new THREE.Color(0xff5722), // Orange for emotional stability
    ]
    
    for (let i = 0; i < particleCount; i++) {
      // Random position in a sphere
      const radius = 1.2 + Math.random() * 0.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      posArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      posArray[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      posArray[i * 3 + 2] = radius * Math.cos(phi)
      
      // Size based on conscientiousness (more organized = more uniform)
      sizeArray[i] = (0.03 + Math.random() * 0.05) * (6 - conscientiousness) / 3
      
      // Color based on traits
      const traitValues = [openness, conscientiousness, extraversion, agreeableness, 6 - neuroticism]
      const maxTraitIndex = traitValues.indexOf(Math.max(...traitValues))
      
      // Add some randomness to color selection
      const colorIndex = Math.random() < 0.7 ? maxTraitIndex : Math.floor(Math.random() * traitColors.length)
      
      // Sometimes use white for sparkle effect
      if (Math.random() < 0.3) {
        colorArray[i * 3] = 1
        colorArray[i * 3 + 1] = 1
        colorArray[i * 3 + 2] = 1
      } else {
        const color = traitColors[colorIndex]
        colorArray[i * 3] = color.r
        colorArray[i * 3 + 1] = color.g
        colorArray[i * 3 + 2] = color.b
      }
    }
    
    setPositions(posArray)
    setSizes(sizeArray)
    setColors(colorArray)
  }, [openness, conscientiousness, extraversion, agreeableness, neuroticism])
  
  // Animate particles
  useFrame(({ clock }) => {
    if (!particlesRef.current) return
    
    const time = clock.getElapsedTime()
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3
      
      // Add subtle oscillation to each particle
      const x = positions[i3]
      const y = positions[i3 + 1]
      const z = positions[i3 + 2]
      
      const distance = Math.sqrt(x * x + y * y + z * z)
      const normalizedX = x / distance
      const normalizedY = y / distance
      const normalizedZ = z / distance
      
      // Oscillate based on time and position
      const oscillation = Math.sin(time * 0.5 + i * 0.1) * 0.05
      
      positions[i3] = normalizedX * (distance + oscillation)
      positions[i3 + 1] = normalizedY * (distance + oscillation)
      positions[i3 + 2] = normalizedZ * (distance + oscillation)
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  if (!positions || !sizes || !colors) return null
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        sizeAttenuation
        vertexColors
        transparent
        alphaTest={0.01}
        depthWrite={false}
      />
    </points>
  )
}

// Main Orb component
function Orb({ traits, animated = true }) {
  const { openness = 3, conscientiousness = 3, extraversion = 3, agreeableness = 3, neuroticism = 3 } = traits || {}
  
  // References
  const sphereRef = useRef<THREE.Mesh>(null)
  
  // Calculate colors based on traits
  const coreColor = new THREE.Color(0x2196f3) // Blue base for extraversion
  const rimColor = new THREE.Color(0xff5722) // Orange base for neuroticism
  const distortFactor = 0.2 // Simplified distortion
  
  // Animation
  useFrame(({ clock }) => {
    if (!sphereRef.current || !animated) return
    
    const time = clock.getElapsedTime()
    
    // Subtle pulsing effect
    const pulseScale = 1 + Math.sin(time * 0.8) * 0.03
    // Secondary pulse with different frequency for more organic feel
    const secondaryPulse = 1 + Math.sin(time * 1.2) * 0.015
    
    // Combined pulse effect
    const combinedPulse = pulseScale * secondaryPulse
    
    sphereRef.current.scale.set(combinedPulse, combinedPulse, combinedPulse)
    
    // Rotate slowly
    sphereRef.current.rotation.y = time * 0.1
  })
  
  return (
    <>
      {/* Core sphere */}
      <Sphere ref={sphereRef} args={[0.8, 64, 64]}>
        <meshPhysicalMaterial
          color={coreColor}
          roughness={0.2}
          metalness={0.8}
          emissive={coreColor}
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      {/* Outer glow sphere */}
      <Sphere args={[0.9, 32, 32]}>
        <meshBasicMaterial
          color={rimColor}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </Sphere>
      
      {/* Particles */}
      <Particles traits={traits} />
    </>
  )
}

// Scene setup with effects
function Scene({ traits, animated, interactive }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4]} />
      {interactive && <OrbitControls enableZoom={false} enablePan={false} />}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Orb traits={traits} animated={animated} />
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          height={300}
        />
      </EffectComposer>
    </>
  )
}

// Main component
export default function ThreeComponents({
  traits,
  animated = true,
  interactive = true,
  size = 200,
}) {
  return (
    <Canvas
      style={{ width: size, height: size }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4], fov: 50 }}
    >
      <Scene traits={traits} animated={animated} interactive={interactive} />
    </Canvas>
  )
}
