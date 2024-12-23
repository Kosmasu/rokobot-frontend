export const OrbitControls = jest.fn(() => ({
  enableDamping: true,
  dampingFactor: 0.05,
  screenSpacePanning: false,
  minDistance: 3,
  maxDistance: 10,
  maxPolarAngle: Math.PI,
  minPolarAngle: 0,
  target: {
    set: jest.fn()
  },
  update: jest.fn(),
  dispose: jest.fn()
}))
