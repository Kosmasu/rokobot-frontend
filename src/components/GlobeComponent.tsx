import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { drawThreeGeo } from '@/utils/threeGeoJSON'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'

const GlobeComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Simpan referensi ke DOM element
    const currentContainer = containerRef.current

    // Setup scene
    const scene = new THREE.Scene()
    // scene.background = new THREE.Color('#030E07')
    scene.background = null

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      currentContainer.clientWidth / currentContainer.clientHeight,
      1,
      100
    )
    camera.position.z = 5

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    renderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight)
    currentContainer.appendChild(renderer.domElement)

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 3
    controls.maxDistance = 10
    controls.maxPolarAngle = Math.PI
    controls.minPolarAngle = 0
    controls.target.set(0, 0, 0)

    // Setup globe wireframe
    const geometry = new THREE.SphereGeometry(2)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x1e755c,
      transparent: true,
      opacity: 0.4
    })
    const edges = new THREE.EdgesGeometry(geometry, 1)
    const line = new THREE.LineSegments(edges, lineMat)

    // Setup container for globe elements
    const globeContainer = new THREE.Object3D()
    scene.add(globeContainer)
    globeContainer.add(line)

    // Atur kemiringan awal globe seperti kemiringan axis Bumi (23.5 derajat)
    globeContainer.rotation.x = (23.5 * Math.PI) / 180

    // Sesuaikan posisi kamera agar view lebih baik
    camera.position.set(0, 1, 4.5)
    controls.update()

    // Helper function untuk konversi koordinat
    const latLngToVector3 = (lat: number, lng: number, radius: number) => {
      const x = radius * Math.cos((lat * Math.PI) / 180) * Math.cos((lng * Math.PI) / 180)
      const y = radius * Math.cos((lat * Math.PI) / 180) * Math.sin((lng * Math.PI) / 180)
      const z = radius * Math.sin((lat * Math.PI) / 180)

      return new THREE.Vector3(x, y, z)
    }

    // Create beam effect
    const createBeam = (lat: number, lng: number, radius: number) => {
      const basePosition = latLngToVector3(lat, lng, radius)
      const beamHeight = radius * 0.3

      const topPosition = basePosition
        .clone()
        .normalize()
        .multiplyScalar(radius + beamHeight)

      // Buat array positions untuk LineGeometry
      const positions = [
        basePosition.x,
        basePosition.y,
        basePosition.z,
        topPosition.x,
        topPosition.y,
        topPosition.z
      ]

      const geometry = new LineGeometry()
      geometry.setPositions(positions)

      const material = new LineMaterial({
        color: 0x1e755c,
        transparent: true,
        opacity: 0.9,
        linewidth: 2, // dalam pixels
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
      })

      const beam = new Line2(geometry, material)
      beam.computeLineDistances()
      beam.userData.update = (time: number) => {
        material.opacity = 0.5 + Math.sin(time * 2) * 0.5
      }

      return beam
    }

    // Add beams at key locations
    const addBeams = () => {
      const keyLocations = [
        // Asia Tenggara & Asia Timur
        [-6.2088, 106.8456], // Jakarta
        [-7.2575, 112.7521], // Surabaya
        [1.3521, 103.8198], // Singapore
        [13.7563, 100.5018], // Bangkok
        [14.5995, 120.9842], // Manila
        [35.6762, 139.6503], // Tokyo
        [37.5665, 126.978], // Seoul
        [39.9042, 116.4074], // Beijing
        [31.2304, 121.4737], // Shanghai

        // Asia Selatan & Timur Tengah
        [28.6139, 77.209], // New Delhi
        [25.2048, 55.2708], // Dubai

        // Eropa
        [51.5074, -0.1278], // London
        [48.8566, 2.3522], // Paris
        [52.52, 13.405], // Berlin
        [41.9028, 12.4964], // Rome

        // Amerika
        [40.7128, -74.006], // New York
        [34.0522, -118.2437], // Los Angeles
        [-23.5505, -46.6333], // São Paulo
        [-34.6037, -58.3816] // Buenos Aires
      ]

      keyLocations.forEach(([lat, lng]) => {
        const beam = createBeam(lat, lng, 2)
        globeContainer.add(beam)
      })
    }

    // Load GeoJSON data
    fetch('/geojson/ne_110m_land.json').then(async (response) => {
      const data = await response.json()
      const countries = drawThreeGeo({
        json: data,
        radius: 2,
        materalOptions: {
          color: 0x1e755c
        }
      })

      globeContainer.add(countries)
      addBeams()
    })

    // Animation
    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.01

      globeContainer.rotation.y += 0.009

      // Update beam animations
      globeContainer.children.forEach((child) => {
        if (child instanceof Line2) {
          child.userData.update?.(time)
        }
      })

      renderer.render(scene, camera)
      controls.update()
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (!currentContainer) return

      camera.aspect = currentContainer.clientWidth / currentContainer.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight)

      // Update resolution untuk semua LineMaterial
      globeContainer.children.forEach((child) => {
        if (child instanceof Line2) {
          const material = child.material as LineMaterial
          material.resolution.set(currentContainer.clientWidth, currentContainer.clientHeight)
        }
      })
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      renderer.dispose()
      currentContainer?.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    const updateMargin = () => {
      const vh = window.innerHeight
      const margin = vh >= 900 ? 0 : Math.round(Math.min(30, vh * 0.02))
      if (containerRef.current) {
        containerRef.current.style.marginTop = `-${margin}px`
      }
    }

    window.addEventListener('resize', updateMargin)
    updateMargin() // Initial call

    return () => window.removeEventListener('resize', updateMargin)
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full animate-zoomin"
      style={{
        aspectRatio: '1/1'
      }}
    />
  )
}

export default GlobeComponent
