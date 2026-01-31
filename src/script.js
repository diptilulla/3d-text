import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/Addons.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

window.addEventListener('mousemove', e => {
  const x = e.clientX / window.innerWidth - 0.5
  controls.autoRotateSpeed = x * 0.5  // tweak this
})

/**
 * Base
 */

// Debug
// const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#593F50')

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/9.png')
const matcapTexture2 = textureLoader.load('/textures/matcaps/10.png')

matcapTexture.encoding = THREE.sRGBEncoding

/**
 * Fonts
 */
const fontLoader = new FontLoader()
fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) =>
    {
        const textGeometry = new TextGeometry(
            'Dipti Lulla',
            {
                font: font,
                size: 0.5,
                depth: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        )
        // textGeometry.computeBoundingBox()
        // // moving the geometry instead of the mesh so that it rotates around the center
        // textGeometry.translate(
        //     - (textGeometry.boundingBox.max.x - 0.02 )* 0.5, // beveled so subtract bevel size
        //     - (textGeometry.boundingBox.max.y - 0.02) * 0.5, // beveled so subtract bevel size
        //     - (textGeometry.boundingBox.max.z - 0.03) * 0.5 // beveled so subtract bevel thickness
        // )
        textGeometry.center() // easier way to center the geometry, using bounding box internally
        const textMaterial = new THREE.MeshMatcapMaterial()
        textMaterial.matcap = matcapTexture
        const text = new THREE.Mesh(textGeometry, textMaterial)
        scene.add(text)

        const material = new THREE.MeshMatcapMaterial()
        material.matcap = matcapTexture2
        material.transparent = true

        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
        const octahedronGeometry = new THREE.OctahedronGeometry()

        for(let i=0; i<100; i++) {
            material.opacity = Math.random() * 0.4 + 0.6// random opacity for each donut between 0 and 1, then scaled to 0.6 to 1
            const donut = new THREE.Mesh(donutGeometry, material)
            
            // Loop until valid position: Instead of directly setting position.x/y/z, I use a do-while loop that keeps generating random positions until the distance from the origin is at least 1.5 units.

            // Distance is calculated using Math.sqrt(x*x + y*y + z*z) (Pythagorean theorem in 3D).
            // If the distance is less than 1.3, it regenerates the position.
            let x, y, z;
            do {
                x = (Math.random() - 0.5) * 10;
                y = (Math.random() - 0.5) * 10;
                z = (Math.random() - 0.5) * 10;
            } while (Math.sqrt(x * x + y * y + z * z) < 1.3);
            donut.position.set(x, y, z);
            
            donut.rotation.x = Math.random() * Math.PI // we dont need a full rotation of 2PI, as donut is symmetric
            donut.rotation.y = Math.random() * Math.PI
            
            const scale = Math.random() * 0.5
            donut.scale.set(scale, scale, scale)
            scene.add(donut)

            const octahedron = new THREE.Mesh(octahedronGeometry, material)
            let x2, y2, z2;
            do {
                x2 = (Math.random() - 0.5) * 10;
                y2 = (Math.random() - 0.5) * 10;
                z2 = (Math.random() - 0.5) * 10;
            } while (Math.sqrt(x2 * x2 + y2 * y2 + z2 * z2) < 1.3);
            octahedron.position.set(x2, y2, z2);
            
            octahedron.rotation.x = Math.random() * Math.PI
            octahedron.rotation.y = Math.random() * Math.PI
            
            const scale2 = Math.random() * 0.2 // random scale between 0 and 0.2
            octahedron.scale.set(scale2, scale2, scale2)
            scene.add(octahedron)

        }
        tick(text)
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.dampingFactor = 0.08

controls.enablePan = true
controls.enableZoom = true

controls.autoRotate = true
controls.autoRotateSpeed = 0

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

