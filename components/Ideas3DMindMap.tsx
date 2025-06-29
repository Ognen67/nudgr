import React, { useEffect, useState, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View, Dimensions, Modal, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ENDPOINTS } from '@/utils/api';
import { useRefresh } from '@/contexts/RefreshContext';
import { triggerTaskPreview as globalTriggerTaskPreview } from '@/utils/taskPreviewService';

export interface Idea {
    id: string;
    title: string;
    description: string;
    color: string;
    size: number;
}

interface Ideas3DMindMapProps {
    onBackgroundClick?: () => void;
    isMenuVisible?: boolean;
    isFocusMode?: boolean;
    onHideMenu?: () => void;
    onIdeaCreated?: (ideaTitle: string, ideaDescription: string) => void;
    onTriggerTaskPreview?: (thought: string) => void;
}

interface IdeaSuccessData {
    ideaTitle: string;
    ideaDescription: string;
}

interface SelectedIdeaData {
    id: string;
    title: string;
    description: string;
    color: string;
    screenX: number;
    screenY: number;
}

// Function to transform API response to visualization format
const transformIdeasForVisualization = (apiIdeas: any[]): Idea[] => {
    return apiIdeas.map((idea, index) => ({
        id: idea.id,
        title: idea.title,
        description: idea.description || idea.content || '',
        color: getColorForIndex(index),
        size: index === 0 ? 3.0 : Math.random() * 1.5 + 1.2 // First idea is largest
    }));
};

// Generate vibrant, high-contrast color palette
const getColorForIndex = (index: number): string => {
    const colors = [
        '#FF6B35', // vibrant orange (signature)
        '#4ECDC4', // bright teal
        '#45B7D1', // sky blue
        '#96CEB4', // mint green
        '#FFEAA7', // warm yellow
        '#DDA0DD', // plum
        '#98D8C8', // seafoam
        '#F7DC6F', // golden yellow
        '#BB8FCE', // lavender
        '#85C1E9', // light blue
        '#F8C471', // peach
        '#82E0AA', // light green
        '#F1948A', // coral pink
        '#AED6F1', // powder blue
        '#D7BDE2', // light purple
        '#A3E4D7', // mint
        '#FAD7A0', // cream
        '#E8DAEF', // lilac
        '#D5DBDB', // light gray
        '#FADBD8', // blush
        '#D0ECE7', // pale teal
        '#FCF3CF', // light yellow
        '#EBDEF0', // pale lavender
        '#D6EAF8', // ice blue
        '#E8F8F5', // very pale mint
    ];
    
    return colors[index % colors.length];
};

// Mock data for testing - fallback when API fails
const MOCK_IDEAS: Idea[] = [
    {
        id: '1',
        title: 'AI-Powered Task Prioritization',
        description: 'Use machine learning to automatically prioritize tasks based on user behavior and preferences.',
        color: '#FF6B35', // Vibrant orange
        size: 3.0
    },
    {
        id: '2',
        title: 'Social Goal Sharing',
        description: 'Share goals and progress with friends for accountability.',
        color: '#4ECDC4', // Bright teal
        size: 2.0
    },
    {
        id: '3',
        title: 'Habit Formation Analytics',
        description: 'Track and analyze habit formation patterns.',
        color: '#45B7D1', // Sky blue
        size: 2.0
    },
    {
        id: '4',
        title: 'Time Block Visualization',
        description: 'Visual representation of time blocks.',
        color: '#96CEB4', // Mint green
        size: 1.5
    },
    {
        id: '5',
        title: 'Smart Notifications',
        description: 'Context-aware notifications that adapt to your schedule.',
        color: '#FFEAA7', // Warm yellow
        size: 1.5
    },
    {
        id: '6',
        title: 'Focus Mode 2.0',
        description: 'Enhanced focus mode with ambient sounds.',
        color: '#DDA0DD', // Plum
        size: 1.2
    }
];

