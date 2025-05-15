'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface AuraOrbProps {
  traits?: {
    openness?: number
    conscientiousness?: number
    extraversion?: number
    agreeableness?: number
    neuroticism?: number
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
}

export default function AuraOrb({
  traits = {},
  size = 'md',
  animated = true,
  className = '',
}: AuraOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Default trait values if not provided
  const {
    openness = 3,
    conscientiousness = 3,
    extraversion = 3,
    agreeableness = 3,
    neuroticism = 3,
  } = traits

  // Size mapping
  const sizeMap = {
    sm: 120,
    md: 200,
    lg: 300,
    xl: 400,
  }

  const orbSize = sizeMap[size]

  // Color mapping based on traits
  // Each trait influences a different aspect of the orb's appearance
  const getTraitColor = (trait: number, baseHue: number, alpha: number = 1): string => {
    // Scale trait from 1-5 to 0-1
    const normalizedTrait = (trait - 1) / 4

    // Calculate hue, saturation, and lightness based on trait value
    const hue = baseHue + normalizedTrait * 30
    const saturation = 70 + normalizedTrait * 30
    const lightness = 50 + normalizedTrait * 10

    if (alpha < 1) {
      return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
    }
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  // Draw the aura orb
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = orbSize
    canvas.height = orbSize

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Base radius of the orb
    const baseRadius = orbSize * 0.35

    // Draw the core of the orb
    const drawCore = () => {
      // Core gradient based on extraversion and neuroticism
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, baseRadius
      )

      // Extraversion affects the core's brightness
      const extraversionColor = getTraitColor(extraversion, 210) // Blue base
      // Neuroticism affects the core's intensity
      const neuroticismColor = getTraitColor(6 - neuroticism, 30) // Orange/red base (inverted)

      coreGradient.addColorStop(0, extraversionColor)
      coreGradient.addColorStop(0.7, neuroticismColor)
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)')

      ctx.beginPath()
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2)
      ctx.fillStyle = coreGradient
      ctx.fill()
    }

    // Draw the aura layers
    const drawAuraLayers = () => {
      // Get colors with proper opacity
      // Openness affects the outer aura's complexity and color
      const opennessColorFull = getTraitColor(openness, 280) // Purple base
      const opennessColorMid = getTraitColor(openness, 280, 0.25) // 25% opacity
      const opennessColorTransparent = getTraitColor(openness, 280, 0) // 0% opacity

      // Conscientiousness affects the aura's structure and definition
      const conscientiousnessColorFull = getTraitColor(conscientiousness, 120) // Green base
      const conscientiousnessColorMid = getTraitColor(conscientiousness, 120, 0.5) // 50% opacity
      const conscientiousnessColorTransparent = getTraitColor(conscientiousness, 120, 0) // 0% opacity

      // Agreeableness affects the aura's softness and warmth
      const agreeablenessColorFull = getTraitColor(agreeableness, 60) // Yellow/orange base
      const agreeablenessColorMid = getTraitColor(agreeableness, 60, 0.4) // 40% opacity
      const agreeablenessColorTransparent = getTraitColor(agreeableness, 60, 0) // 0% opacity

      // Draw outer aura layers
      for (let i = 0; i < 3; i++) {
        const layerRadius = baseRadius * (1.2 + i * 0.15)
        const gradient = ctx.createRadialGradient(
          centerX, centerY, layerRadius * 0.8,
          centerX, centerY, layerRadius
        )

        // Mix colors based on layer
        if (i === 0) {
          gradient.addColorStop(0, conscientiousnessColorMid) // 50% opacity
          gradient.addColorStop(1, conscientiousnessColorTransparent) // 0% opacity
        } else if (i === 1) {
          gradient.addColorStop(0, agreeablenessColorMid) // 40% opacity
          gradient.addColorStop(1, agreeablenessColorTransparent) // 0% opacity
        } else {
          gradient.addColorStop(0, opennessColorMid) // 25% opacity
          gradient.addColorStop(1, opennessColorTransparent) // 0% opacity
        }

        ctx.beginPath()
        ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }
    }

    // Particle class for more dynamic particles
    class Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      angle: number;
      distance: number;
      speed: number;
      oscillationSpeed: number;
      oscillationDistance: number;
      baseX: number;
      baseY: number;

      constructor() {
        // Random angle and distance from center
        this.angle = Math.random() * Math.PI * 2;
        this.distance = Math.random() * baseRadius * 1.8;

        // Base position
        this.baseX = centerX + Math.cos(this.angle) * this.distance;
        this.baseY = centerY + Math.sin(this.angle) * this.distance;

        // Current position
        this.x = this.baseX;
        this.y = this.baseY;

        // Particle size based on conscientiousness (more organized = more uniform)
        this.size = (Math.random() * 2 + 1) * (6 - conscientiousness) / 3;

        // Movement properties
        this.speed = 0.02 + Math.random() * 0.03;
        this.oscillationSpeed = Math.random() * 0.2;
        this.oscillationDistance = Math.random() * 10;

        // Color based on traits
        const traitColors = [
          getTraitColor(openness, 280, 0.7), // Purple for openness
          getTraitColor(conscientiousness, 120, 0.7), // Green for conscientiousness
          getTraitColor(extraversion, 210, 0.7), // Blue for extraversion
          getTraitColor(agreeableness, 60, 0.7), // Yellow for agreeableness
          getTraitColor(6 - neuroticism, 30, 0.7), // Orange for emotional stability
        ];

        // Choose a color based on which trait is strongest at this position
        const traitValues = [openness, conscientiousness, extraversion, agreeableness, 6 - neuroticism];
        const maxTraitIndex = traitValues.indexOf(Math.max(...traitValues));

        // Add some randomness to color selection
        const colorIndex = Math.random() < 0.7 ? maxTraitIndex : Math.floor(Math.random() * traitColors.length);

        // Sometimes use white for sparkle effect
        this.color = Math.random() < 0.3
          ? `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`
          : traitColors[colorIndex];
      }

      update(time: number) {
        // Oscillate around base position
        this.x = this.baseX + Math.cos(time * this.oscillationSpeed) * this.oscillationDistance;
        this.y = this.baseY + Math.sin(time * this.oscillationSpeed) * this.oscillationDistance;

        // Pulse size
        const sizePulse = Math.sin(time * this.speed) * 0.5 + 1;

        // Draw particle with glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * sizePulse, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Add glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * sizePulse * 1.5, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          this.x, this.y, this.size * sizePulse * 0.5,
          this.x, this.y, this.size * sizePulse * 1.5
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Create particle array
    const particles: Particle[] = [];

    // Draw light particles/sparkles
    const drawParticles = (time: number = 0) => {
      // Number of particles based on extraversion
      const particleCount = Math.floor(15 + extraversion * 8);

      // Initialize particles if needed
      if (particles.length === 0) {
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle());
        }
      }

      // Update and draw each particle
      particles.forEach(particle => particle.update(time));
    }

    // Add outer glow effect
    const drawOuterGlow = () => {
      const glowRadius = baseRadius * 2.2;
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, baseRadius * 1.5,
        centerX, centerY, glowRadius
      );

      // Use a mix of trait colors for the glow
      const opennessFactor = openness / 5;
      const conscientiousnessFactor = conscientiousness / 5;
      const extraversionFactor = extraversion / 5;
      const agreeablenessFactor = agreeableness / 5;
      const neuroticismFactor = neuroticism / 5;

      // Create a blended color based on trait strengths
      const glowColor = `rgba(
        ${Math.round(180 * opennessFactor + 50 * extraversionFactor)},
        ${Math.round(180 * conscientiousnessFactor + 50 * agreeablenessFactor)},
        ${Math.round(180 * extraversionFactor + 50 * (1 - neuroticismFactor))},
        0.15
      )`;

      glowGradient.addColorStop(0, glowColor);
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();
    };

    // Execute the initial drawing
    drawOuterGlow();
    drawCore();
    drawAuraLayers();
    drawParticles();

    // Animation loop if animated is true
    let animationFrame: number;
    let lastTime = 0;

    if (animated) {
      let time = 0;
      const animate = (timestamp: number) => {
        // Calculate delta time for smooth animations regardless of frame rate
        const deltaTime = lastTime ? (timestamp - lastTime) / 1000 : 0.016;
        lastTime = timestamp;

        time += deltaTime;

        // Subtle pulsing effect
        const pulseScale = 1 + Math.sin(time * 0.8) * 0.03;
        // Secondary pulse with different frequency for more organic feel
        const secondaryPulse = 1 + Math.sin(time * 1.2) * 0.015;

        // Combined pulse effect
        const combinedPulse = pulseScale * secondaryPulse;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw outer glow first (behind everything)
        drawOuterGlow();

        // Save context state
        ctx.save();

        // Scale from center for pulsing
        ctx.translate(centerX, centerY);
        ctx.scale(combinedPulse, combinedPulse);
        ctx.translate(-centerX, -centerY);

        drawCore();
        drawAuraLayers();

        // Restore context state
        ctx.restore();

        // Draw particles with time parameter
        drawParticles(time);

        animationFrame = requestAnimationFrame(animate);
      };

      animationFrame = requestAnimationFrame(animate);
    }

    // Cleanup animation on unmount
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [orbSize, openness, conscientiousness, extraversion, agreeableness, neuroticism, animated])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative ${className}`}
    >
      {/* Background glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse-slow"
        style={{
          background: `radial-gradient(circle,
            ${getTraitColor(openness, 280, 0.8)} 0%,
            ${getTraitColor(conscientiousness, 120, 0.6)} 35%,
            ${getTraitColor(extraversion, 210, 0.4)} 70%,
            transparent 100%)`,
          transform: 'scale(1.2)',
          zIndex: -1,
        }}
      />

      {/* Canvas for the aura orb */}
      <motion.canvas
        ref={canvasRef}
        width={orbSize}
        height={orbSize}
        className="mx-auto relative z-10"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
      />

      {/* Subtle reflection effect */}
      <div
        className="absolute top-0 left-1/2 w-1/3 h-1/4 -translate-x-1/2 opacity-20 blur-sm"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, transparent 100%)',
          borderRadius: '100% 100% 0 0',
        }}
      />
    </motion.div>
  )
}
