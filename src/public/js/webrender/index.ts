import * as THREE from "three"
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader"
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'			import { SAOPass } from 'three/addons/postprocessing/SAOPass.js';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

import { getMouseDegrees, getMousePos } from "./utils";

export async function setupRenderer(): Promise<any> {
    const container = document.querySelector('.book-render')

    const loader = new GLTFLoader();
    const scene = new THREE.Scene()
    const model = await new Promise<GLTF>((resolve, reject) => loader.load(
        'models/book.gltf',
        function (gltf) {
            console.log("model loaded")
            container?.setAttribute("data-obj-loaded", "")
            resolve(gltf)
        },
        function (xhr) {
            console.log(xhr.total, xhr.loaded)
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        function (error) {
            reject(error)
            console.log('An error happened');

        }
    ))
    const sun = new THREE.PointLight(0xffffff, 40)
    scene.add(sun)
    sun.position.set(0, 10, 0)
    sun.castShadow = true

    const blue = new THREE.PointLight(0x4DB7D1, 10)
    blue.castShadow = true
    scene.add(blue)

    const hemi = new THREE.SpotLight(0xffffff, 55)
    scene.add(hemi)
    hemi.castShadow = true
    const hemi2 = new THREE.SpotLight(0xffffff, 30)
    scene.add(hemi2)
    hemi2.castShadow = true

    blue.position.set(-3, -1, 4)
    hemi.position.set(6, -1, 0)
    hemi2.position.set(-4, 1, 0)

    const bookOBJ = model.scene.getObjectByName("Cylinder")
    console.log(model.scene)
    console.log(bookOBJ)
    if (bookOBJ) {
        bookOBJ.castShadow = true
        bookOBJ.receiveShadow = true
        hemi.target = bookOBJ
        hemi2.target = bookOBJ
    }
    var mousecoords = { x: 0, y: 0 }
    document.addEventListener('mousemove', function (e) {
        mousecoords = getMousePos(e);
    });


    const camera = new THREE.PerspectiveCamera(
        21,
        1,
        0.1,
        1000
    )
    camera.position.copy(model.cameras[0].position)
    camera.rotation.copy(model.cameras[0].rotation)
    scene.add(model.scene)
    
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(Math.min(window.innerWidth, window.innerHeight), Math.min(window.innerWidth, window.innerHeight))
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    if (!container) return null;
    container.append(renderer.domElement)
    window.addEventListener("resize", onWindowResize, false)
    
    const composer = new EffectComposer( renderer );

    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );
    const saoPass = new SAOPass( scene, camera, false, true );
    saoPass.params.saoIntensity = 0.02
    saoPass.params.saoScale = 5
    // saoPass.params.saoBias = 1
    saoPass.params.saoMinResolution = 0.0001
    // saoPass.params.saoBlur = 

    composer.addPass( saoPass );
    const outputPass = new OutputPass();
    composer.addPass( outputPass );

    function onWindowResize() {
        camera.updateProjectionMatrix();
        renderer.setSize(Math.min(window.innerWidth, window.innerHeight), Math.min(window.innerWidth, window.innerHeight))
    }
    const helper2 = new THREE.CameraHelper(hemi2.shadow.camera)
    const helper = new THREE.CameraHelper(hemi.shadow.camera)
    // scene.add(helper)
    // scene.add(helper2)
    // renderer.shadowMap.enabled = true
    // renderer.shadowMap.type = THREE.VSMShadowMap
    const rotx = bookOBJ!.rotation.x
    const roty = bookOBJ!.rotation.y
    function animate() {
        requestAnimationFrame(animate);
        if (bookOBJ) {
            const time = Date.now() * 0.001; // Convert milliseconds to seconds
            const amplitude = 0.1; // Adjust the amplitude of the oscillation
            const frequency = 1; // Adjust the frequency of the oscillation
            const deg = getMouseDegrees(mousecoords.x, mousecoords.y, 4)
            bookOBJ.position.z = amplitude * Math.sin(frequency * time);
            bookOBJ.rotation.x = amplitude * Math.sin(0.3 * time) + rotx;

            // bookOBJ.rotation.z = THREE.MathUtils.degToRad(deg.y)
            bookOBJ.rotation.y = -THREE.MathUtils.degToRad(deg.x)/5 + roty
            // bookOBJ.rotation.z = THREE.MathUtils.degToRad(deg.z)
        }
        composer.render()
    }
    animate()

}