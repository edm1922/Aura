'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
// Import OrbitControls from the correct path in Three.js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface SimpleThreeOrbProps {
  traits?: {
    openness?: number
    conscientiousness?: number
    extraversion?: number
    agreeableness?: number
    neuroticism?: number
  }
  size?: number
  animated?: boolean
  interactive?: boolean
}

export default function SimpleThreeOrb({
  traits = {},
  size = 200,
  animated = true,
  interactive = true,
}: SimpleThreeOrbProps) {
  // Add hover state
  const [isHovered, setIsHovered] = useState(false)
  // Add state for core color
  const [coreColorRGB, setCoreColorRGB] = useState({ r: 100, g: 150, b: 200 })

  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const orbRef = useRef<THREE.Mesh | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const frameIdRef = useRef<number>(0)

  // Extract trait values with defaults
  const {
    openness = 3,
    conscientiousness = 3,
    extraversion = 3,
    agreeableness = 3,
    neuroticism = 3,
  } = traits

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    // Clean up previous instance if it exists
    if (rendererRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
      containerRef.current.removeChild(rendererRef.current.domElement)
    }

    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current)
    }

    // Create scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Add environment map for reflections - create a simple environment map
    const envMapTexture = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=')
    const envMap = new THREE.WebGLCubeRenderTarget(128).texture
    scene.environment = envMap

    // Create camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
    camera.position.z = 4
    cameraRef.current = camera

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    renderer.setSize(size, size)
    renderer.setClearColor(0x000000, 0) // Transparent background
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Add controls if interactive or if in shared view
    const isSharedView = window.location.pathname.includes('/shared/');
    if (interactive || isSharedView) {
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.enableZoom = false
      controls.enablePan = false
      controlsRef.current = controls
    }

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)

    // Create core orb
    const coreColor = new THREE.Color(
      0.2 + extraversion * 0.1,
      0.4 + conscientiousness * 0.1,
      0.7 + (5 - neuroticism) * 0.05
    )

    // Update the core color state for use in the JSX
    setCoreColorRGB({
      r: Math.round(coreColor.r * 255),
      g: Math.round(coreColor.g * 255),
      b: Math.round(coreColor.b * 255)
    })

    const geometry = new THREE.SphereGeometry(0.8, 64, 64) // Higher resolution sphere
    const material = new THREE.MeshPhysicalMaterial({
      color: coreColor,
      roughness: 0.1, // More reflective
      metalness: 0.9, // More metallic
      emissive: coreColor,
      emissiveIntensity: 0.6, // Stronger glow
      clearcoat: 0.5, // Add clearcoat for more shine
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.5, // Stronger environment reflections
    })

    const orb = new THREE.Mesh(geometry, material)
    scene.add(orb)
    orbRef.current = orb

    // Create outer glow
    const rimColor = new THREE.Color(
      0.8 + (5 - neuroticism) * 0.04,
      0.4 + agreeableness * 0.1,
      0.2 + openness * 0.1
    )

    const outerGeometry = new THREE.SphereGeometry(0.9, 32, 32)
    const outerMaterial = new THREE.MeshBasicMaterial({
      color: rimColor,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    })

    const outerOrb = new THREE.Mesh(outerGeometry, outerMaterial)
    scene.add(outerOrb)

    // Create particles - use a minimal count for an extremely calm effect
    const particleCount = Math.floor(80 + extraversion * 15) // Minimal particle count for very calm effect
    const particleGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    // Soft, pastel trait colors for a calmer, more ethereal effect
    const traitColors = [
      new THREE.Color(0xe0b0ff), // Soft lavender for openness
      new THREE.Color(0xa0e0c0), // Gentle mint green for conscientiousness
      new THREE.Color(0xa0d0ff), // Pale sky blue for extraversion
      new THREE.Color(0xffe0b0), // Soft peach for agreeableness
      new THREE.Color(0xffb0d0), // Gentle rose for emotional stability
    ]

    for (let i = 0; i < particleCount; i++) {
      // Position particles to create a gentle attraction effect toward the center
      // Use a distribution that concentrates particles closer to the orb
      // This creates the appearance of particles being drawn to the center
      const randomFactor = Math.pow(Math.random(), 1.5) // Power > 1 biases toward smaller values
      const radius = 0.9 + randomFactor * 1.0 // Tighter radius range with bias toward inner values
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      particlePositions[i * 3 + 2] = radius * Math.cos(phi)

      // Color based on traits
      const traitValues = [openness, conscientiousness, extraversion, agreeableness, 6 - neuroticism]
      const maxTraitIndex = traitValues.indexOf(Math.max(...traitValues))

      // Add some randomness to color selection
      const colorIndex = Math.random() < 0.6 ? maxTraitIndex : Math.floor(Math.random() * traitColors.length)

      // Use a mix of soft white and trait-colored particles for a gentle effect
      if (Math.random() < 0.6) { // Reduced chance of white particles
        // Soft white particles with reduced brightness for a more subtle effect
        const whiteness = 0.85 // Slightly off-white for a softer look
        particleColors[i * 3] = whiteness
        particleColors[i * 3 + 1] = whiteness
        particleColors[i * 3 + 2] = whiteness
      } else {
        const color = traitColors[colorIndex]
        // Keep colors at their natural brightness for a softer look
        particleColors[i * 3] = color.r
        particleColors[i * 3 + 1] = color.g
        particleColors[i * 3 + 2] = color.b
      }
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    // Create a simple circle texture for particles
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    const ctx = particleCanvas.getContext('2d');

    if (ctx) {
      // Draw a bright white circle with a soft edge
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }

    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.15, // Even smaller particles for an extremely calm effect
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      alphaTest: 0.01,
      depthWrite: false,
      map: particleTexture, // Add texture for better glow effect
      blending: THREE.AdditiveBlending, // Add additive blending for glow effect
      opacity: 0.5, // Very low opacity for an extremely subtle, ethereal look
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)
    particlesRef.current = particles

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate)

      if (animated) {
        const time = performance.now() * 0.001 // Convert to seconds

        // Animate orb
        if (orbRef.current && !isHovered) { // Only apply pulse animation when not hovered
          // Enhanced pulsing effect with multiple frequencies
          const pulseScale = 1 + Math.sin(time * 0.8) * 0.04
          // Secondary pulse with different frequency for more organic feel
          const secondaryPulse = 1 + Math.sin(time * 1.2) * 0.02
          // Tertiary pulse for even more organic movement
          const tertiaryPulse = 1 + Math.sin(time * 0.5) * 0.01

          // Combined pulse effect
          const combinedPulse = pulseScale * secondaryPulse * tertiaryPulse

          orbRef.current.scale.set(combinedPulse, combinedPulse, combinedPulse)
        }

        // Always rotate the orb, even when hovered
        if (orbRef.current) {
          // Rotate with varying speeds on different axes for more dynamic movement
          orbRef.current.rotation.y = time * 0.15
          orbRef.current.rotation.x = Math.sin(time * 0.1) * 0.05
          orbRef.current.rotation.z = Math.cos(time * 0.08) * 0.03
        }

        // Animate particles with gentle attraction to the center
        if (particlesRef.current) {
          const positions = (particlesRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array

          for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3

            // Get current position
            const x = positions[i3]
            const y = positions[i3 + 1]
            const z = positions[i3 + 2]

            // Calculate distance from center
            const distance = Math.sqrt(x * x + y * y + z * z)

            // Normalize direction vectors
            const normalizedX = x / distance
            const normalizedY = y / distance
            const normalizedZ = z / distance

            // Create an extremely gentle breathing effect
            // Use ultra-slow frequency for almost imperceptible movement
            const breathingFrequency = 0.05 // Half the previous speed
            const breathingAmplitude = isHovered ? 0.03 : 0.015 // Reduced amplitude

            // Simple sine wave for extremely subtle breathing
            const breathing = Math.sin(time * breathingFrequency + i * 0.02) * breathingAmplitude

            // Calculate ideal distance - particles closer to center move less
            // This creates the attraction effect - particles seem to be drawn to the center
            // Use a deterministic value based on particle index instead of random to prevent jitter
            const baseDistance = 1.2 + (i % 10) * 0.05 // Base distance from center, varies by particle
            const targetDistance = baseDistance + breathing

            // Very slowly interpolate current distance toward target distance
            // This creates extremely slow, dreamy movement
            const interpolationSpeed = 0.0005 // Extremely slow movement
            const newDistance = distance + (targetDistance - distance) * interpolationSpeed

            // Apply extremely subtle rotation (barely perceptible)
            const rotationSpeed = 0.005 // Ultra-slow rotation
            const angle = time * rotationSpeed
            const rotatedX = normalizedX * Math.cos(angle) - normalizedZ * Math.sin(angle)
            const rotatedZ = normalizedX * Math.sin(angle) + normalizedZ * Math.cos(angle)

            // Update positions with new calculated values
            positions[i3] = rotatedX * newDistance
            positions[i3 + 1] = normalizedY * newDistance
            positions[i3 + 2] = rotatedZ * newDistance
          }

          particlesRef.current.geometry.attributes.position.needsUpdate = true
        }
      }

      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update()
      }

      // Render
      renderer.render(scene, camera)
    }

    animate()

    // Cleanup function
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }

      if (rendererRef.current && containerRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }

      // Dispose of geometries and materials
      if (orbRef.current) {
        orbRef.current.geometry.dispose()
        if (orbRef.current.material) {
          if (Array.isArray(orbRef.current.material)) {
            orbRef.current.material.forEach(material => material.dispose())
          } else {
            orbRef.current.material.dispose()
          }
        }
      }

      if (particlesRef.current) {
        particlesRef.current.geometry.dispose()
        if (particlesRef.current.material) {
          if (Array.isArray(particlesRef.current.material)) {
            particlesRef.current.material.forEach(material => material.dispose())
          } else {
            particlesRef.current.material.dispose()
          }
        }
      }
    }
  }, [size, animated, interactive, openness, conscientiousness, extraversion, agreeableness, neuroticism, isHovered])



  // Handle hover effects
  useEffect(() => {
    if (!orbRef.current || !particlesRef.current) return

    // Enhanced hover effects
    if (isHovered) {
      // Scale up more significantly when hovered
      orbRef.current.scale.set(1.08, 1.08, 1.08)

      // Increase emissive intensity for a stronger glow effect
      if (orbRef.current.material && !Array.isArray(orbRef.current.material)) {
        if ('emissiveIntensity' in orbRef.current.material) {
          orbRef.current.material.emissiveIntensity = 1.0
        }

        // Increase metalness for more reflectivity
        if ('metalness' in orbRef.current.material) {
          orbRef.current.material.metalness = 1.0
        }

        // Decrease roughness for more shine
        if ('roughness' in orbRef.current.material) {
          orbRef.current.material.roughness = 0.05
        }
      }

      // Make particles only very slightly larger and brighter on hover, maintaining calm
      if (particlesRef.current.material && !Array.isArray(particlesRef.current.material)) {
        if ('size' in particlesRef.current.material) {
          particlesRef.current.material.size = 0.18 // Just barely larger particles on hover
        }

        // Very slightly increase opacity for a gentle glow
        if ('opacity' in particlesRef.current.material) {
          particlesRef.current.material.opacity = 0.6
        }
      }

      // Move camera slightly closer for a zoom effect if interactive
      if (interactive && cameraRef.current) {
        cameraRef.current.position.z = 3.5
      }
    } else {
      // Reset to normal scale (animation will handle the pulsing)
      orbRef.current.scale.set(1, 1, 1)

      // Reset material properties
      if (orbRef.current.material && !Array.isArray(orbRef.current.material)) {
        if ('emissiveIntensity' in orbRef.current.material) {
          orbRef.current.material.emissiveIntensity = 0.6
        }

        if ('metalness' in orbRef.current.material) {
          orbRef.current.material.metalness = 0.9
        }

        if ('roughness' in orbRef.current.material) {
          orbRef.current.material.roughness = 0.1
        }
      }

      // Reset particle properties to an extremely calm, subtle state
      if (particlesRef.current.material && !Array.isArray(particlesRef.current.material)) {
        if ('size' in particlesRef.current.material) {
          particlesRef.current.material.size = 0.15 // Very small particles for an extremely calm effect
        }

        if ('opacity' in particlesRef.current.material) {
          particlesRef.current.material.opacity = 0.5 // Very low opacity for an extremely subtle look
        }
      }

      // Reset camera position
      if (interactive && cameraRef.current) {
        cameraRef.current.position.z = 4
      }
    }
  }, [isHovered])

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        cursor: 'grab',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovered
          ? `0 0 30px 5px rgba(${coreColorRGB.r}, ${coreColorRGB.g}, ${coreColorRGB.b}, 0.5)`
          : `0 0 15px 2px rgba(${coreColorRGB.r}, ${coreColorRGB.g}, ${coreColorRGB.b}, 0.3)`,
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      onMouseDown={() => containerRef.current?.style.setProperty('cursor', 'grabbing')}
      onMouseUp={() => containerRef.current?.style.setProperty('cursor', 'grab')}
    >
      {/* Add a subtle pulsing ring around the orb */}
      <div
        className="animate-ring-pulse"
        style={{
          position: 'absolute',
          inset: '-10px',
          borderRadius: '50%',
          background: 'transparent',
          border: `2px solid rgba(${coreColorRGB.r}, ${coreColorRGB.g}, ${coreColorRGB.b}, ${isHovered ? 0.5 : 0.2})`,
          pointerEvents: 'none'
        }}
      />

      {/* Add a second pulsing ring with offset timing for more dynamic effect */}
      <div
        style={{
          position: 'absolute',
          inset: '-15px',
          borderRadius: '50%',
          background: 'transparent',
          border: `1px solid rgba(${coreColorRGB.r}, ${coreColorRGB.g}, ${coreColorRGB.b}, ${isHovered ? 0.3 : 0.1})`,
          animation: 'ringPulse 3s infinite ease-in-out 1.5s', // Offset timing
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}
