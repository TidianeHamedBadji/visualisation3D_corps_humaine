        // Variables globales
        let scene, camera, renderer, controls;
        let bodyParts = {};
        let raycaster, mouse;
        let selectedObject = null;

        // Données anatomiques pour les annotations
        const anatomyData = {
            skull: {
                name: "Crâne",
                description: "Structure osseuse qui protège le cerveau. Composé de 22 os fusionnés.",
                system: "skeleton"
            },
            ribcage: {
                name: "Cage thoracique",
                description: "Ensemble de côtes qui protègent les organes vitaux du thorax.",
                system: "skeleton"
            },
            heart: {
                name: "Cœur",
                description: "Organe musculaire qui pompe le sang dans tout l'organisme.",
                system: "organs"
            },
            lungs: {
                name: "Poumons",
                description: "Organes respiratoires qui permettent les échanges gazeux.",
                system: "organs"
            },
            liver: {
                name: "Foie",
                description: "Plus gros organe interne, joue un rôle crucial dans la digestion.",
                system: "organs"
            },
            brain: {
                name: "Cerveau",
                description: "Centre de contrôle du système nerveux, siège de la conscience.",
                system: "nervous"
            },
            spine: {
                name: "Colonne vertébrale",
                description: "Structure osseuse et nerveuse qui soutient le corps.",
                system: "skeleton"
            }
        };

        // Initialisation
        function init() {
            // Scène
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x1a1a2e);

            // Caméra
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 5, 10);

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.getElementById('container').appendChild(renderer.domElement);

            // Contrôles orbitaux (simulation)
            setupControls();

            // Raycaster pour les interactions
            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            // Éclairage
            setupLighting();

            // Création du modèle 3D
            createHumanBody();

            // Événements
            setupEventListeners();

            // Masquer le loading
            document.getElementById('loading').style.display = 'none';

            // Animation
            animate();
        }

        function setupControls() {
            // Simulation basique des contrôles orbitaux
            let isDragging = false;
            let previousMousePosition = { x: 0, y: 0 };

            renderer.domElement.addEventListener('mousedown', (event) => {
                if (event.button === 0) {
                    isDragging = true;
                    previousMousePosition = { x: event.clientX, y: event.clientY };
                }
            });

            renderer.domElement.addEventListener('mousemove', (event) => {
                if (isDragging) {
                    const deltaMove = {
                        x: event.clientX - previousMousePosition.x,
                        y: event.clientY - previousMousePosition.y
                    };

                    const deltaRotationQuaternion = new THREE.Quaternion()
                        .setFromEuler(new THREE.Euler(
                            toRadians(deltaMove.y * 0.5),
                            toRadians(deltaMove.x * 0.5),
                            0,
                            'XYZ'
                        ));

                    scene.quaternion.multiplyQuaternions(deltaRotationQuaternion, scene.quaternion);
                    previousMousePosition = { x: event.clientX, y: event.clientY };
                }
            });

            renderer.domElement.addEventListener('mouseup', () => {
                isDragging = false;
            });

            renderer.domElement.addEventListener('wheel', (event) => {
                camera.position.z += event.deltaY * 0.01;
                camera.position.z = Math.max(5, Math.min(50, camera.position.z));
            });
        }

        function toRadians(angle) {
            return angle * (Math.PI / 180);
        }

        function setupLighting() {
            // Lumière ambiante
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            scene.add(ambientLight);

            // Lumière directionnelle
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(10, 10, 5);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            // Lumières d'appoint
            const light1 = new THREE.PointLight(0x4CAF50, 0.5, 50);
            light1.position.set(-10, 0, 0);
            scene.add(light1);

            const light2 = new THREE.PointLight(0x2196F3, 0.5, 50);
            light2.position.set(10, 0, 0);
            scene.add(light2);
        }

        function createHumanBody() {
            const bodyGroup = new THREE.Group();
            
            // Squelette
            createSkeleton(bodyGroup);
            
            // Organes
            createOrgans(bodyGroup);
            
            // Muscles
            createMuscles(bodyGroup);
            
            // Système nerveux
            createNervousSystem(bodyGroup);
            
            // Système circulatoire
            createCirculatorySystem(bodyGroup);

            scene.add(bodyGroup);
        }

        function createSkeleton(parent) {
            const skeletonGroup = new THREE.Group();
            skeletonGroup.name = 'skeleton';

            // Crâne
            const skullGeometry = new THREE.SphereGeometry(1.2, 16, 16);
            const skullMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffffff, 
                transparent: true, 
                opacity: 0.8 
            });
            const skull = new THREE.Mesh(skullGeometry, skullMaterial);
            skull.position.y = 6;
            skull.userData = { id: 'skull', system: 'skeleton' };
            skeletonGroup.add(skull);

            // Colonne vertébrale
            const spineGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8, 8);
            const spineMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xf0f0f0, 
                transparent: true, 
                opacity: 0.8 
            });
            const spine = new THREE.Mesh(spineGeometry, spineMaterial);
            spine.position.y = 2;
            spine.userData = { id: 'spine', system: 'skeleton' };
            skeletonGroup.add(spine);

            // Cage thoracique
            const ribcageGeometry = new THREE.CylinderGeometry(1.8, 1.5, 3, 12, 1, true);
            const ribcageMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xeeeeee, 
                transparent: true, 
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const ribcage = new THREE.Mesh(ribcageGeometry, ribcageMaterial);
            ribcage.position.y = 4;
            ribcage.userData = { id: 'ribcage', system: 'skeleton' };
            skeletonGroup.add(ribcage);

            bodyParts.skeleton = skeletonGroup;
            parent.add(skeletonGroup);
        }

        function createOrgans(parent) {
            const organsGroup = new THREE.Group();
            organsGroup.name = 'organs';

            // Cœur
            const heartGeometry = new THREE.SphereGeometry(0.6, 12, 12);
            const heartMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xff6b6b, 
                transparent: true, 
                opacity: 0.8 
            });
            const heart = new THREE.Mesh(heartGeometry, heartMaterial);
            heart.position.set(-0.5, 4, 0);
            heart.scale.set(1, 0.8, 1.2);
            heart.userData = { id: 'heart', system: 'organs' };
            organsGroup.add(heart);

            // Poumons
            const lungGeometry = new THREE.SphereGeometry(0.8, 12, 12);
            const lungMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffa8a8, 
                transparent: true, 
                opacity: 0.7 
            });
            
            const leftLung = new THREE.Mesh(lungGeometry, lungMaterial);
            leftLung.position.set(-1.2, 4.5, 0);
            leftLung.scale.set(0.8, 1.2, 0.6);
            leftLung.userData = { id: 'lungs', system: 'organs' };
            organsGroup.add(leftLung);

            const rightLung = new THREE.Mesh(lungGeometry, lungMaterial);
            rightLung.position.set(1.2, 4.5, 0);
            rightLung.scale.set(0.8, 1.2, 0.6);
            rightLung.userData = { id: 'lungs', system: 'organs' };
            organsGroup.add(rightLung);

            // Foie
            const liverGeometry = new THREE.BoxGeometry(2, 1, 1.5);
            const liverMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x8B4513, 
                transparent: true, 
                opacity: 0.8 
            });
            const liver = new THREE.Mesh(liverGeometry, liverMaterial);
            liver.position.set(0.5, 2.5, 0);
            liver.userData = { id: 'liver', system: 'organs' };
            organsGroup.add(liver);

            bodyParts.organs = organsGroup;
            parent.add(organsGroup);
        }

        function createMuscles(parent) {
            const musclesGroup = new THREE.Group();
            musclesGroup.name = 'muscles';

            // Corps musculaire principal
            const torsoGeometry = new THREE.CylinderGeometry(1.8, 1.5, 4, 12);
            const muscleMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x4ecdc4, 
                transparent: true, 
                opacity: 0.4 
            });
            const torso = new THREE.Mesh(torsoGeometry, muscleMaterial);
            torso.position.y = 3.5;
            musclesGroup.add(torso);

            // Bras
            const armGeometry = new THREE.CylinderGeometry(0.4, 0.3, 3, 8);
            const leftArm = new THREE.Mesh(armGeometry, muscleMaterial);
            leftArm.position.set(-2.5, 4, 0);
            leftArm.rotation.z = Math.PI / 4;
            musclesGroup.add(leftArm);

            const rightArm = new THREE.Mesh(armGeometry, muscleMaterial);
            rightArm.position.set(2.5, 4, 0);
            rightArm.rotation.z = -Math.PI / 4;
            musclesGroup.add(rightArm);

            bodyParts.muscles = musclesGroup;
            parent.add(musclesGroup);
        }

        function createNervousSystem(parent) {
            const nervousGroup = new THREE.Group();
            nervousGroup.name = 'nervous';

            // Cerveau
            const brainGeometry = new THREE.SphereGeometry(1, 16, 16);
            const brainMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffe066, 
                transparent: true, 
                opacity: 0.8 
            });
            const brain = new THREE.Mesh(brainGeometry, brainMaterial);
            brain.position.y = 6;
            brain.userData = { id: 'brain', system: 'nervous' };
            nervousGroup.add(brain);

            // Réseau nerveux (lignes)
            const nervesMaterial = new THREE.LineBasicMaterial({ 
                color: 0xffff00, 
                transparent: true, 
                opacity: 0.6 
            });

            // Nerfs principaux
            const points = [];
            points.push(new THREE.Vector3(0, 6, 0)); // Cerveau
            points.push(new THREE.Vector3(0, 2, 0)); // Base colonne
            points.push(new THREE.Vector3(-1, 1, 0)); // Nerf gauche
            points.push(new THREE.Vector3(1, 1, 0)); // Nerf droit

            const nervesGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const nervesLine = new THREE.Line(nervesGeometry, nervesMaterial);
            nervousGroup.add(nervesLine);

            bodyParts.nervous = nervousGroup;
            parent.add(nervousGroup);
        }

        function createCirculatorySystem(parent) {
            const circulatoryGroup = new THREE.Group();
            circulatoryGroup.name = 'circulatory';

            // Vaisseaux sanguins (tubes)
            const vesselGeometry = new THREE.TubeGeometry(
                new THREE.CatmullRomCurve3([
                    new THREE.Vector3(-0.5, 4, 0),
                    new THREE.Vector3(-1, 3, 0),
                    new THREE.Vector3(-0.5, 2, 0),
                    new THREE.Vector3(0.5, 1, 0),
                    new THREE.Vector3(1, 2, 0),
                    new THREE.Vector3(0.5, 3, 0),
                    new THREE.Vector3(-0.5, 4, 0)
                ]),
                20,
                0.1,
                8,
                false
            );

            const vesselMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xff4757, 
                transparent: true, 
                opacity: 0.8 
            });
            const vessels = new THREE.Mesh(vesselGeometry, vesselMaterial);
            circulatoryGroup.add(vessels);

            bodyParts.circulatory = circulatoryGroup;
            parent.add(circulatoryGroup);
        }

        function setupEventListeners() {
            // Contrôles des systèmes
            document.querySelectorAll('.system-toggle input').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    const systemName = e.target.id;
                    const isVisible = e.target.checked;
                    
                    if (bodyParts[systemName]) {
                        bodyParts[systemName].visible = isVisible;
                    }
                });
            });

            // Contrôle de transparence
            document.getElementById('opacity').addEventListener('input', (e) => {
                const opacity = parseFloat(e.target.value);
                
                Object.values(bodyParts).forEach(group => {
                    group.children.forEach(mesh => {
                        if (mesh.material) {
                            mesh.material.opacity = opacity;
                        }
                    });
                });
            });

            // Gestion des clics pour les annotations
            renderer.domElement.addEventListener('click', onMouseClick, false);
            
            // Redimensionnement
            window.addEventListener('resize', onWindowResize, false);
        }

        function onMouseClick(event) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            
            const allObjects = [];
            Object.values(bodyParts).forEach(group => {
                group.children.forEach(child => {
                    if (child.userData && child.userData.id) {
                        allObjects.push(child);
                    }
                });
            });

            const intersects = raycaster.intersectObjects(allObjects);

            if (intersects.length > 0) {
                const clickedObject = intersects[0].object;
                showInfo(clickedObject.userData.id);
                
                // Effet visuel de sélection
                if (selectedObject) {
                    selectedObject.material.emissive.setHex(0x000000);
                }
                selectedObject = clickedObject;
                selectedObject.material.emissive.setHex(0x444444);
            } else {
                hideInfo();
                if (selectedObject) {
                    selectedObject.material.emissive.setHex(0x000000);
                    selectedObject = null;
                }
            }
        }

        function showInfo(partId) {
            const data = anatomyData[partId];
            if (data) {
                document.getElementById('info-title').textContent = data.name;
                document.getElementById('info-description').textContent = data.description;
                document.getElementById('info-panel').style.display = 'block';
            }
        }

        function hideInfo() {
            document.getElementById('info-panel').style.display = 'none';
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);
            
            // Rotation automatique légère
            scene.rotation.y += 0.005;
            
            renderer.render(scene, camera);
        }

        // Lancement de l'application
        init();
