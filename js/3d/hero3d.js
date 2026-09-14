// Immersive 3D Hero Scene using Three.js
class Hero3D {
    constructor() {
        this.container = document.getElementById('hero-3d-container');
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.meshGroup = null;
        this.particles = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        this.init();
    }

    init() {
        // Check reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 7;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x6366f1, 3, 50);
        pointLight1.position.set(5, 5, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x8b5cf6, 2, 50);
        pointLight2.position.set(-5, -5, 2);
        this.scene.add(pointLight2);

        // Abstract Floating Geometric Objects representing NovaCart Tech
        this.meshGroup = new THREE.Group();

        // Central Icosahedron (Core Tech Product)
        const geometry = new THREE.IcosahedronGeometry(2, 0);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x6366f1,
            metalness: 0.3,
            roughness: 0.2,
            transmission: 0.6,
            thickness: 1.2,
            wireframe: false
        });
        this.coreMesh = new THREE.Mesh(geometry, material);
        this.meshGroup.add(this.coreMesh);

        // Outer Ring Wireframe
        const ringGeo = new THREE.TorusGeometry(3.2, 0.04, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true });
        this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
        this.meshGroup.add(this.ringMesh);

        this.scene.add(this.meshGroup);

        // Particle Field
        const particleCount = 400;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20;
            positions[i + 1] = (Math.random() - 0.5) * 20;
            positions[i + 2] = (Math.random() - 0.5) * 20;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0x8b5cf6,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });

        this.particles = new THREE.Points(particleGeo, particleMat);
        this.scene.add(this.particles);

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('mousemove', (e) => this.onDocumentMouseMove(e));

        // Start animation loop
        this.animate();
    }

    onWindowResize() {
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onDocumentMouseMove(event) {
        this.mouseX = (event.clientX - this.windowHalfX);
        this.mouseY = (event.clientY - this.windowHalfY);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.targetX = this.mouseX * 0.001;
        this.targetY = this.mouseY * 0.001;

        if (this.coreMesh) {
            this.coreMesh.rotation.x += 0.003;
            this.coreMesh.rotation.y += 0.005;
        }

        if (this.ringMesh) {
            this.ringMesh.rotation.x -= 0.002;
            this.ringMesh.rotation.z += 0.003;
        }

        if (this.meshGroup) {
            this.meshGroup.rotation.y += (this.targetX - this.meshGroup.rotation.y) * 0.05;
            this.meshGroup.rotation.x += (this.targetY - this.meshGroup.rotation.x) * 0.05;
        }

        if (this.particles) {
            this.particles.rotation.y -= 0.0005;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen after initialization
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 500);
        }
    }, 800);

    new Hero3D();
});
