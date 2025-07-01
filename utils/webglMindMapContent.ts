export interface Idea {
    id: string;
    title: string;
    description: string;
    color: string;
    size: number;
}

interface WebGLConfig {
    isMenuVisible: boolean;
    isFocusMode: boolean;
}

/**
 * Generates the complete WebGL HTML content for the 3D mind map
 * @param ideas Array of ideas to visualize
 * @param config Configuration for the 3D scene
 * @returns HTML string containing the complete 3D scene
 */
export const generateWebGLContent = (ideas: Idea[], config: WebGLConfig): string => {
    const ideasData = JSON.stringify(ideas);
    const configData = JSON.stringify(config);
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                * { margin: 0; padding: 0; }
                html, body { 
                    width: 100%; 
                    height: 100%; 
                    margin: 0; 
                    overflow: hidden; 
                    background: radial-gradient(circle, #000000 0%, #0a0a0a 33%, #1a1a1a 66%, #2a2a2a 100%);
                    /* Prevent text selection and user interaction highlights */
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    -webkit-touch-callout: none;
                    -webkit-tap-highlight-color: transparent;
                }
                canvas { 
                    width: 100vw !important; 
                    height: 100vh !important; 
                    display: block;
                    /* Prevent canvas selection */
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    -webkit-touch-callout: none;
                    outline: none;
                }
            </style>
            <script async src="https://unpkg.com/es-module-shims@1.3.6/dist/es-module-shims.js"></script>
            <script type="importmap">
            {
                "imports": {
                    "three": "https://unpkg.com/three@0.150.0/build/three.module.js",
                    "three/addons/": "https://unpkg.com/three@0.150.0/examples/jsm/"
                }
            }
            </script>
        </head>
        <body>
            <script type="module">
                const ideas = ${ideasData};
                const config = ${configData};
                import * as THREE from "three";
                import { OrbitControls } from "three/addons/controls/OrbitControls.js";

                // Scene setup with beautiful gradient background
                const scene = new THREE.Scene();
                
                // Create gradient background using CubeTexture for better performance
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const context = canvas.getContext('2d');
                
                // Create elegant dark gradient
                const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
                gradient.addColorStop(0, '#1a1a1a');    // Dark gray center
                gradient.addColorStop(0.33, '#141414'); // Slightly darker
                gradient.addColorStop(0.66, '#0f0f0f'); // Very dark gray
                gradient.addColorStop(1, '#0a0a0a');    // Almost black edges
                
                context.fillStyle = gradient;
                context.fillRect(0, 0, 512, 512);
                
                const texture = new THREE.CanvasTexture(canvas);
                scene.background = texture;

                // Camera setup
                const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
                camera.position.set(0, 0, 100); // Start even further back for more zoomed-out galaxy view
                camera.lookAt(0, 0, 0);

                // Renderer setup
                const renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                document.body.appendChild(renderer.domElement);

                // Handle resize
                window.addEventListener('resize', () => {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                });

                // Controls setup
                const controls = new OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.dampingFactor = 0.05;
                controls.enableRotate = false;
                controls.enablePan = true;
                controls.enableZoom = true;
                controls.minDistance = 10;
                controls.maxDistance = 300;
                
                // Set target to center for proper panning
                controls.target.set(0, 0, 0);
                
                // Configure zoom and pan settings
                controls.panSpeed = 1.2;
                controls.zoomSpeed = 1.0;
                controls.screenSpacePanning = true;
                
                // Configure touch controls - mobile friendly
                controls.touches = {
                    ONE: THREE.TOUCH.PAN,           // Single finger for panning
                    TWO: THREE.TOUCH.DOLLY_PAN      // Two fingers for zoom AND pan
                };
                
                // Configure mouse controls for web testing
                controls.mouseButtons = {
                    LEFT: THREE.MOUSE.PAN,
                    MIDDLE: THREE.MOUSE.DOLLY,
                    RIGHT: THREE.MOUSE.DOLLY
                };
                
                // Enable all zoom methods
                controls.enableZoom = true;
                controls.zoomToCursor = true;
                
                // Proper pan limiting with dynamic bounds based on zoom level
                controls.addEventListener('change', () => {
                    // Calculate dynamic pan limit based on camera distance
                    const cameraDistance = camera.position.distanceTo(controls.target);
                    
                    // Dynamic pan limit: closer = more freedom, farther = more restricted
                    const minDistance = 10;
                    const maxDistance = 300;
                    const maxPanLimit = 40;  // Max freedom when zoomed in close
                    
                    // When fully zoomed out (within 10 units of max distance), disable panning completely
                    if (cameraDistance >= maxDistance - 10) {
                        // Lock to center position - no panning allowed
                        controls.target.set(0, 0, 0);
                        return;
                    }
                    
                    // For other zoom levels, use dynamic limiting
                    // Inverse relationship: farther camera = smaller pan limit
                    const zoomFactor = (maxDistance - cameraDistance) / (maxDistance - minDistance);
                    const dynamicPanLimit = maxPanLimit * Math.max(0, Math.min(1, zoomFactor));
                    
                    // Clamp the target position to stay within dynamic bounds
                    controls.target.x = Math.max(-dynamicPanLimit, Math.min(dynamicPanLimit, controls.target.x));
                    controls.target.y = Math.max(-dynamicPanLimit, Math.min(dynamicPanLimit, controls.target.y));
                    controls.target.z = Math.max(-dynamicPanLimit, Math.min(dynamicPanLimit, controls.target.z));
                });
                
                // Update controls after setup
                controls.update();
                
                // Simple lighting with brand orange influence
                const ambientLight = new THREE.AmbientLight(0x444444, 0.3); // Neutral dark ambient
                scene.add(ambientLight);

                // Main directional light with warm tone
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
                directionalLight.position.set(10, 10, 5);
                scene.add(directionalLight);

                // Colorful accent lights for vibrant atmosphere
                const pointLight1 = new THREE.PointLight(0x4ECDC4, 0.7, 60); // Bright teal
                pointLight1.position.set(-20, 15, 10);
                scene.add(pointLight1);

                const pointLight2 = new THREE.PointLight(0xFF6B35, 0.6, 50); // Vibrant orange
                pointLight2.position.set(20, -15, 8);
                scene.add(pointLight2);

                const pointLight3 = new THREE.PointLight(0x45B7D1, 0.5, 45); // Sky blue
                pointLight3.position.set(0, 20, -10);
                scene.add(pointLight3);

                // Create bubbles with enhanced visuals
                const bubblesGroup = new THREE.Group();
                let focusedBubble = null; // Track which bubble is focused

                // Calculate screen bounds for bubble distribution - galaxy-wide spread
                const frustumHeight = 2 * Math.tan(camera.fov * Math.PI / 180 / 2) * camera.position.z;
                const frustumWidth = frustumHeight * camera.aspect;
                const screenBounds = {
                    minX: -frustumWidth / 2 - 5, // Extended beyond screen edges for galaxy effect
                    maxX: frustumWidth / 2 + 5,   // Extended beyond screen edges for galaxy effect
                    minY: -frustumHeight / 2 + 2, // Minimal vertical margin
                    maxY: frustumHeight / 2 - 2,
                    minZ: -25, // Much deeper for galaxy-like depth
                    maxZ: 25
                };
                
                // Store bubble positions for collision detection
                const bubblePositions = [];

                // Function to check if position collides with existing bubbles - balanced spacing
                const checkCollision = (newPos, newSize, existingPositions) => {
                    for (let existing of existingPositions) {
                        const distance = newPos.distanceTo(existing.position);
                        const minDistance = (newSize + existing.size) * 3.5; // Reduced from 5.5x to 3.5x for closer spacing
                        if (distance < minDistance) {
                            return true;
                        }
                    }
                    return false;
                };

                // Function to generate non-colliding position - more attempts for better spacing
                const generatePosition = (size, attempts = 100) => { // Increased attempts from 50 to 100
                    for (let i = 0; i < attempts; i++) {
                        const position = new THREE.Vector3(
                            Math.random() * (screenBounds.maxX - screenBounds.minX) + screenBounds.minX,
                            Math.random() * (screenBounds.maxY - screenBounds.minY) + screenBounds.minY,
                            Math.random() * (screenBounds.maxZ - screenBounds.minZ) + screenBounds.minZ
                        );
                        
                        if (!checkCollision(position, size, bubblePositions)) {
                            return position;
                        }
                    }
                    
                    // If no position found, try with relaxed constraints (still better than original)
                    for (let i = 0; i < 50; i++) {
                        const position = new THREE.Vector3(
                            Math.random() * (screenBounds.maxX - screenBounds.minX) + screenBounds.minX,
                            Math.random() * (screenBounds.maxY - screenBounds.minY) + screenBounds.minY,
                            Math.random() * (screenBounds.maxZ - screenBounds.minZ) + screenBounds.minZ
                        );
                        
                        // Relaxed collision check - still 3x spacing minimum
                        let hasCollision = false;
                        for (let existing of bubblePositions) {
                            const distance = position.distanceTo(existing.position);
                            const minDistance = (size + existing.size) * 3;
                            if (distance < minDistance) {
                                hasCollision = true;
                                break;
                            }
                        }
                        
                        if (!hasCollision) {
                            return position;
                        }
                    }
                    
                    // Final fallback - random position with maximum spacing attempt
                    return new THREE.Vector3(
                        Math.random() * (screenBounds.maxX - screenBounds.minX) + screenBounds.minX,
                        Math.random() * (screenBounds.maxY - screenBounds.minY) + screenBounds.minY,
                        Math.random() * (screenBounds.maxZ - screenBounds.minZ) + screenBounds.minZ
                    );
                };

                ideas.forEach((idea, index) => {
                    // Create main sphere with enhanced material
                    const geometry = new THREE.SphereGeometry(idea.size * 2, 64, 64);
                    
                    // Enhanced PBR material for vibrant, glowing orbs
                    const material = new THREE.MeshPhysicalMaterial({
                        color: idea.color,
                        transparent: true,
                        opacity: 0.9,
                        roughness: 0.05,
                        metalness: 0.2,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.05,
                        transmission: 0.3,
                        thickness: 0.8,
                        ior: 1.6,
                        envMapIntensity: 1.2,
                        emissive: new THREE.Color(idea.color),
                        emissiveIntensity: 0.15
                    });
                    
                    const bubble = new THREE.Mesh(geometry, material);

                    // Generate position with collision avoidance
                    const position = generatePosition(idea.size * 2);
                    bubble.position.copy(position);
                    
                    // Store position for collision detection with other bubbles
                    bubblePositions.push({
                        position: position.clone(),
                        size: idea.size * 2
                    });

                    // Create enhanced rim lighting with vibrant colors
                    const outlineGeometry = new THREE.SphereGeometry(idea.size * 2.12, 64, 64);
                    const lighterColor = new THREE.Color(idea.color).lerp(new THREE.Color('#ffffff'), 0.5);
                    const outlineMaterial = new THREE.MeshBasicMaterial({
                        color: lighterColor,
                        transparent: true,
                        opacity: 0.4,
                        side: THREE.BackSide
                    });
                    const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);

                    // Create vibrant multi-layer glow effect
                    const glowGeometry1 = new THREE.SphereGeometry(idea.size * 2.5, 32, 32);
                    const glowMaterial1 = new THREE.MeshBasicMaterial({
                        color: idea.color,
                        transparent: true,
                        opacity: 0.25,
                        side: THREE.BackSide
                    });
                    const glow1 = new THREE.Mesh(glowGeometry1, glowMaterial1);
                    
                    const glowGeometry2 = new THREE.SphereGeometry(idea.size * 3.0, 32, 32);
                    const glowMaterial2 = new THREE.MeshBasicMaterial({
                        color: idea.color,
                        transparent: true,
                        opacity: 0.15,
                        side: THREE.BackSide
                    });
                    const glow2 = new THREE.Mesh(glowGeometry2, glowMaterial2);

                    // Create bright inner core for enhanced luminosity
                    const coreGeometry = new THREE.SphereGeometry(idea.size * 1.3, 32, 32);
                    const coreMaterial = new THREE.MeshBasicMaterial({
                        color: lighterColor,
                        transparent: true,
                        opacity: 0.5,
                        emissive: lighterColor,
                        emissiveIntensity: 0.4
                    });
                    const core = new THREE.Mesh(coreGeometry, coreMaterial);

                    // Create bright rim highlight for extra pop
                    const rimGeometry = new THREE.SphereGeometry(idea.size * 2.08, 32, 32);
                    const rimMaterial = new THREE.MeshBasicMaterial({
                        color: '#ffffff',
                        transparent: true,
                        opacity: 0.25,
                        side: THREE.BackSide
                    });
                    const rim = new THREE.Mesh(rimGeometry, rimMaterial);

                    bubble.add(outline);
                    bubble.add(rim);
                    bubble.add(glow1);
                    bubble.add(glow2);
                    bubble.add(core);

                    // Enhanced animations with more dynamic movement
                    const initialY = bubble.position.y;
                    const initialX = bubble.position.x;
                    const initialZ = bubble.position.z;
                    const animationOffset = Math.random() * Math.PI * 2;
                    const rotationSpeed = (Math.random() - 0.5) * 0.008; // Much slower, gentler rotation
                    const pulseSpeed = Math.random() * 0.003 + 0.001;
                    const floatAmplitude = 0.6; // Reduced for calmer movement
                    const driftSpeed = Math.random() * 0.0002 + 0.0001; // Slower drift
                    const focusedScale = 1.05; // 5% scale increase when focused
                    
                    // Animation targets for smooth transitions
                    const targetScale = new THREE.Vector3(1, 1, 1);
                    const currentScale = new THREE.Vector3(1, 1, 1);
                    
                    // Store position when focused
                    let focusedPosition = null;

                    function animate() {
                        const time = Date.now() * 0.001;
                        const isFocused = focusedBubble === bubble;
                        
                        if (!isFocused) {
                            // Clear focused position when not focused
                            focusedPosition = null;
                            
                            // Enhanced floating animation for non-focused bubbles
                            bubble.position.y = initialY + Math.sin(time + animationOffset) * floatAmplitude;
                            bubble.position.x = initialX + Math.cos(time * 0.3 + animationOffset) * 0.25; // Gentler X movement
                            bubble.position.z = initialZ + Math.sin(time * 0.4 + animationOffset) * 0.15; // Gentler Z movement
                            
                            // Add gentle orbital drift movement
                            const driftX = Math.cos(time * driftSpeed + animationOffset) * 0.8; // Reduced drift
                            const driftY = Math.sin(time * driftSpeed * 0.7 + animationOffset) * 0.6; // Reduced drift
                            bubble.position.x += driftX;
                            bubble.position.y += driftY;
                            
                            // Much gentler rotation
                            bubble.rotation.x += rotationSpeed;
                            bubble.rotation.y += rotationSpeed * 0.7;
                            bubble.rotation.z += rotationSpeed * 0.3;
                            
                            // Gentle scale pulsing
                            const scaleMultiplier = 1 + Math.sin(time * 1.5 + animationOffset) * 0.025; // Slower, smaller pulse
                            targetScale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
                        } else {
                            // Focused bubble - freeze at current position
                            if (!focusedPosition) {
                                // Store the position when first focused
                                focusedPosition = bubble.position.clone();
                            }
                            // Keep bubble at the frozen position
                            bubble.position.copy(focusedPosition);
                            
                            // 5% scale increase with subtle pulse
                            const focusedPulse = 1 + Math.sin(time * 1.2 + animationOffset) * 0.015; // Slower, smaller pulse
                            targetScale.set(focusedScale * focusedPulse, focusedScale * focusedPulse, focusedScale * focusedPulse);
                            
                            // Stop rotation when focused
                            // bubble.rotation values remain as they were when focused
                        }
                        
                        // Smooth scale transition with 200ms timing (roughly 12 frames at 60fps)
                        currentScale.lerp(targetScale, 0.2); // Faster lerp for ~200ms transition
                        bubble.scale.copy(currentScale);
                        
                        // Gentle pulsing glow effect
                        const pulseIntensity = 0.6 + Math.sin(time * 2.5 + animationOffset) * 0.2; // Slower, gentler pulse
                        glow1.material.opacity = (isFocused ? 0.3 : 0.2) * pulseIntensity;
                        glow2.material.opacity = (isFocused ? 0.15 : 0.1) * pulseIntensity;
                        core.material.emissiveIntensity = (isFocused ? 0.4 : 0.25) + pulseIntensity * 0.15; // Gentler glow
                        
                        requestAnimationFrame(animate);
                    }
                    animate();

                    // Store data for interaction
                    bubble.userData = {
                        id: idea.id,
                        title: idea.title,
                        description: idea.description,
                        color: idea.color
                    };

                    bubblesGroup.add(bubble);
                });

                scene.add(bubblesGroup);

                // Animation loop
                function animate() {
                    requestAnimationFrame(animate);
                    controls.update();
                    renderer.render(scene, camera);
                }
                animate();

                // Add message listener for React Native communication
                window.addEventListener('message', (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        if (message.type === 'RESET_SELECTION_STATE') {
                            // Reset WebView internal state
                            focusedBubble = null;
                            selectedBubble = null;
                            console.log('WebView selection state reset');
                        } else if (message.type === 'UPDATE_MENU_STATE') {
                            // Update menu state without regenerating content
                            config.isMenuVisible = message.data.isMenuVisible;
                            config.isFocusMode = message.data.isFocusMode;
                            console.log('Menu state updated:', config);
                        }
                    } catch (error) {
                        console.warn('Failed to parse message from React Native:', error);
                    }
                });

                // Add wheel event listener for additional zoom support
                renderer.domElement.addEventListener('wheel', (event) => {
                    event.preventDefault();
                    const zoomScale = event.deltaY > 0 ? 1.1 : 0.9;
                    camera.position.multiplyScalar(zoomScale);
                    camera.position.clampLength(10, 300); // Updated zoom limits
                    controls.update();
                }, { passive: false });

                // Add touch event debugging
                let touchStartDistance = 0;
                renderer.domElement.addEventListener('touchstart', (event) => {
                    if (event.touches.length === 2) {
                        const dx = event.touches[0].clientX - event.touches[1].clientX;
                        const dy = event.touches[0].clientY - event.touches[1].clientY;
                        touchStartDistance = Math.sqrt(dx * dx + dy * dy);
                    }
                });

                renderer.domElement.addEventListener('touchmove', (event) => {
                    if (event.touches.length === 2) {
                        event.preventDefault();
                        const dx = event.touches[0].clientX - event.touches[1].clientX;
                        const dy = event.touches[0].clientY - event.touches[1].clientY;
                        const touchCurrentDistance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (touchStartDistance > 0) {
                            const scale = touchCurrentDistance / touchStartDistance;
                            const zoomScale = scale > 1 ? 0.98 : 1.02;
                            camera.position.multiplyScalar(zoomScale);
                            camera.position.clampLength(10, 300); // Updated zoom limits
                            controls.update();
                            touchStartDistance = touchCurrentDistance;
                        }
                    }
                }, { passive: false });

                // Interaction setup
                const raycaster = new THREE.Raycaster();
                const mouse = new THREE.Vector2();
                let selectedBubble = null;

                renderer.domElement.addEventListener('click', (event) => {
                    event.preventDefault();
                    
                    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                    raycaster.setFromCamera(mouse, camera);
                    const intersects = raycaster.intersectObjects(bubblesGroup.children, true);

                    if (intersects.length > 0) {
                        // Find the main bubble (the one with userData)
                        let mainBubble = intersects[0].object;
                        
                        // Traverse up the hierarchy to find the bubble with userData
                        while (mainBubble && !mainBubble.userData?.title) {
                            mainBubble = mainBubble.parent;
                        }
                        
                        if (mainBubble && mainBubble.userData && mainBubble.userData.title) {
                            // If menu is visible, just hide it when clicking on orb
                            if (config.isMenuVisible) {
                                // Send message to React Native to hide menu
                                if (window.ReactNativeWebView) {
                                    window.ReactNativeWebView.postMessage(JSON.stringify({
                                        type: 'HIDE_MENU'
                                    }));
                                }
                                return;
                            }
                            
                            // Check if clicking on already focused bubble
                            if (focusedBubble === mainBubble) {
                                // Unfocus the bubble and hide popup
                                focusedBubble = null;
                                selectedBubble = null;
                                // Send message to hide popup
                                if (window.ReactNativeWebView) {
                                    window.ReactNativeWebView.postMessage(JSON.stringify({
                                        type: 'HIDE_IDEA_POPUP'
                                    }));
                                }
                            } else {
                                // Focus on new bubble and show popup
                                focusedBubble = mainBubble;
                                selectedBubble = mainBubble;
                                // Send idea data to React Native for popup
                                if (window.ReactNativeWebView) {
                                    window.ReactNativeWebView.postMessage(JSON.stringify({
                                        type: 'SHOW_IDEA_POPUP',
                                        data: {
                                            id: mainBubble.userData.id,
                                            title: mainBubble.userData.title,
                                            description: mainBubble.userData.description,
                                            color: mainBubble.userData.color,
                                            screenX: event.clientX,
                                            screenY: event.clientY
                                        }
                                    }));
                                }
                            }
                        } else {
                            // If we can't find a valid bubble, treat as background click
                            // Check if there's currently a popup showing
                            const hasActivePopup = selectedBubble !== null || focusedBubble !== null;
                            
                            focusedBubble = null;
                            selectedBubble = null;
                            
                            // Send message to hide popup if there was one
                            if (hasActivePopup && window.ReactNativeWebView) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'HIDE_IDEA_POPUP'
                                }));
                            }
                            
                            // Only send background click message if there was no active popup and not in focus mode
                            if (!hasActivePopup && !config.isFocusMode && window.ReactNativeWebView) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'BACKGROUND_CLICK'
                                }));
                            }
                        }
                    } else {
                        // Clicked on background
                        // Check if there's currently a popup showing
                        const hasActivePopup = selectedBubble !== null || focusedBubble !== null;
                        
                        focusedBubble = null;
                        selectedBubble = null;
                        
                        // Send message to hide popup if there was one
                        if (hasActivePopup && window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'HIDE_IDEA_POPUP'
                            }));
                        }
                        
                        // Only send background click message if there was no active popup and not in focus mode
                        if (!hasActivePopup && !config.isFocusMode && window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'BACKGROUND_CLICK'
                            }));
                        }
                    }
                });
            </script>
        </body>
        </html>
    `;
}; 