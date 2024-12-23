module.exports = {
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn()
  })),
  Color: jest.fn(),
  SphereGeometry: jest.fn(),
  LineBasicMaterial: jest.fn(),
  EdgesGeometry: jest.fn(),
  LineSegments: jest.fn(),
  Object3D: jest.fn(),
  Vector3: jest.fn(),
  Line: jest.fn(),
  BufferGeometry: jest.fn(() => ({
    setFromPoints: jest.fn(),
    setAttribute: jest.fn()
  }))
}
