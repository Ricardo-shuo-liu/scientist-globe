/* js/main.js */
/**
 * 项目入口 JS - 逻辑增强版
 * 负责 UI 状态同步、筛选器交互、多语言切换及详情面板渲染
 */

import scientistData from './data.js';
import { ScientistGlobe } from './globe.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    const detailPanel = document.getElementById('detail-panel');
    const countrySidebar = document.getElementById('country-sidebar');
    const closeBtn = document.querySelector('.close-btn');
    const resetBtn = document.getElementById('reset-view');
    const langToggle = document.getElementById('lang-toggle');
    const langText = document.getElementById('lang-text');
    const loadingScreen = document.getElementById('loading-screen');
    const countryNameEl = document.getElementById('selected-country-name');
    const countryListEl = document.getElementById('country-scientist-list');

    let currentLang = 'en'; // 默认英文

    const i18n = {
        zh: {
            title: "全球计算机科学家",
            subtitle: "AI 神经网络视觉化图谱",
            reset: "查看全部",
            loading: "神经网络初始化中...",
            countryList: "国家科学家列表",
            coreContribution: "核心贡献",
            bio: "人物生平",
            milestones: "里程碑",
            tags: "领域标签",
            born: "年出生",
            developer: "本项目开发者",
            field_ai: "AI / 深度学习",
            field_os: "系统 / 架构",
            field_theory: "计算机理论",
            field_hardware: "硬件 / 底层",
            field_dev: "开发者 / Dev"
        },
        en: {
            title: "Global Computer Scientists",
            subtitle: "AI Neural Network Visualization",
            reset: "Reset View",
            loading: "Neural Network Initializing...",
            countryList: "Country Scientists",
            coreContribution: "Key Contribution",
            bio: "Biography",
            milestones: "Milestones",
            tags: "Fields & Tags",
            born: "Born in",
            developer: "Project Developer",
            field_ai: "AI / Deep Learning",
            field_os: "Systems / OS",
            field_theory: "Theory",
            field_hardware: "Hardware / Arch",
            field_dev: "Developer / Dev"
        }
    };

    // 初始化地球仪
    let globe;
    try {
        globe = new ScientistGlobe(container, scientistData, () => {
            // 资源加载完成
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => loadingScreen.remove(), 800);
            }, 1000);
        });
    } catch (error) {
        console.error('Three.js 初始化失败:', error);
        loadingScreen.innerHTML = `<p style="color: #ff4d4d;">渲染引擎启动失败，请检查 WebGL 支持</p>`;
    }

    // --- UI 交互逻辑 ---

    // 语言切换
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'zh' : 'en';
        updateUIStrings();
        globe.setLanguage(currentLang);
        // 如果详情面板是打开的，更新它
        if (globe.selectedMarker) {
            updateDetailPanel(globe.selectedMarker.userData);
        }
    });

    function updateUIStrings() {
        const strings = i18n[currentLang];
        langText.textContent = currentLang === 'en' ? 'English' : '中文';
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (strings[key]) el.textContent = strings[key];
        });
    }

    // 领域切换开关
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const field = toggle.dataset.field;
            const isActive = toggle.classList.toggle('active');
            globe.updateFields(field, isActive);
        });
    });

    // 重置视图
    resetBtn.addEventListener('click', () => {
        globe.deselectAll();
    });

    // 监听科学家选中事件
    window.addEventListener('scientistSelected', (e) => {
        const data = e.detail;
        updateDetailPanel(data);
        detailPanel.classList.add('active');
        countrySidebar.classList.remove('active');
    });

    // 监听国家选中事件
    window.addEventListener('countrySelected', (e) => {
        const group = e.detail;
        updateCountrySidebar(group);
        countrySidebar.classList.add('active');
        detailPanel.classList.remove('active');
    });

    // 监听面板关闭事件
    window.addEventListener('panelClosed', () => {
        detailPanel.classList.remove('active');
        countrySidebar.classList.remove('active');
    });

    // 关闭按钮点击
    closeBtn.addEventListener('click', () => {
        globe.deselectAll();
    });

    function updateCountrySidebar(group) {
        countryNameEl.textContent = `${group.name} (${group.scientists.length})`;
        countryListEl.innerHTML = '';

        group.scientists.forEach(s => {
            const item = document.createElement('div');
            item.className = 'scientist-item';
            item.innerHTML = `
                <h4>${s.name}</h4>
                <p>${s.field} · ${s.birth}</p>
            `;
            item.onclick = () => {
                globe.selectMarker({ userData: { type: 'individual', ...s } });
            };
            countryListEl.appendChild(item);
        });
    }

    function updateDetailPanel(data) {
        const strings = i18n[currentLang];
        
        // 辅助函数：根据当前语言获取数据字段，如果不存在则回退到默认字段
        const getL = (field) => {
            const langField = `${field}_${currentLang}`;
            return data[langField] || data[field] || '';
        };

        const fieldMap = {
            'AI': { label: currentLang === 'zh' ? '人工智能 / 深度学习' : 'AI / Deep Learning', class: 'field-ai' },
            'OS': { label: currentLang === 'zh' ? '编程语言 / 操作系统' : 'Systems / OS', class: 'field-os' },
            'Hardware': { label: currentLang === 'zh' ? '硬件 / 底层技术' : 'Hardware / Arch', class: 'field-hardware' },
            'Theory': { label: currentLang === 'zh' ? '计算机理论先驱' : 'CS Theory', class: 'field-theory' },
            'Developer': { label: strings.developer, class: 'field-dev' }
        };

        const fieldInfo = fieldMap[data.field] || { label: data.field, class: '' };

        const html = `
            <div class="panel-content">
                <h2 class="scientist-name">${getL('name')}</h2>
                <div class="scientist-meta">
                    <span>${data.flag} ${getL('country')}</span>
                    <span>•</span>
                    <span>${currentLang === 'zh' ? data.birth + ' ' + strings.born : strings.born + ' ' + data.birth}</span>
                </div>
                <div class="field-badge ${fieldInfo.class}">${fieldInfo.label}</div>
                
                <div class="section-title">${strings.coreContribution}</div>
                <div class="contribution-box">
                    <p>${getL('contribution')}</p>
                </div>

                <div class="section-title">${strings.bio}</div>
                <div class="biography-box">
                    <p>${getL('biography')}</p>
                </div>

                <div class="section-title">${strings.milestones}</div>
                <ul class="milestone-list">
                    ${(data[`milestones_${currentLang}`] || data.milestones || []).map(m => `<li>${m}</li>`).join('')}
                </ul>

                <div class="section-title">${strings.tags}</div>
                <div class="tag-container">
                    ${(data[`tags_${currentLang}`] || data.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        const contentArea = detailPanel.querySelector('.panel-body');
        contentArea.innerHTML = html;
        contentArea.scrollTop = 0;
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') globe.deselectAll();
    });
});
