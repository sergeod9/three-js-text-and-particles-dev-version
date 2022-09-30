import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
// Import the font loader and the text geometry classes
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js'
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
gui.hide()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
/**
 * Textures
 */
 const textureLoader = new THREE.TextureLoader()

/**
 * Font
 */
// Creating a matcap material to be used for text and particles
 const matcapTexture = textureLoader.load(
    './textures/matcaps/8.png'
)
const textMaterial = new THREE.MeshMatcapMaterial(
    {matcap: matcapTexture,
    flatShading: false}
    )

// Creating the text
const fontsLoader = new FontLoader()

fontsLoader.load(
    '/fonts/Montserrat SemiBold_Regular.json',
    font => {
        const textGeometry = new TextGeometry('Georges D3', {
            font: font,
            size: 0.5,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelOffset: 0.01,
            bevelSegments: 3
        })
        // ///// Centering the text the LOOONG WAY /////
        // // Create the bounding box
        // textGeometry.computeBoundingBox()
        // // Calculate the centre point
        // // I made a function to do that below
        // const textBoundingCenterX = 
        //     getCenterAxes(textGeometry.boundingBox).x
        // const textBoundingCenterY = 
        //     getCenterAxes(textGeometry.boundingBox).y
        // const textBoundingCenterZ = 
        //     getCenterAxes(textGeometry.boundingBox).z

        // console.log(textBoundingCenterX)
        // console.log(textBoundingCenterY)
        // console.log(textBoundingCenterZ)
        // textGeometry.translate(
        //    - textBoundingCenterX,
        //    - textBoundingCenterY,
        //    - textBoundingCenterZ
        // )
        // // Re calculate bounding box to make sure centering was successful
        // textGeometry.computeBoundingBox()
        // // The min and max values should match, with opposit sign
        // console.log(textGeometry.boundingBox)

        // Or just use :'(
        textGeometry.center()
        const text = new THREE.Mesh(textGeometry, textMaterial)

        scene.add(text)
    }
)

// // My function to calculate center for the text geometry :)
// function getCenterAxes(boundingBox){
//     const x = (boundingBox.max.x + boundingBox.min.x) /2
//     const y = (boundingBox.max.y + boundingBox.min.y) /2
//     const z = (boundingBox.max.z + boundingBox.min.z) /2
//     return {x,y,z}
// }

/**
 * Particles
 */
let particlesArray =[]
const particleGeometry = new THREE.BoxGeometry(.15,.15,.15)
console.time()
for (let i = 0; i < 2000; i++){
    // create a new mesh for each iteration
    const particle = new THREE.Mesh(particleGeometry, textMaterial)
    particle.position.x = (Math.random() - 0.5) * 20
    particle.position.y = (Math.random() - 0.5) * 20
    particle.position.z = (Math.random() - 0.5) * 20
    particle.rotation.x = (Math.random() * Math.PI)
    particle.rotation.y = (Math.random() * Math.PI)
    const randomScale = Math.random()+0.05
    particlesArray.push(particle)
    particle.scale.set (randomScale, randomScale, randomScale)
    scene.add(particle)

}

console.timeEnd()

// /**
//  * Axes Helper
//  */
//  const helper = new THREE.AxesHelper(.8)
//  scene.add(helper)


/**
 * Object
 */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
)

// scene.add(cube)

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
camera.position.x = -1.5
camera.position.y = -1
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setClearColor( 0x000000, 0 ); 
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let timer = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const alternator = Math.sin(elapsedTime)
    let delta = elapsedTime - timer
    for (let particle of particlesArray){
        const positionFromCameraFactor = particle.position.distanceTo(camera.position)
        // The furthest from camera the less the particles move
        particle.position.y += (alternator * 0.004 )/ positionFromCameraFactor
        particle.rotation.y += delta 
        particle.rotation.x += delta
    }
    timer = elapsedTime

    // Update controls
    controls.update()
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()