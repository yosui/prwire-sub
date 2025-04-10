"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Rss, ChevronDown, Twitter } from "lucide-react"
import { motion, useInView, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

// GradientHeading Component
function GradientHeading({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, left: 0, top: 0 })

  useEffect(() => {
    if (!headingRef.current) return

    const updateDimensions = () => {
      if (headingRef.current) {
        const rect = headingRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!headingRef.current) return

      const { clientX, clientY } = e
      const { left, top, width, height } = dimensions

      // Calculate relative position within the element
      const x = ((clientX - left) / width) * 100
      const y = ((clientY - top) / height) * 100

      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [dimensions])

  const gradientStyle = {
    backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, #000 0%, #333 50%, #000 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    color: "transparent",
  }

  return (
    <h1 ref={headingRef} className={cn("", className)} style={gradientStyle}>
      {children}
    </h1>
  )
}

// HoverGlow Component
function HoverGlow({
  children,
  className,
  size = 400,
  glowColor = "rgba(0, 0, 0, 0.1)",
}: {
  children: React.ReactNode
  className?: string
  size?: number
  glowColor?: string
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => {
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-full transition-opacity duration-300"
        style={{
          background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent)`,
          opacity,
        }}
      />
      {children}
    </div>
  )
}

// ScrollReveal Component
function ScrollReveal({
  children,
  delay = 0.2,
  duration = 0.5,
  once = true,
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  once?: boolean
}) {
  const controls = useAnimation()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !hasAnimated) {
      controls.start("visible")
      if (once) {
        setHasAnimated(true)
      }
    } else if (!isInView && !once && hasAnimated) {
      controls.start("hidden")
      setHasAnimated(false)
    }
  }, [isInView, controls, once, hasAnimated])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration, delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

// GridPattern Component
function GridPattern({
  width = 100,
  height = 100,
  x = 0,
  y = 0,
  strokeDasharray = "1 1",
  className,
}: {
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: string
  className?: string
}) {
  return (
    <svg className={className} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <title>Grid Pattern</title>
      <defs>
        <pattern id="grid" width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path
            d={`M ${width} 0 L 0 0 0 ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  )
}

// Main Page Component
export default function Home() {
  // Use Clerk's authentication hook
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-white overflow-hidden">

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
          <GridPattern className="absolute inset-0 opacity-[0.02] text-black" />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-black/5 to-transparent blur-3xl -z-10" />

          <div className="container relative mx-auto max-w-screen-xl px-4 md:px-6">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <div className="mb-6 inline-flex items-center rounded-full border border-black/10 px-3 py-1 text-sm">
                <span className="mr-1 rounded-full bg-black w-2 h-2" />
                <span className="text-gray-600">Verified Influence Platform</span>
              </div>

              <GradientHeading className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
                Verify Your Power for The People
              </GradientHeading>

              <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-xl">Connect. Verify. Amplify.</p>

              <div className="flex gap-4">
                {!isSignedIn ? (
                  <HoverGlow>
                    <Button asChild size="lg" className="rounded-full px-8 bg-black text-white hover:bg-black/90">
                      <Link href="/sign-up" className="flex items-center">
                        Start Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </HoverGlow>
                ) : (
                  <HoverGlow>
                    <Button asChild size="lg" className="rounded-full px-8 bg-black text-white hover:bg-black/90">
                      <Link href="/dashboard" className="flex items-center">
                        Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </HoverGlow>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
