import * as THREE from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'

// Type definitions
type Coordinate = [number, number]
type CoordinateArray = Coordinate[]
type GeoJSONCoordinate = number[] | number[][] | number[][][] | number[][][][]

type GeoJSONGeometry = {
  type: string
  coordinates: GeoJSONCoordinate
}

interface GeoJSONFeature {
  type: string
  geometry: {
    type: string
    coordinates: number[][]
  }
  properties?: Record<string, unknown>
}

interface DrawThreeGeoParams {
  json: {
    type: string
    features?: GeoJSONFeature[]
    geometries?: GeoJSONGeometry[]
    geometry?: GeoJSONGeometry
  }
  radius: number
  materalOptions?: {
    color?: number | string | THREE.Color
    opacity?: number
    transparent?: boolean
  }
}

// Declare global window property
declare global {
  interface Window {
    geoJsonData: any
  }
}

function addLocationParticles(container: THREE.Object3D, radius: number): void {
  function generatePointsOnLand(geojson: any, count: number): CoordinateArray {
    const points: CoordinateArray = []
    const features = geojson.features || [geojson]

    for (let i = 0; i < count; i++) {
      const feature = features[Math.floor(Math.random() * features.length)]
      const coordinates = feature.geometry.coordinates

      if (feature.geometry.type === 'Polygon') {
        const poly = coordinates[0]
        const point = getRandomPointInPolygon(poly)
        if (point) points.push(point)
      } else if (feature.geometry.type === 'MultiPolygon') {
        const polyIndex = Math.floor(Math.random() * coordinates.length)
        const poly = coordinates[polyIndex][0]
        const point = getRandomPointInPolygon(poly)
        if (point) points.push(point)
      }
    }
    return points
  }

  function getRandomPointInPolygon(polygon: CoordinateArray): Coordinate {
    let minLng = Infinity,
      maxLng = -Infinity
    let minLat = Infinity,
      maxLat = -Infinity

    polygon.forEach((coord) => {
      minLng = Math.min(minLng, coord[0])
      maxLng = Math.max(maxLng, coord[0])
      minLat = Math.min(minLat, coord[1])
      maxLat = Math.max(maxLat, coord[1])
    })

    const lng = minLng + Math.random() * (maxLng - minLng)
    const lat = minLat + Math.random() * (maxLat - minLat)

    return [lng, lat]
  }

  // Key locations type definition
  const keyLocations: CoordinateArray = [
    // Asia Timur & Utara
    [35.6762, 139.6503], // Tokyo
    [37.5665, 126.978], // Seoul
    [39.9042, 116.4074], // Beijing
    [31.2304, 121.4737], // Shanghai
    [22.3193, 114.1694], // Hong Kong
    [25.033, 121.5654], // Taipei
    [43.0621, 141.3544], // Sapporo
    [34.6937, 135.5023], // Osaka
    [55.7558, 37.6173], // Moscow
    [56.8389, 60.6057], // Yekaterinburg

    // Eropa
    [51.5074, -0.1278], // London
    [48.8566, 2.3522], // Paris
    [52.52, 13.405], // Berlin
    [41.9028, 12.4964], // Rome
    [59.9139, 10.7522], // Oslo
    [55.6761, 12.5683], // Copenhagen
    [52.3676, 4.9041], // Amsterdam
    [48.2082, 16.3738], // Vienna
    [50.0755, 14.4378], // Prague
    [59.3293, 18.0686], // Stockholm

    // Amerika Utara
    [40.7128, -74.006], // New York
    [34.0522, -118.2437], // Los Angeles
    [41.8781, -87.6298], // Chicago
    [45.5017, -73.5673], // Montreal
    [49.2827, -123.1207], // Vancouver
    [51.0447, -114.0719], // Calgary

    // Asia Tenggara (beberapa)
    [-6.2088, 106.8456], // Jakarta
    [1.3521, 103.8198], // Singapore

    // Beberapa di selatan
    [-23.5505, -46.6333], // São Paulo
    [-34.6037, -58.3816] // Buenos Aires
  ]

  const particlesCount = 2000
  const landPoints = generatePointsOnLand(window.geoJsonData, particlesCount - keyLocations.length)
  const allPoints = [...keyLocations, ...landPoints]

  const positions = new Float32Array(particlesCount * 3)
  const sizes = new Float32Array(particlesCount)
  const opacities = new Float32Array(particlesCount)

  for (let i = 0; i < particlesCount && i < allPoints.length; i++) {
    const [lon, lat] = allPoints[i]

    positions[i * 3] = radius * Math.cos((lat * Math.PI) / 180) * Math.cos((lon * Math.PI) / 180)
    positions[i * 3 + 1] =
      radius * Math.cos((lat * Math.PI) / 180) * Math.sin((lon * Math.PI) / 180)
    positions[i * 3 + 2] = radius * Math.sin((lat * Math.PI) / 180)

    sizes[i] = Math.random() * 0.12 + 0.04
    opacities[i] = 0.5 + Math.random() * 0.5
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1))

  const material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      attribute float size;
      attribute float opacity;
      varying float vOpacity;
      varying vec3 vPosition;
      uniform float time;
      
      void main() {
        vPosition = position;
        vOpacity = opacity * (0.6 + 0.4 * sin(time + opacity * 8.0));
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vOpacity;
      varying vec3 vPosition;
      
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        float intensity = 1.0 - (dist * 2.0);
        intensity = pow(intensity, 1.5);
        
        vec3 color = vec3(0.0, 1.0, 0.2);
        color = mix(color, vec3(1.0), intensity * 0.9);
        
        float positionVariation = length(vPosition) * 0.15;
        color += vec3(0.1, 0.3, 0.1) * positionVariation;
        
        gl_FragColor = vec4(color, vOpacity * intensity);
      }
    `
  })

  const particles = new THREE.Points(geometry, material)

  particles.userData.update = (t: number) => {
    material.uniforms.time.value = t * 0.3
  }

  container.add(particles)
}

export function drawThreeGeo({ json, radius, materalOptions }: DrawThreeGeoParams): THREE.Object3D {
  window.geoJsonData = json

  const container = new THREE.Object3D()

  addLocationParticles(container, radius)

  container.rotation.y = Math.PI
  container.rotation.x = Math.PI * 0.5

  container.userData.update = (t: number) => {
    container.children.forEach((child) => {
      child.userData.update?.(t)
    })
  }

  const x_values: number[] = []
  const y_values: number[] = []
  const z_values: number[] = []
  const json_geom = createGeometryArray(json)

  //Re-usable array to hold coordinate values. This is necessary so that you can add
  //interpolated coordinates. Otherwise, lines go through the sphere instead of wrapping around.
  let coordinate_array = []
  for (let geom_num = 0; geom_num < json_geom.length; geom_num++) {
    if (json_geom[geom_num].type === 'Point') {
      const coords = json_geom[geom_num].coordinates as number[]
      convertToSphereCoords(coords, radius)
      drawParticle(x_values[0], y_values[0], z_values[0], materalOptions)
    } else if (json_geom[geom_num].type === 'MultiPoint') {
      const coordsArray = json_geom[geom_num].coordinates as number[][]
      for (let point_num = 0; point_num < coordsArray.length; point_num++) {
        convertToSphereCoords(coordsArray[point_num], radius)
        drawParticle(x_values[0], y_values[0], z_values[0], materalOptions)
      }
    } else if (json_geom[geom_num].type === 'LineString') {
      const coords = json_geom[geom_num].coordinates as number[][]
      coordinate_array = createCoordinateArray(coords)

      for (let point_num = 0; point_num < coordinate_array.length; point_num++) {
        convertToSphereCoords(coordinate_array[point_num], radius)
      }
      drawLine(x_values, y_values, z_values, materalOptions)
    } else if (json_geom[geom_num].type === 'Polygon') {
      const polygonCoords = json_geom[geom_num].coordinates as number[][][]
      for (let segment_num = 0; segment_num < polygonCoords.length; segment_num++) {
        coordinate_array = createCoordinateArray(polygonCoords[segment_num] as number[][])

        for (let point_num = 0; point_num < coordinate_array.length; point_num++) {
          convertToSphereCoords(coordinate_array[point_num], radius)
        }
        drawLine(x_values, y_values, z_values, materalOptions)
      }
    } else if (json_geom[geom_num].type === 'MultiLineString') {
      const multiLineCoords = json_geom[geom_num].coordinates as number[][][]
      for (let segment_num = 0; segment_num < multiLineCoords.length; segment_num++) {
        coordinate_array = createCoordinateArray(multiLineCoords[segment_num])

        for (let point_num = 0; point_num < coordinate_array.length; point_num++) {
          convertToSphereCoords(coordinate_array[point_num], radius)
        }
        drawLine(x_values, y_values, z_values, materalOptions)
      }
    } else if (json_geom[geom_num].type === 'MultiPolygon') {
      const multiPolygonCoords = json_geom[geom_num].coordinates as number[][][][]

      for (let polygon_num = 0; polygon_num < multiPolygonCoords.length; polygon_num++) {
        const polygonCoords = multiPolygonCoords[polygon_num]

        for (let segment_num = 0; segment_num < polygonCoords.length; segment_num++) {
          coordinate_array = createCoordinateArray(polygonCoords[segment_num])

          for (let point_num = 0; point_num < coordinate_array.length; point_num++) {
            convertToSphereCoords(coordinate_array[point_num], radius)
          }
          drawLine(x_values, y_values, z_values, materalOptions)
        }
      }
    } else {
      throw new Error('The geoJSON is not valid.')
    }
  }

  function createGeometryArray(json: DrawThreeGeoParams['json']): GeoJSONGeometry[] {
    const geometry_array: GeoJSONGeometry[] = []

    if (json.type === 'Feature' && json.geometry) {
      geometry_array.push(json.geometry)
    } else if (json.type === 'FeatureCollection' && json.features) {
      json.features.forEach((feature) => {
        geometry_array.push(feature.geometry)
      })
    } else if (json.type === 'GeometryCollection' && json.geometries) {
      geometry_array.push(...json.geometries)
    } else {
      throw new Error('The geoJSON is not valid.')
    }
    return geometry_array
  }

  function createCoordinateArray(feature: number[][]): CoordinateArray {
    const temp_array: CoordinateArray = []
    let interpolation_array: CoordinateArray = []

    for (let point_num = 0; point_num < feature.length; point_num++) {
      const point1 = feature[point_num] as Coordinate
      const point2 = feature[point_num - 1] as Coordinate

      if (point_num > 0) {
        if (needsInterpolation(point2, point1)) {
          interpolation_array = [point2, point1]
          interpolation_array = interpolatePoints(interpolation_array)

          for (
            let inter_point_num = 0;
            inter_point_num < interpolation_array.length;
            inter_point_num++
          ) {
            temp_array.push(interpolation_array[inter_point_num])
          }
        } else {
          temp_array.push(point1)
        }
      } else {
        temp_array.push(point1)
      }
    }
    return temp_array
  }

  function needsInterpolation(point2: Coordinate, point1: Coordinate): boolean {
    //If the distance between two latitude and longitude values is
    //greater than five degrees, return true.
    const lon1 = point1[0]
    const lat1 = point1[1]
    const lon2 = point2[0]
    const lat2 = point2[1]
    const lon_distance = Math.abs(lon1 - lon2)
    const lat_distance = Math.abs(lat1 - lat2)

    if (lon_distance > 5 || lat_distance > 5) {
      return true
    } else {
      return false
    }
  }

  function interpolatePoints(interpolation_array: CoordinateArray): CoordinateArray {
    //This function is recursive. It will continue to add midpoints to the
    //interpolation array until needsInterpolation() returns false.
    let temp_array: CoordinateArray = []
    let point1, point2

    for (let point_num = 0; point_num < interpolation_array.length - 1; point_num++) {
      point1 = interpolation_array[point_num]
      point2 = interpolation_array[point_num + 1]

      if (needsInterpolation(point2, point1)) {
        temp_array.push(point1)
        temp_array.push(getMidpoint(point1, point2))
      } else {
        temp_array.push(point1)
      }
    }

    temp_array.push(interpolation_array[interpolation_array.length - 1])

    if (temp_array.length > interpolation_array.length) {
      temp_array = interpolatePoints(temp_array)
    } else {
      return temp_array
    }
    return temp_array
  }

  function getMidpoint(point1: Coordinate, point2: Coordinate): Coordinate {
    const midpoint_lon = (point1[0] + point2[0]) / 2
    const midpoint_lat = (point1[1] + point2[1]) / 2
    const midpoint: Coordinate = [midpoint_lon, midpoint_lat]

    return midpoint
  }

  function convertToSphereCoords(coordinates_array: number[], sphere_radius: number): void {
    const lon = coordinates_array[0]
    const lat = coordinates_array[1]

    x_values.push(Math.cos((lat * Math.PI) / 180) * Math.cos((lon * Math.PI) / 180) * sphere_radius)
    y_values.push(Math.cos((lat * Math.PI) / 180) * Math.sin((lon * Math.PI) / 180) * sphere_radius)
    z_values.push(Math.sin((lat * Math.PI) / 180) * sphere_radius)
  }

  function drawParticle(
    x: number,
    y: number,
    z: number,
    options?: DrawThreeGeoParams['materalOptions']
  ): void {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute([x, y, z], 3))

    const particle_material = new THREE.PointsMaterial({
      color: 0x1e755c,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      ...(options || {})
    })

    const particle = new THREE.Points(geo, particle_material)
    container.add(particle)

    clearArrays()
  }

  function drawLine(
    x_values: number[],
    y_values: number[],
    z_values: number[],
    options?: DrawThreeGeoParams['materalOptions']
  ): void {
    const lineGeo = new LineGeometry()
    const verts = []
    for (let i = 0; i < x_values.length; i++) {
      verts.push(x_values[i], y_values[i], z_values[i])
    }
    lineGeo.setPositions(verts)

    const lineMaterial = new LineMaterial({
      color: 0x1e755c,
      linewidth: 1,
      transparent: true,
      opacity: 0.9,
      fog: true,
      ...(options || {})
    })

    const line = new Line2(lineGeo, lineMaterial)
    line.computeLineDistances()
    const rate = Math.random() * 0.0003
    line.userData.update = (t: number) => {
      lineMaterial.dashOffset = t * rate
    }
    container.add(line)

    clearArrays()
  }

  function clearArrays(): void {
    x_values.length = 0
    y_values.length = 0
    z_values.length = 0
  }

  return container
}