export const Ideas3DMindMap: React.FC<Ideas3DMindMapProps> = ({ 
    onBackgroundClick, 
    isMenuVisible = false, 
    isFocusMode = false, 
    onHideMenu,
    onIdeaCreated,
    onTriggerTaskPreview
}) => {
    const [ideas, setIdeas] = useState<Idea[]>(MOCK_IDEAS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showIdeaSuccessModal, setShowIdeaSuccessModal] = useState(false);
    const [ideaSuccessData, setIdeaSuccessData] = useState<IdeaSuccessData | null>(null);
    const [showIdeaPopup, setShowIdeaPopup] = useState(false);
    const [selectedIdeaData, setSelectedIdeaData] = useState<SelectedIdeaData | null>(null);
    const { ideasRefreshTrigger } = useRefresh();
    const webViewRef = useRef<WebView>(null);

    useEffect(() => {
        fetchIdeas();
    }, []);

    // Refresh ideas when refresh trigger changes (only when new ideas are created)
    useEffect(() => {
        if (ideasRefreshTrigger > 0) {
            fetchIdeas();
        }
    }, [ideasRefreshTrigger]);

    // Show loading or error state if needed
    if (loading && ideas.length === 0) {
        console.log('Loading ideas...');
    }

    if (error && ideas.length === 0) {
        console.warn('Error loading ideas, using fallback data:', error);
    }

    const { width, height } = Dimensions.get('window');

    const generateWebGLContent = (ideas: Idea[]) => {
        const ideasData = JSON.stringify(ideas);
        const configData = JSON.stringify({
            isMenuVisible,
            isFocusMode
        });
        
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
                    }
                    canvas { 
                        width: 100vw !important; 
                        height: 100vh !important; 
                        display: block;
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
                    
                    // Set reasonable pan limits to restrict movement
                    const panLimitXY = 60; // Moderate pan area for X and Y
                    const panLimitZ = 40;   // Limit Z-axis movement as well
                    controls.minPan = new THREE.Vector3(-panLimitXY, -panLimitXY, -panLimitZ);
                    controls.maxPan = new THREE.Vector3(panLimitXY, panLimitXY, panLimitZ);

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

    const showIdeaCreatedPopup = (ideaTitle: string, ideaDescription: string) => {
        setIdeaSuccessData({
            ideaTitle,
            ideaDescription
        });
        setShowIdeaSuccessModal(true);
        
        // Add haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Call parent callback if provided
        if (onIdeaCreated) {
            onIdeaCreated(ideaTitle, ideaDescription);
        }
    };

    const handleCloseIdeaSuccess = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowIdeaSuccessModal(false);
        setIdeaSuccessData(null);
    };

    const handleViewIdeas = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowIdeaSuccessModal(false);
        setIdeaSuccessData(null);
        // Could navigate to ideas list or refresh the current view
        // For now, just refresh the ideas
        fetchIdeas();
    };

    const handleForgetIdea = async () => {
        if (!selectedIdeaData) return;
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        try {
            const response = await fetch(`${ENDPOINTS.IDEAS}/${selectedIdeaData.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Idea deleted successfully');
            
            // Remove the idea from local state (seamless removal without position changes)
            setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== selectedIdeaData.id));
            
            // Close popup
            setShowIdeaPopup(false);
            setSelectedIdeaData(null);
            
            // Reset WebView state
            if (webViewRef.current) {
                webViewRef.current.postMessage(JSON.stringify({
                    type: 'RESET_SELECTION_STATE'
                }));
            }
            
            // Show haptic feedback for successful deletion
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            
        } catch (error) {
            console.error('Error deleting idea:', error);
            // Could show an error alert here
        }
    };

    const handleExpandIdea = async () => {
        if (!selectedIdeaData) return;
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Close popup first
        setShowIdeaPopup(false);
        setSelectedIdeaData(null);
        
        // Reset WebView state
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'RESET_SELECTION_STATE'
            }));
        }
        
        // Try to use global TaskPreview function from AppLayout
        const thoughtContent = `${selectedIdeaData.title}: ${selectedIdeaData.description}`;
        
        console.log('Attempting to trigger task preview with thought:', thoughtContent);
        globalTriggerTaskPreview(thoughtContent);
        
        // The global trigger function should handle the modal display
        // No need for fallback since we're on the ideas screen with AppLayout
    };

    const handleCloseIdeaPopup = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowIdeaPopup(false);
        setSelectedIdeaData(null);
        
        // Send message to WebView to reset its internal state
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'RESET_SELECTION_STATE'
            }));
        }
    };

    const fetchIdeas = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(ENDPOINTS.IDEAS, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const apiIdeas = await response.json();
            console.log('Fetched ideas from API:', apiIdeas);

            if (Array.isArray(apiIdeas) && apiIdeas.length > 0) {
                const transformedIdeas = transformIdeasForVisualization(apiIdeas);
                setIdeas(transformedIdeas);
            } else {
                console.log('No ideas found, using mock data');
                setIdeas(MOCK_IDEAS);
            }
        } catch (error) {
            console.error('Error fetching ideas:', error);
            setError(error instanceof Error ? error.message : 'Unknown error');
            // Fallback to mock data if fetch fails
            setIdeas(MOCK_IDEAS);
        } finally {
            setLoading(false);
        }
    };

    const handleWebViewMessage = (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'BACKGROUND_CLICK' && onBackgroundClick) {
                onBackgroundClick();
            } else if (message.type === 'HIDE_MENU' && onHideMenu) {
                onHideMenu();
            } else if (message.type === 'IDEA_CREATED') {
                // Show the idea creation success popup
                showIdeaCreatedPopup(
                    message.data?.title || 'New Idea',
                    message.data?.description || 'Your idea has been created successfully!'
                );
            } else if (message.type === 'SHOW_IDEA_POPUP') {
                // Show the idea popup modal
                setSelectedIdeaData({
                    id: message.data.id,
                    title: message.data.title,
                    description: message.data.description,
                    color: message.data.color,
                    screenX: message.data.screenX,
                    screenY: message.data.screenY
                });
                setShowIdeaPopup(true);
            } else if (message.type === 'HIDE_IDEA_POPUP') {
                // Hide the idea popup modal
                setShowIdeaPopup(false);
                setSelectedIdeaData(null);
                // Note: No need to reset WebView state here as this message came FROM the WebView
            }
        } catch (error) {
            console.warn('Failed to parse WebView message:', error);
        }
    };

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ html: generateWebGLContent(ideas) }}
                style={styles.webview}
                scrollEnabled={true}
                bounces={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                overScrollMode="never"
                scalesPageToFit={false}
                onMessage={handleWebViewMessage}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                }}
            />

            {/* Idea Success Modal */}
            <Modal visible={showIdeaSuccessModal} transparent animationType="fade">
                <View style={styles.ideaSuccessModalContainer}>
                    <BlurView intensity={80} tint="dark" style={styles.ideaSuccessModalBlur}>
                        <View style={styles.ideaSuccessModalContent}>
                            <LinearGradient
                                colors={['rgba(255,107,53,0.15)', '#2A2A2A', '#1E1E1E']}
                                style={styles.ideaSuccessModalGradient}
                            >
                                {/* Success Icon */}
                                <View style={styles.ideaSuccessIconContainer}>
                                    <LinearGradient
                                        colors={['#FF6B35', '#FF8C42']}
                                        style={styles.ideaSuccessIconGradient}
                                    >
                                        <Ionicons name="bulb" size={32} color="#FFFFFF" />
                                    </LinearGradient>
                                </View>

                                {/* Success Content */}
                                <Text style={styles.ideaSuccessTitle}>
                                    Idea Created! 💡
                                </Text>
                                
                                <Text style={styles.ideaSuccessMessage}>
                                    Your idea "{ideaSuccessData?.ideaTitle}" has been successfully added to your collection!
                                </Text>

                                {/* Action Buttons */}
                                <View style={styles.ideaSuccessButtonContainer}>
                                    <TouchableOpacity 
                                        style={styles.viewIdeasButton}
                                        onPress={handleViewIdeas}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={['#FF6B35', '#FF8C42']}
                                            style={styles.viewIdeasButtonGradient}
                                        >
                                            <Ionicons name="bulb-outline" size={20} color="#FFFFFF" />
                                            <Text style={styles.viewIdeasButtonText}>Explore Ideas</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={styles.ideaContinueButton}
                                        onPress={handleCloseIdeaSuccess}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.ideaContinueButtonText}>Continue</Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </View>
                    </BlurView>
                </View>
            </Modal>

            {/* Floating Idea Popup */}
            {showIdeaPopup && (
                <View style={[
                    styles.floatingPopup, 
                    {
                        left: Math.max(20, Math.min(width - 320, (selectedIdeaData?.screenX || 0) - 150)),
                        top: Math.max(80, Math.min(height - 220, (selectedIdeaData?.screenY || 0) + 50))
                    }
                ]}>
                    <BlurView intensity={80} tint="dark" style={styles.floatingPopupBlur}>
                        {/* Idea Content */}
                        <Text style={styles.floatingPopupTitle}>
                            {selectedIdeaData?.title}
                        </Text>
                        
                        <Text style={styles.floatingPopupDescription}>
                            {selectedIdeaData?.description}
                        </Text>

                        {/* Action Buttons */}
                        <View style={styles.floatingPopupButtonContainer}>
                            <TouchableOpacity 
                                style={styles.expandIdeaButtonSmall}
                                onPress={handleExpandIdea}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#FF6B35', '#FF8C42']}
                                    style={styles.expandIdeaButtonSmallGradient}
                                >
                                    <Ionicons name="rocket-outline" size={16} color="#FFFFFF" />
                                    <Text style={styles.expandIdeaButtonSmallText}>Expand</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.forgetIdeaButtonSmall}
                                onPress={handleForgetIdea}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['rgba(40, 40, 40, 0.8)', 'rgba(20, 20, 20, 0.4)', 'rgba(0, 0, 0, 0.1)']}
                                    style={styles.forgetIdeaButtonSmallGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.forgetIdeaButtonSmallText}>Forget</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a1a', // Dark gray base color to match gradient
    },
    webview: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
    },
    // Idea Success Modal Styles - matching goal success modal design
    ideaSuccessModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    ideaSuccessModalBlur: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ideaSuccessModalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 20,
    },
    ideaSuccessModalGradient: {
        padding: 32,
        alignItems: 'center',
    },
    ideaSuccessIconContainer: {
        marginBottom: 24,
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    ideaSuccessIconGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ideaSuccessTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'Inter',
    },
    ideaSuccessMessage: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        fontFamily: 'Inter',
    },
    ideaSuccessButtonContainer: {
        width: '100%',
        gap: 12,
    },
    viewIdeasButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    viewIdeasButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    viewIdeasButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 8,
        fontFamily: 'Inter',
    },
    ideaContinueButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    ideaContinueButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        fontFamily: 'Inter',
    },
    // Floating Popup Styles
    floatingPopup: {
        position: 'absolute',
        width: 300,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 20,
        zIndex: 1000,
    },
    floatingPopupBlur: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(15, 15, 15, 0.85)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        padding: 24,
        backdropFilter: 'blur(20px)',
    },
    floatingPopupTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
        fontFamily: 'Inter',
        letterSpacing: 0.3,
    },
    floatingPopupDescription: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.75)',
        lineHeight: 22,
        marginBottom: 20,
        fontFamily: 'Inter',
        letterSpacing: 0.2,
    },
    floatingPopupButtonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    expandIdeaButtonSmall: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    expandIdeaButtonSmallGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    expandIdeaButtonSmallText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 6,
        fontFamily: 'Inter',
        letterSpacing: 0.3,
    },
    forgetIdeaButtonSmall: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    forgetIdeaButtonSmallGradient: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    forgetIdeaButtonSmallText: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        fontFamily: 'Inter',
        letterSpacing: 0.2,
    },
});

export default Ideas3DMindMap;