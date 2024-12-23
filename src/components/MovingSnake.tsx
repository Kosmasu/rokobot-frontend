import React, { useRef, useEffect, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { eventEmitter } from '@/utils/eventEmitter'
import gsap from 'gsap'
import { PerspectiveCamera } from 'three'
interface SnakeGLTF extends THREE.Object3D {
  nodes: {
    asiandragonhalf_low015: any
    asiandragonhalf_low015_1: any
    asiandragonhalf_low015_2: any
    asiandragonhalf_low015_3: any
    asiandragonhalf_low015_4: any
    asiandragonhalf_low015_5: any
    footLF_IK: object
    footRF_IK: object
    footLR_IK: object
    footRR_IK: object
    head: THREE.Bone
    neck: THREE.Bone
    tongue: THREE.Bone
    jaw: THREE.Bone
    Bone002: THREE.Bone
    neck001: THREE.Bone
    Bone003: THREE.Bone
    Bone: THREE.Bone
    Cube003: THREE.SkinnedMesh
    Cube003_1: THREE.SkinnedMesh
    Cube003_2: THREE.SkinnedMesh
    Cube003_3: THREE.SkinnedMesh
    Cube003_4: THREE.SkinnedMesh
    Cube003_5: THREE.SkinnedMesh
    Cube003_6: THREE.SkinnedMesh
  }
  materials: {
    'cobra GLOW eyes': THREE.MeshPhongMaterial
    'cobra.001': THREE.MeshPhongMaterial
    'cobra black': THREE.MeshPhongMaterial
    'cobra black.001': THREE.MeshPhongMaterial
    'Glow balls': THREE.MeshPhongMaterial
    'Glow balls.002': THREE.MeshPhongMaterial
    'Glow balls.001': THREE.MeshPhongMaterial
    'cobra GLOW highlight': THREE.MeshPhongMaterial
    'asian_dragon.001': THREE.MeshPhongMaterial
    'cobra GLOW terth': THREE.MeshPhongMaterial
    'cobra Line.001': THREE.MeshPhongMaterial
    'Glow balls.005': THREE.MeshPhongMaterial
  }
  scene: THREE.Group | THREE.Scene
}

function Model() {
  const { nodes, materials, scene } = useGLTF('/models/Dragon revised.glb') as unknown as SnakeGLTF
  const { camera } = useThree()

  // Tambahkan logic untuk mobile
  useEffect(() => {
    const isMobile = window.innerWidth <= 768
    if (isMobile && camera instanceof PerspectiveCamera) {
      camera.fov = 100
      camera.updateProjectionMatrix()
    }
  }, [camera])

  // Set camera properties
  camera.position.set(0, 0, 2.5)
  // camera.lookAt(0, 0, 0)
  const meshRef = useRef<THREE.Group | null>(null)
  const intersectionPoint = new THREE.Vector3()
  const planeNormal = new THREE.Vector3()
  const plane = new THREE.Plane()
  const mousePosition = new THREE.Vector2()
  const raycaster: THREE.Raycaster = new THREE.Raycaster()

  // Define a state to store the target intersection point
  const targetIntersectionPoint = new THREE.Vector3()

  const initialRotations = useRef({
    head: new THREE.Euler(),
    neck: new THREE.Euler(),
    neck001: new THREE.Euler(),
    Bone: new THREE.Euler()
  })

  useEffect(() => {
    if (!meshRef.current) return

    const originalPosition = new THREE.Vector3(0, 0.08, -0.18)

    const startPosition = new THREE.Vector3(0, -10.1, originalPosition.z) // Starting position below the original (keep z the same)

    // Set the initial position to startPosition
    meshRef.current.position.copy(startPosition)
    nodes.jaw.rotation.x = (-6 * Math.PI) / 180
    nodes.tongue.rotation.x = (16.32 * Math.PI) / 180
    materials['Glow balls'].emissive = new THREE.Color('#06ec66')
    nodes.head.rotation.x = (-35 * Math.PI) / 180

    // Use GSAP to animate the slide
    gsap.to(meshRef.current.position, {
      y: originalPosition.y,
      duration: 2.4,
      ease: 'circ' // Smooth easing effect
    })
  }, [])

  // breathing animation
  useEffect(() => {
    const duration = 4.5 // Duration for one full breath cycle

    const animateBreathing = () => {
      // Use GSAP to animate jaw and tongue rotations
      gsap.to(nodes.jaw.rotation, {
        x: 0.02,
        duration: duration / 2,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1 // Repeat indefinitely
      })

      if (meshRef.current) {
        gsap.to(meshRef.current.scale, {
          x: 1.01,
          y: 1.01,
          duration: duration / 2,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1 // Repeat indefinitely
        })
      }
    }

    animateBreathing()

    return () => {
      // Cleanup GSAP animations
      gsap.killTweensOf(nodes.jaw.rotation)
      gsap.killTweensOf(nodes.tongue.rotation)
    }
  }, [nodes])

  // Store initial rotations
  useEffect(() => {
    if (nodes.head) initialRotations.current.head.copy(nodes.head.rotation)
    if (nodes.neck) initialRotations.current.neck.copy(nodes.neck.rotation)
    if (nodes.neck001) initialRotations.current.neck001.copy(nodes.neck001.rotation)
    if (nodes.Bone) initialRotations.current.Bone.copy(nodes.Bone.rotation)
  }, [nodes])

  const resetPosition = new THREE.Vector2(0, 0) // Define the reset position
  const isResetting = useRef(false) // Track if we are resetting

  useEffect(() => {
    // Trigger reset on first load
    isResetting.current = true // Start resetting
  }, [])

  useEffect(() => {
    const snakeCanvas = document.getElementById('snake-canvas')
    let mouseEntered = false // Flag to track mouse entry

    if (snakeCanvas) {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = snakeCanvas.getBoundingClientRect()
        mousePosition.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mousePosition.y = -(((e.clientY - rect.top) / rect.height) * 0.4) * 2 + 0.3
        planeNormal.copy(camera.position).normalize()
        plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position)
        raycaster.setFromCamera(mousePosition, camera)
        raycaster.ray.intersectPlane(plane, targetIntersectionPoint)
      }

      const handleMouseLeave = () => {
        if (!mouseEntered) {
          // Only execute if mouse hasn't re-entered
          isResetting.current = true // Start resetting
        }
      }

      const handleMouseEnter = () => {
        mouseEntered = true // Set flag when mouse enters
      }

      snakeCanvas.addEventListener('mousemove', (e) => {
        setTimeout(() => handleMouseMove(e), 50)
      })
      snakeCanvas.addEventListener('mouseleave', () => {
        mouseEntered = false // Reset flag on leave
        setTimeout(handleMouseLeave, 500)
      })
      snakeCanvas.addEventListener('mouseenter', handleMouseEnter) // Track mouse enter

      return () => {
        snakeCanvas.removeEventListener('mousemove', handleMouseMove)
        snakeCanvas.removeEventListener('mouseleave', handleMouseLeave)
        snakeCanvas.removeEventListener('mouseenter', handleMouseEnter) // Cleanup
      }
    }
  }, [camera, scene, nodes])

  // Use requestAnimationFrame for smooth updates
  const animate = () => {
    const snakeCanvas = document.getElementById('snake-canvas')
    intersectionPoint.lerp(targetIntersectionPoint, 0.02) // Smoothly transition to target point

    // Reset position logic
    if (isResetting.current) {
      // Smoothly transition to the reset position
      const steps = 20 // Number of steps for the transition
      let shouldContinueReset = true // Flag to control the reset loop

      for (let i = 0; i < steps; i++) {
        setTimeout(() => {
          if (shouldContinueReset) {
            // Check if we should continue resetting
            mousePosition.x = THREE.MathUtils.lerp(
              mousePosition.x,
              resetPosition.x,
              (i + 1) / steps
            )
            mousePosition.y = THREE.MathUtils.lerp(
              mousePosition.y,
              resetPosition.y,
              (i + 1) / steps
            )
          }
        }, i * 50) // Delay between steps
      }

      // Check if we are close enough to the reset position to stop resetting
      if (
        Math.abs(mousePosition.x - resetPosition.x) < 0.01 &&
        Math.abs(mousePosition.y - resetPosition.y) < 0.01
      ) {
        isResetting.current = false // Stop resetting when close enough
      }

      // Update the shouldContinueReset flag in the mouse enter handler
      const handleMouseEnter = () => {
        shouldContinueReset = false // Stop the reset process
      }
      if (snakeCanvas) {
        snakeCanvas.addEventListener('mouseenter', handleMouseEnter)
      }
    }

    const boneRef002 = nodes.head
    const boneRef001 = nodes.neck
    const boneRef003 = nodes.neck001

    if (boneRef002) {
      const rotationFactor = 0.005
      boneRef002.rotation.z = ((-rotationFactor * Math.PI) / 6) * intersectionPoint.x

      const mapRange = (
        value: number,
        inMin: number,
        inMax: number,
        outMin: number,
        outMax: number
      ) => {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
      }

      const targetRotationX = mapRange(mousePosition.y, -1, 1, -Math.PI / 3, Math.PI / 3)
      const targetRotationZ = mapRange(mousePosition.x, -1, 1, -Math.PI / 4, Math.PI / 4)

      const horizontalOffset = 0.0 // Start with no offset and adjust as needed

      const maxRotationX = Math.PI / 3
      const minRotationX = -Math.PI / 3

      if (boneRef001) {
        boneRef001.rotation.z = THREE.MathUtils.lerp(
          boneRef001.rotation.z,
          targetRotationZ + horizontalOffset,
          0.005
        )
        boneRef001.rotation.x = THREE.MathUtils.lerp(
          boneRef001.rotation.x,
          THREE.MathUtils.clamp(targetRotationX, minRotationX, maxRotationX),
          0.005
        )
      }

      if (boneRef003) {
        boneRef003.rotation.z = THREE.MathUtils.lerp(
          boneRef003.rotation.z,
          targetRotationZ + horizontalOffset,
          0.005
        )
      }

      if (boneRef003) {
        boneRef003.rotation.z = THREE.MathUtils.lerp(
          boneRef003.rotation.z,
          targetRotationZ + horizontalOffset,
          0.005
        )
        boneRef003.rotation.x = THREE.MathUtils.lerp(
          boneRef003.rotation.x,
          THREE.MathUtils.clamp(targetRotationX, minRotationX, maxRotationX),
          0.005
        )
      }
    }

    requestAnimationFrame(animate)
  }

  animate() // Start the animation loop

  const blinkingInterval = useRef<NodeJS.Timeout | null>(null)
  const animationFrameId = useRef<number | null>(null) // Tambah ref untuk animationFrame

  const blinkEyes = () => {
    const targetIntensity = 250
    let currentIntensity = 10 // Start from intensity 1
    const duration = 2500 // Duration for the entire effect in milliseconds
    let startTime = performance.now() // Record the start time

    const animateIntensity = () => {
      const elapsed = performance.now() - startTime // Calculate elapsed time
      const progress = Math.min(elapsed / duration, 1) // Normalize progress

      if (progress < 0.2) {
        currentIntensity = THREE.MathUtils.lerp(0.1, targetIntensity, progress * 10)
      } else if (progress < 0.8) {
        currentIntensity = targetIntensity
      } else {
        // Second half: dim to 1
        currentIntensity = THREE.MathUtils.lerp(targetIntensity, 10, (progress - 0.5) * 2)
      }

      if (materials['cobra GLOW highlight']) {
        materials['cobra GLOW highlight'].emissive = new THREE.Color(0x00ff9f)
        materials['cobra GLOW highlight'].emissiveIntensity = currentIntensity
      }

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animateIntensity)
      } else {
        blinkingInterval.current = setTimeout(() => {
          startTime = performance.now()
          animationFrameId.current = requestAnimationFrame(animateIntensity)
        }, 200)
      }
    }

    animateIntensity()
  }

  useEffect(() => {
    const handleAiResponse = () => {
      blinkEyes()
    }

    const handleStopBlinking = () => {
      // Bersihkan timeout
      if (blinkingInterval.current) {
        clearTimeout(blinkingInterval.current)
        blinkingInterval.current = null
      }
      // Bersihkan animation frame
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
      // Reset mata ke kondisi normal
      if (materials['cobra.001']) {
        materials['cobra.001'].emissiveIntensity = 1
      }
    }

    eventEmitter.on('aiResponse', handleAiResponse)
    eventEmitter.on('stopBlinking', handleStopBlinking)

    return () => {
      eventEmitter.off('aiResponse', handleAiResponse)
      eventEmitter.off('stopBlinking', handleStopBlinking)
      if (blinkingInterval.current) {
        clearTimeout(blinkingInterval.current)
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [materials])

  return (
    <group
      ref={meshRef}
      dispose={null}
      position={[0, -16, 0]}
      rotation={[Math.PI / 2.4, Math.PI, 0]}
    >
      <group name="Scene">
        <group name="asiandragon003" position={[0, 0.916, 0]}>
          <group name="asiandragon_low008">
            <skinnedMesh
              name="asiandragonhalf_low015"
              geometry={nodes.asiandragonhalf_low015.geometry}
              material={materials['asian_dragon.001']}
              skeleton={nodes.asiandragonhalf_low015.skeleton}
            />
            <skinnedMesh
              name="asiandragonhalf_low015_1"
              geometry={nodes.asiandragonhalf_low015_1.geometry}
              material={materials['cobra GLOW highlight']}
              skeleton={nodes.asiandragonhalf_low015_1.skeleton}
            />
            <skinnedMesh
              name="asiandragonhalf_low015_2"
              geometry={nodes.asiandragonhalf_low015_2.geometry}
              material={materials['cobra Line.001']}
              skeleton={nodes.asiandragonhalf_low015_2.skeleton}
            />
            <skinnedMesh
              name="asiandragonhalf_low015_3"
              geometry={nodes.asiandragonhalf_low015_3.geometry}
              material={materials['Glow balls']}
              skeleton={nodes.asiandragonhalf_low015_3.skeleton}
            />
            <skinnedMesh
              name="asiandragonhalf_low015_4"
              geometry={nodes.asiandragonhalf_low015_4.geometry}
              material={materials['Glow balls.005']}
              skeleton={nodes.asiandragonhalf_low015_4.skeleton}
            />
            <skinnedMesh
              name="asiandragonhalf_low015_5"
              geometry={nodes.asiandragonhalf_low015_5.geometry}
              material={materials['cobra GLOW terth']}
              skeleton={nodes.asiandragonhalf_low015_5.skeleton}
            />
          </group>
          <primitive object={nodes.footLF_IK} />
          <primitive object={nodes.footRF_IK} />
          <primitive object={nodes.footLR_IK} />
          <primitive object={nodes.footRR_IK} />
          <primitive object={nodes.neck001} />
        </group>
      </group>
    </group>
  )
}

interface SnakeModelProps {
  isMobile?: boolean
}

const SnakeModel = ({ isMobile = false }: SnakeModelProps) => {
  const matrixAnimation = useCallback(() => {
    const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    canvas.height = window.innerHeight
    canvas.width = window.innerWidth

    const wipeBlock1 = '██'
    const wipeBlock2 = '▉'
    const matrixChars =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｦｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ*$#@'
    const matrix: string[] = matrixChars.split('')
    const fontSize = isMobile ? 14 : 28
    ctx.font = `${fontSize}px monospace`

    const columns: number = canvas.width / fontSize
    const drops: number[] = []
    const speeds: number[] = []
    const speedMemories: number[] = []

    for (let x = 0; x < columns; x++) {
      drops[x] = 1
      speedMemories[x] = 1
      speeds[x] = 0
    }

    const draw = () => {
      ctx.shadowColor = '#000'
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < drops.length; i++) {
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.985) {
          drops[i] = 0
          speedMemories[i] = 1 + Math.floor(Math.random() * 3)
          speeds[i] = 0
        }

        if (speeds[i] >= speedMemories[i]) {
          ctx.fillStyle = '#000'
          ctx.shadowBlur = 0

          ctx.fillText(wipeBlock1, i * fontSize, drops[i] * fontSize)
          ctx.shadowBlur = 0
          ctx.fillText(wipeBlock2, i * fontSize, drops[i] * fontSize)
          ctx.shadowBlur = 0
          const randomChar = matrix[Math.floor(Math.random() * matrix.length)]
          ctx.shadowColor = '#00FF9F'
          ctx.shadowBlur = 2
          ctx.fillStyle = '#00FF9F'
          ctx.fillText(randomChar, i * fontSize, drops[i] * fontSize)
          ctx.shadowColor = '#fff'
          ctx.shadowBlur = 2
          ctx.fillStyle = '#fff'
          ctx.fillText(randomChar, i * fontSize, (drops[i] + 1) * fontSize)
          drops[i]++
          speeds[i] = 0
        } else {
          speeds[i]++
        }
      }
    }

    const intervalId = setInterval(draw, 30)
    return () => clearInterval(intervalId)
  }, [isMobile])

  useEffect(() => {
    const cleanup = matrixAnimation()
    return cleanup
  }, [matrixAnimation])

  if (isMobile) {
    return (
      <div className="relative h-full w-full">
        <canvas id="matrix-canvas" className="absolute !h-full !w-full"></canvas>
        <Canvas id="snake-canvas">
          <EffectComposer>
            <Bloom mipmapBlur luminanceThreshold={1} intensity={0.02} />
          </EffectComposer>
          <Model />
        </Canvas>
      </div>
    )
  }

  // Return existing desktop version
  return (
    <div className="relative h-full w-full">
      <canvas id="matrix-canvas" className="absolute !h-full !w-full"></canvas>
      <Canvas id="snake-canvas">
        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={1} intensity={0.02} />
        </EffectComposer>
        <Model />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/Dragon revised.glb')

export default SnakeModel
