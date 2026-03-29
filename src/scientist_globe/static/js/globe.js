/* js/globe.js */
/**
 * AI 神经网络 3D 地球仪 - 核心引擎
 * 集成聚合点位、LOD 分级渲染、动态神经连线与 AI 星云背景
 */

import * as THREE from 'https://esm.sh/three@0.132.2';
import { OrbitControls } from 'https://esm.sh/three@0.132.2/examples/jsm/controls/OrbitControls.js';

export class ScientistGlobe {
    constructor(container, data, onLoaded) {
        this.container = container;
        this.data = data;
        this.onLoaded = onLoaded;
        this.currentLang = 'en'; // 默认语言
        this.markers = [];
        this.aggregateMarkers = []; // 聚合点位
        this.neuralLines = [];      // 神经连线
        this.isIdle = true;
        this.idleTimeout = null;
        this.selectedMarker = null;
        this.hoveredMarker = null;
        this.activeFields = new Set(['AI', 'Developer']); // 默认显示 AI 和 开发者
        this.selectedCountry = null;

        // 领域归类映射
        this.fieldCategoryMap = {
            'AI': ['AI', 'ML', 'DL', 'CNN', 'RL', 'AGI', 'RNN', 'LLM', 'NLP', 'GenAI', 'NN', 'Causality', 'Safety', 'Meta', 'Foundational', 'QA', 'Brain', 'GNN', 'Speech', 'Bio', 'Science', 'FinTech'],
            'OS': ['OS', 'System', 'Unix', 'C', 'Go', 'BSD', 'Linux', 'Distributed', 'Dist', 'Network', 'Internet', 'Web', 'Cloud', 'Search', 'Storage', 'PC', 'Subroutine', 'Tcl', 'Perl', 'Ruby', 'JS', 'Java', 'C++', 'TS', 'PL', 'OOP', 'Software'],
            'Theory': ['Theory', 'Logic', 'Complexity', 'Algorithms', 'Algo', 'Math', 'Crypto', 'ZKP', 'RSA', 'MPC', 'Info', 'Lambda', 'NP', 'Sort', 'Concurrency', 'Types', 'Privacy', 'Security', 'Quantum', 'Web3', 'Physics', 'Control', 'Semantics', 'Functional'],
            'Hardware': ['Hardware', 'Arch', 'CPU', 'IC', 'Moore', 'RISC', 'MIPS', 'RAID', 'Pioneer', 'Robotics', 'Ubicomp', 'Graphic', 'NASA'],
            'Developer': ['Developer']
        };

        // 颜色配置
        this.colors = {
            'AI': 0xbc13fe,       // 霓虹紫
            'OS': 0x00f3ff,       // 青蓝色
            'Theory': 0xffd700,    // 明黄色
            'Hardware': 0x39ff14,  // 霓虹绿
            'Developer': 0xffd700, // 赤金色
            'China': 0xffd700,     // 赤金色 (华人科学家标识色)
            'NeuralLine': 0x00f3ff // 神经连线基础色
        };

        this.loadingManager = new THREE.LoadingManager();
        this.loadingManager.onLoad = () => {
            if (this.onLoaded) this.onLoaded();
        };

        this.init();
        this.createNebula();    // 升级版星云背景
        this.createGlobe();     // 升级版发光地球
        this.processData();     // 预处理聚合逻辑
        this.createMarkers();   // 创建个人与聚合点
        this.createNeuralNetwork(); // 创建神经连线
        this.animate();
        this.setupEvents();
        this.resetIdleTimer();
    }

    init() {
        this.scene = new THREE.Scene();
        this.globeGroup = new THREE.Group();
        this.scene.add(this.globeGroup);
        
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.z = 180;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.04; // 更丝滑的阻尼
        this.controls.minDistance = 65;
        this.controls.maxDistance = 400;
        this.controls.rotateSpeed = 0.8;

        // 增强光影
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(100, 100, 100);
        this.scene.add(mainLight);
    }

