import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Create a simple environment
const scene = new THREE.Scene();

// Create a platform
const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(20, 20, 1, 32),
    new THREE.MeshPhongMaterial({ color: 0x444444 })
);
platform.position.y = -0.5;
scene.add(platform);

// Add some decorative elements
for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const radius = 15;
    
    const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 10, 8),
        new THREE.MeshPhongMaterial({ color: 0x666666 })
    );
    
    pillar.position.x = Math.cos(angle) * radius;
    pillar.position.z = Math.sin(angle) * radius;
    pillar.position.y = 5;
    
    scene.add(pillar);
}

// Add some floating elements
for (let i = 0; i < 20; i++) {
    const size = Math.random() * 2 + 1;
    const geometry = Math.random() > 0.5 ? 
        new THREE.IcosahedronGeometry(size) : 
        new THREE.OctahedronGeometry(size);
    
    const color = new THREE.Color();
    color.setHSL(Math.random(), 0.7, 0.5);
    
    const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshPhongMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8
        })
    );
    
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 10 + 5;
    const height = Math.random() * 10 + 5;
    
    mesh.position.x = Math.cos(angle) * radius;
    mesh.position.z = Math.sin(angle) * radius;
    mesh.position.y = height;
    
    scene.add(mesh);
}

// Export the scene
const exporter = new GLTFExporter();

exporter.parse(scene, function (gltf) {
    const output = JSON.stringify(gltf, null, 2);
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = 'environment.gltf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}, { binary: true }); 