    // 升级版 AI 宇宙星云背景
    createNebula() {
        const starCount = 8000;
        const starGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const r = 800 + Math.random() * 400;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // 赋予星点不同颜色：蓝、紫、白
            const colorType = Math.random();
            if (colorType > 0.8) {
                colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.1; colors[i * 3 + 2] = 1.0; // 紫
            } else if (colorType > 0.6) {
                colors[i * 3] = 0.0; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 1.0; // 蓝
            } else {
                colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0; // 白
            }
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const starMaterial = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.nebula = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.nebula);
    }

    createGlobe() {
        // 地球本体
        const geometry = new THREE.SphereGeometry(50, 64, 64);
        const textureLoader = new THREE.TextureLoader(this.loadingManager);
        
        // 升级纹理：带发光通道的蓝色地球
        const earthTexture = textureLoader.load('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg');
        const bumpMap = textureLoader.load('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png');
        
        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpMap: bumpMap,
            bumpScale: 0.8,
            specular: new THREE.Color(0x111111),
            shininess: 10,
            emissive: new THREE.Color(0x001122), // 深蓝自发光
            emissiveIntensity: 0.5
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.globeGroup.add(this.globe);

        // 升级大气层外辉光
        const atmosphereGeometry = new THREE.SphereGeometry(56, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                    gl_FragColor = vec4(0.0, 0.6, 1.0, 1.0) * intensity;
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.globeGroup.add(atmosphere);
    }

    processData() {
        // 聚合逻辑：按国家/地区聚合
        this.countryGroups = {};
        this.data.forEach(item => {
            // 严格主权要求：统一归类中国
            let country = item.country;
            if (country.includes('台湾') || item.tags.includes('Taiwan')) {
                country = '中国';
            }
            
            if (!this.countryGroups[country]) {
                this.countryGroups[country] = {
                    name: country,
                    scientists: [],
                    center: { lat: 0, lng: 0 }
                };
            }
            this.countryGroups[country].scientists.push(item);
        });

        // 计算聚合中心点
        Object.values(this.countryGroups).forEach(group => {
            let sumLat = 0, sumLng = 0;
            group.scientists.forEach(s => {
                sumLat += s.lat;
                sumLng += s.lng;
            });
            group.center.lat = sumLat / group.scientists.length;
            group.center.lng = sumLng / group.scientists.length;
        });
    }

    createMarkers() {
        // 1. 创建聚合点位 (国家级别)
        Object.values(this.countryGroups).forEach(group => {
            const marker = this.createAggregateMarkerMesh(group);
            const pos = this.latLngToVector3(group.center.lat, group.center.lng, 51);
            marker.position.copy(pos);
            marker.lookAt(new THREE.Vector3(0, 0, 0));
            marker.rotateX(Math.PI / 2);
            
            this.globeGroup.add(marker);
            this.aggregateMarkers.push(marker);
        });

        // 2. 创建个人点位 (个人级别)
        this.data.forEach(item => {
            // 获取分类颜色
            const category = Object.keys(this.fieldCategoryMap).find(cat => 
                this.fieldCategoryMap[cat].includes(item.field)
            ) || 'AI';
            
            let color = this.colors[category] || 0xffffff;
            
            // 华人科学家特殊颜色标识 (赤金色)
            if (item.tags.includes('China') || item.country === '中国') {
                color = this.colors.China;
            }

            const marker = this.createPersonalMarkerMesh(color, item);
            const pos = this.latLngToVector3(item.lat, item.lng, 50.5);
            marker.position.copy(pos);
            marker.lookAt(new THREE.Vector3(0, 0, 0));
            marker.rotateX(Math.PI / 2);

            this.globeGroup.add(marker);
            this.markers.push(marker);
            marker.visible = false; // 默认隐藏个人点位，由 LOD 控制
        });
    }

    createAggregateMarkerMesh(group) {
        const marker = new THREE.Group();
        marker.userData = { type: 'aggregate', ...group };

        // 核心光球
        const coreGeo = new THREE.SphereGeometry(1.5, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
        const core = new THREE.Mesh(coreGeo, coreMat);
        marker.add(core);

        // 外层光环
        const ringGeo = new THREE.RingGeometry(1.8, 2.5, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        marker.add(ring);

        marker.pulseValue = Math.random() * Math.PI;
        return marker;
    }

    createPersonalMarkerMesh(color, data) {
        const group = new THREE.Group();
        group.userData = { type: 'individual', ...data };

        // 呼吸光点
        const dotGeo = new THREE.CircleGeometry(0.8, 16);
        const dotMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        group.add(dot);

        // 连线到引线高度
        const floatHeight = 8 + Math.random() * 10;
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, floatHeight)]);
        const lineMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);

        // 顶部 Emoji
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.font = '48px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(data.emoji || '👨‍💻', 32, 32);
        const texture = new THREE.CanvasTexture(canvas);
        const emojiMat = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(emojiMat);
        sprite.position.z = floatHeight;
        sprite.scale.set(4, 4, 1);
        group.add(sprite);

        group.pulseValue = Math.random() * Math.PI;
        group.floatHeight = floatHeight;
        group.sprite = sprite;
        return group;
    }

    // 创建动态神经连线
    createNeuralNetwork() {
        // 清理旧连线
        this.neuralLines.forEach(l => this.globeGroup.remove(l));
        this.neuralLines = [];

        // 只为活跃分类的科学家建立连线
        const activeScientists = this.data.filter(s => {
            const category = Object.keys(this.fieldCategoryMap).find(cat => 
                this.fieldCategoryMap[cat].includes(s.field)
            ) || 'AI';
            return this.activeFields.has(category);
        });
        
        // 随机建立 150 条连线，避免过密
        for (let i = 0; i < 150; i++) {
            const s1 = activeScientists[Math.floor(Math.random() * activeScientists.length)];
            const s2 = activeScientists[Math.floor(Math.random() * activeScientists.length)];
            
            if (s1 === s2) continue;
            // 同领域或同国家才连线
            if (s1.field !== s2.field && s1.country !== s2.country) continue;

            const line = this.createFlowLine(s1, s2);
            this.globeGroup.add(line);
            this.neuralLines.push(line);
        }
    }

    createFlowLine(s1, s2) {
        const start = this.latLngToVector3(s1.lat, s1.lng, 50.5);
        const end = this.latLngToVector3(s2.lat, s2.lng, 50.5);

        // 计算贝塞尔曲线中点，使其向外弯曲
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const distance = start.distanceTo(end);
        mid.normalize().multiplyScalar(50.5 + distance * 0.2);

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(30);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // 使用 DashMaterial 模拟流光
        const material = new THREE.LineDashedMaterial({
            color: this.colors[s1.field] || this.colors.NeuralLine,
            dashSize: 2,
            gapSize: 4,
            transparent: true,
            opacity: 0.2
        });

        const line = new THREE.Line(geometry, material);
        line.computeLineDistances();
        line.userData = { offset: 0 };
        return line;
    }

    latLngToVector3(lat, lng, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const distance = this.camera.position.length();
        
        // LOD 逻辑：缩放分级显示
        const showIndividual = distance < 120;
        
        this.aggregateMarkers.forEach(m => {
            m.visible = !showIndividual && (!this.selectedCountry || m.userData.name === this.selectedCountry);
            m.scale.setScalar(1 + Math.sin(m.pulseValue) * 0.1);
            m.pulseValue += 0.05;
        });

        this.markers.forEach(m => {
            const data = m.userData;
            // 检查当前点位所属的分类是否被激活
            const category = Object.keys(this.fieldCategoryMap).find(cat => 
                this.fieldCategoryMap[cat].includes(data.field)
            ) || 'AI'; // 默认归类到 AI 如果没找到

            const isVisible = showIndividual && 
                             this.activeFields.has(category) && 
                             (!this.selectedCountry || data.country === this.selectedCountry || (this.selectedCountry === '中国' && data.country.includes('台湾')));
            
            m.visible = isVisible;
            if (isVisible) {
                m.scale.setScalar(1 + Math.sin(m.pulseValue) * 0.1);
                m.pulseValue += 0.05;
                // 动态淡化非焦点内容
                m.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity = (this.hoveredMarker && this.hoveredMarker !== m) ? 0.3 : (child.material.opacity > 0.8 ? 0.8 : child.material.opacity);
                    }
                });
            }
        });

        // 神经连线动画与显示
        this.neuralLines.forEach(line => {
            line.visible = showIndividual && !this.selectedCountry;
            if (line.visible) {
                line.material.dashOffset -= 0.1;
            }
        });

        // 自动旋转
        if (this.isIdle && !this.selectedMarker) {
            this.globeGroup.rotation.y += 0.0015;
        }

        this.nebula.rotation.y += 0.0001;
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    setupEvents() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.container.addEventListener('mousemove', (e) => {
            this.resetIdleTimer();
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.camera);

            const allMarkers = [...this.markers.filter(m => m.visible), ...this.aggregateMarkers.filter(m => m.visible)];
            const intersects = raycaster.intersectObjects(allMarkers, true);

            if (intersects.length > 0) {
                this.container.style.cursor = 'pointer';
                const marker = this.findParentGroup(intersects[0].object);
                this.hoveredMarker = marker;
                
                let name;
                if (marker.userData.type === 'aggregate') {
                    const countryName = this.currentLang === 'zh' ? marker.userData.name : (marker.userData.name === '中国' ? 'China' : marker.userData.name);
                    const count = marker.userData.scientists.length;
                    name = this.currentLang === 'zh' ? `${countryName} (${count} 位科学家)` : `${countryName} (${count} Scientists)`;
                } else {
                    const data = marker.userData;
                    name = (this.currentLang === 'en' && data.name_en) ? data.name_en : data.name;
                }
                this.showTooltip(e, name);
            } else {
                this.container.style.cursor = 'default';
                this.hoveredMarker = null;
                this.hideTooltip();
            }
        });

        this.container.addEventListener('click', (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.camera);

            const allMarkers = [...this.markers.filter(m => m.visible), ...this.aggregateMarkers.filter(m => m.visible)];
            const intersects = raycaster.intersectObjects(allMarkers, true);

            if (intersects.length > 0) {
                const marker = this.findParentGroup(intersects[0].object);
                if (marker.userData.type === 'aggregate') {
                    this.filterByCountry(marker.userData.name);
                } else {
                    this.selectMarker(marker);
                }
            } else {
                // 点击地球表面尝试识别国家
                const earthIntersects = raycaster.intersectObject(this.globe);
                if (earthIntersects.length > 0) {
                    // 如果点击了地球且没点到标记，不执行任何操作或重置
                } else {
                    this.deselectAll();
                }
            }
        });
    }

    findParentGroup(obj) {
        if (obj.userData && obj.userData.type) return obj;
        if (obj.parent) return this.findParentGroup(obj.parent);
        return obj;
    }

    filterByCountry(countryName) {
        this.selectedCountry = countryName;
        const group = this.countryGroups[countryName];
        this.focusOnPoint(group.center.lat, group.center.lng, 100);
        
        window.dispatchEvent(new CustomEvent('countrySelected', { detail: group }));
    }

    selectMarker(marker) {
        this.selectedMarker = marker;
        const data = marker.userData;
        window.dispatchEvent(new CustomEvent('scientistSelected', { detail: data }));
        this.focusOnPoint(data.lat, data.lng, 80);
    }

    deselectAll() {
        this.selectedMarker = null;
        this.selectedCountry = null;
        window.dispatchEvent(new CustomEvent('panelClosed'));
        window.dispatchEvent(new CustomEvent('countryDeselected'));
    }

    focusOnPoint(lat, lng, radius = 120) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        // 平滑移动相机
        const startPos = this.camera.position.clone();
        const endPos = new THREE.Vector3(x, y, z);
        let progress = 0;
        const duration = 30; // 帧数
        
        const animateCamera = () => {
            progress++;
            const t = progress / duration;
            const easedT = t * (2 - t); // Ease out quad
            this.camera.position.lerpVectors(startPos, endPos, easedT);
            this.controls.update();
            if (progress < duration) requestAnimationFrame(animateCamera);
        };
        animateCamera();
    }

    updateFields(field, active) {
        if (active) this.activeFields.add(field);
        else this.activeFields.delete(field);
        this.createNeuralNetwork(); // 重新生成连线
    }

    setLanguage(lang) {
        this.currentLang = lang;
        // 重新处理连线
        this.createNeuralNetwork();
    }

    resetIdleTimer() {
        this.isIdle = false;
        clearTimeout(this.idleTimeout);
        this.idleTimeout = setTimeout(() => this.isIdle = true, 5000);
    }

    showTooltip(e, text) {
        const tooltip = document.getElementById('tooltip');
        tooltip.textContent = text;
        tooltip.style.left = `${e.clientX}px`;
        tooltip.style.top = `${e.clientY}px`;
        tooltip.style.opacity = '1';
    }

    hideTooltip() {
        document.getElementById('tooltip').style.opacity = '0';
    }
}
