(function () {
    "use strict";

    const CONFIG = Object.freeze({
        DROPS_COUNT: 8,
        DROP_MIN_SIZE: 80,
        DROP_MAX_SIZE: 350,
        SCROLL_SPEED: 1.05,
        PARALLAX_INTENSITY: .4,
        STAT_DURATION: 2000,
        SPINNER_MIN_TIME: 2200,
        LIBS: [
            { name: "Lenis", url: "https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js" },
            { name: "Three.js", url: "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" },
            { name: "AnimeJS", url: "https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js" },
            { name: "Syne Font", url: "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap", type: "css" },
            { name: "Space Grotesk Font", url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap", type: "css" },
            { name: "Space Mono Font", url: "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap", type: "css" },
        ]
    });

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const lerp = (a, b, t) => a + (b - a) * t;
    const rand = (min, max) => Math.random() * (max - min) + min;
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    function cargarLibreria(lib) {
        return new Promise((resolve, reject) => {
            if (lib.type === "css") {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = lib.url;
                link.onload = resolve;
                link.onerror = () => reject(new Error(`Error cargando ${lib.name}`));
                document.head.appendChild(link);
            } else {
                const script = document.createElement("script");
                script.src = lib.url;
                script.async = true;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Error cargando ${lib.name}`));
                document.head.appendChild(script);
            }
        });
    }

    async function cargarTodasLasLibrerias(onProgress) {
        const total = CONFIG.LIBS.length;
        let loaded = 0;
        const promises = CONFIG.LIBS.map(lib =>
            cargarLibreria(lib).then(() => {
                loaded++;
                onProgress(loaded / total);
            })
        );
        await Promise.all(promises);
    }

    class SistemaGotas {
        constructor(container) {
            this.container = container;
            this.drops = [];
            this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            this._crearGotas();
            this._bindEventos();
            this._animar();
        }
        _crearGotas() {
            for (let i = 0; i < CONFIG.DROPS_COUNT; i++) {
                const el = document.createElement("div");
                el.className = "drop";
                const size = rand(CONFIG.DROP_MIN_SIZE, CONFIG.DROP_MAX_SIZE);
                el.style.width = size + "px";
                el.style.height = size + "px";
                const drop = {
                    el,
                    x: rand(0, window.innerWidth),
                    y: rand(0, window.innerHeight),
                    targetX: rand(0, window.innerWidth),
                    targetY: rand(0, window.innerHeight),
                    vx: rand(-.15, .15),
                    vy: rand(-.15, .15),
                    size,
                    speedFactor: rand(.3, .8),
                    phase: rand(0, Math.PI * 2),
                };
                this.drops.push(drop);
                this.container.appendChild(el);
            }
        }
        _bindEventos() {
            document.addEventListener("mousemove", e => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            }, { passive: true });
        }
        _animar() {
            const time = performance.now() * .001;
            this.drops.forEach(d => {
                d.x += d.vx + Math.sin(time * .5 + d.phase) * .3;
                d.y += d.vy + Math.cos(time * .4 + d.phase) * .2;
                const dx = this.mouse.x - d.x;
                const dy = this.mouse.y - d.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 400) {
                    const force = (1 - dist / 400) * .8;
                    d.x -= dx * force * .005;
                    d.y -= dy * force * .005;
                }
                if (d.x < -d.size) d.x = window.innerWidth + d.size;
                if (d.x > window.innerWidth + d.size) d.x = -d.size;
                if (d.y < -d.size) d.y = window.innerHeight + d.size;
                if (d.y > window.innerHeight + d.size) d.y = -d.size;
                const scale = 1 + Math.sin(time + d.phase) * .05;
                d.el.style.transform = `translate3d(${d.x}px,${d.y}px,0) scale(${scale})`;
            });
            requestAnimationFrame(() => this._animar());
        }
    }

    class Escena3D {
        constructor(canvas) {
            this.canvas = canvas;
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 1000);
            this.camera.position.z = 30;
            this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.objetos = [];
            this.scrollY = 0;
            this.mouse = { x: 0, y: 0 };
            this._crearObjetos();
            this._bindEventos();
            this._animar();
        }
        _crearObjetos() {
            const mat = new THREE.MeshStandardMaterial({
                color: 0x888899,
                metalness: .6,
                roughness: .3,
                transparent: true,
                opacity: .15,
                wireframe: false,
            });
            const wireMat = new THREE.MeshBasicMaterial({
                color: 0x444466,
                wireframe: true,
                transparent: true,
                opacity: .08,
            });
            const geometrias = [
                new THREE.IcosahedronGeometry(4, 1),
                new THREE.TorusGeometry(3, .8, 16, 48),
                new THREE.OctahedronGeometry(3, 0),
                new THREE.TorusKnotGeometry(2.5, .6, 100, 16),
                new THREE.DodecahedronGeometry(3, 0),
                new THREE.SphereGeometry(3.5, 32, 32),
            ];
            const posiciones = [
                { x: -15, y: 8, z: -10 },
                { x: 18, y: -5, z: -15 },
                { x: -10, y: -15, z: -8 },
                { x: 12, y: 15, z: -12 },
                { x: 0, y: -25, z: -20 },
                { x: -20, y: 25, z: -18 },
            ];
            geometrias.forEach((geo, i) => {
                const mesh = new THREE.Mesh(geo, i % 2 === 0 ? mat.clone() : wireMat.clone());
                const pos = posiciones[i];
                mesh.position.set(pos.x, pos.y, pos.z);
                mesh.rotation.set(rand(0, Math.PI), rand(0, Math.PI), 0);
                this.scene.add(mesh);
                this.objetos.push({
                    mesh,
                    rotSpeed: { x: rand(.001, .004), y: rand(.001, .004), z: rand(.001, .003) },
                    initY: pos.y,
                    floatSpeed: rand(.3, .7),
                    floatAmp: rand(.5, 1.5),
                });
            });
            const ambient = new THREE.AmbientLight(0x444466, .5);
            this.scene.add(ambient);
            const dir = new THREE.DirectionalLight(0x8888aa, .8);
            dir.position.set(5, 10, 5);
            this.scene.add(dir);
        }
        _bindEventos() {
            window.addEventListener("resize", () => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }, { passive: true });
            document.addEventListener("mousemove", e => {
                this.mouse.x = (e.clientX / window.innerWidth - .5) * 2;
                this.mouse.y = -(e.clientY / window.innerHeight - .5) * 2;
            }, { passive: true });
        }
        actualizarScroll(y) { this.scrollY = y; }
        _animar() {
            const time = performance.now() * .001;
            this.objetos.forEach(o => {
                o.mesh.rotation.x += o.rotSpeed.x;
                o.mesh.rotation.y += o.rotSpeed.y;
                o.mesh.rotation.z += o.rotSpeed.z;
                o.mesh.position.y = o.initY
                    + Math.sin(time * o.floatSpeed) * o.floatAmp
                    - this.scrollY * .003;
            });
            this.camera.position.x = lerp(this.camera.position.x, this.mouse.x * 2, .02);
            this.camera.position.y = lerp(this.camera.position.y, this.mouse.y * 2, .02);
            this.camera.lookAt(0, -this.scrollY * .003, 0);
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(() => this._animar());
        }
    }

    class MiniCanvas3D {
        constructor(canvas, tipo) {
            this.canvas = canvas;
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
            this.camera.position.z = 6;
            const rect = canvas.parentElement.getBoundingClientRect();
            this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            this.renderer.setSize(rect.width, rect.height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            this._crearObjeto(tipo);
            this._animar();
            const ro = new ResizeObserver(entries => {
                for (const entry of entries) {
                    const r = entry.contentRect;
                    this.renderer.setSize(r.width, r.height);
                    this.camera.aspect = r.width / r.height;
                    this.camera.updateProjectionMatrix();
                }
            });
            ro.observe(canvas.parentElement);
        }
        _crearObjeto(tipo) {
            const mat = new THREE.MeshStandardMaterial({
                color: 0x555577,
                metalness: .7,
                roughness: .2,
                transparent: true,
                opacity: .25,
            });
            let geo;
            if (tipo === 0) geo = new THREE.TorusKnotGeometry(1.5, .5, 128, 32);
            else if (tipo === 1) geo = new THREE.IcosahedronGeometry(2, 2);
            else if (tipo === 2) geo = new THREE.TorusGeometry(1.8, .6, 32, 64);
            else geo = new THREE.OctahedronGeometry(2, 1);
            this.mesh = new THREE.Mesh(geo, mat);
            this.scene.add(this.mesh);
            this.scene.add(new THREE.AmbientLight(0x333355, .6));
            const d = new THREE.DirectionalLight(0x8888bb, 1);
            d.position.set(3, 5, 3);
            this.scene.add(d);
        }
        _animar() {
            this.mesh.rotation.x += .003;
            this.mesh.rotation.y += .005;
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(() => this._animar());
        }
    }

    class AnimadorStats {
        constructor() { this.animated = new Set(); }
        animar(el) {
            if (this.animated.has(el)) return;
            this.animated.add(el);
            const target = parseInt(el.dataset.target);
            const dur = CONFIG.STAT_DURATION;
            const start = performance.now();
            const tick = (now) => {
                const prog = clamp((now - start) / dur, 0, 1);
                const ease = 1 - Math.pow(1 - prog, 3);
                el.textContent = Math.round(target * ease);
                if (prog < 1) requestAnimationFrame(tick);
                else el.textContent = target;
            };
            requestAnimationFrame(tick);
        }
    }

    class TextoManifiesto {
        constructor(el) {
            this.el = el;
            const text = el.textContent.trim();
            el.innerHTML = text.split(/\s+/).map(w =>
                `<span class="reveal-word">${w}</span>`
            ).join(" ");
            this.words = $$(".reveal-word", el);
        }
        actualizar(scrollProgress) {
            this.words.forEach((w, i) => {
                const wordProgress = i / this.words.length;
                w.classList.toggle("active", scrollProgress > wordProgress);
            });
        }
    }

    class GaleriaParallax {
        constructor(track) {
            this.track = track;
            this.section = track.closest("section");
            this.offset = 0;
        }
        actualizar(scrollY) {
            if (!this.section) return;
            const rect = this.section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const progress = (window.innerHeight - rect.top) / (window.innerHeight + this.section.offsetHeight);
                this.offset = lerp(this.offset, progress * -600, .05);
                this.track.style.transform = `translate3d(${this.offset}px,0,0)`;
            }
        }
    }

    class FigurasParallax {
        constructor() {
            this.shapes = $$(".bg-shape");
            this.orbs = $$(".glass-orb");
            this.velocities = [.02, .03, .015, .025];
        }
        actualizar(scrollY) {
            this.shapes.forEach((s, i) => {
                const vel = this.velocities[i] || .02;
                const y = scrollY * vel * (i % 2 === 0 ? 1 : -1);
                const x = Math.sin(scrollY * .001 + i) * 20;
                s.style.transform = `translate3d(${x}px,${y}px,0)`;
            });
            this.orbs.forEach((o, i) => {
                const y = scrollY * .015 * (i % 2 === 0 ? -1 : 1);
                const r = Math.sin(scrollY * .0005 + i) * 3;
                o.style.transform = `translate3d(0,${y}px,0) rotate(${r}deg)`;
            });
        }
    }

    class App {
        constructor() {
            this.lenis = null;
            this.escena3D = null;
            this.statsAnimator = new AnimadorStats();
            this.manifesto = null;
            this.galeria = null;
            this.figurasParallax = new FigurasParallax();
        }
        async iniciar() {
            const progressBar = $("#progress-bar");
            const startTime = Date.now();
            try {
                await cargarTodasLasLibrerias(p => {
                    progressBar.style.width = (p * 100) + "%";
                });
            } catch (err) {
                console.warn("Librería no cargó:", err.message);
            }
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, CONFIG.SPINNER_MIN_TIME - elapsed);
            await new Promise(r => setTimeout(r, remaining));
            $("#spinner").classList.add("hidden");
            this._iniciarLenis();
            this._iniciarThreeJS();
            this._iniciarMiniCanvas();
            this._iniciarCursor();
            this._iniciarNavbar();
            this._iniciarReveals();
            this._iniciarManifiesto();
            this._iniciarGaleria();
            this._iniciarHeroAnimacion();
        }
        _iniciarLenis() {
            if (typeof Lenis === "undefined") return;
            this.lenis = new Lenis({
                duration: CONFIG.SCROLL_SPEED,
                easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: "vertical",
                smoothWheel: true,
            });
            const raf = (time) => {
                this.lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);
            this.lenis.on("scroll", ({ scroll }) => {
                if (this.escena3D) this.escena3D.actualizarScroll(scroll);
                this.figurasParallax.actualizar(scroll);
                if (this.galeria) this.galeria.actualizar(scroll);
                this._verificarStats();
                this._actualizarManifiesto();
            });
        }
        _iniciarThreeJS() {
            if (typeof THREE === "undefined") return;
            this.escena3D = new Escena3D($("#three-canvas"));
        }
        _iniciarMiniCanvas() {
            if (typeof THREE === "undefined") return;
            ["showcase-canvas-1", "showcase-canvas-2", "showcase-canvas-3", "services-canvas"].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) new MiniCanvas3D(el, i);
            });
        }
        _iniciarCursor() {
            const cursor = $("#cursor");
            let cx = 0, cy = 0, tx = 0, ty = 0;
            document.addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
            const mover = () => {
                cx = lerp(cx, tx, .12);
                cy = lerp(cy, ty, .12);
                cursor.style.left = cx + "px";
                cursor.style.top = cy + "px";
                requestAnimationFrame(mover);
            };
            mover();
            $$("a, button, .service-row, .showcase-item").forEach(el => {
                el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
                el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
            });
            if ("ontouchstart" in window) cursor.style.display = "none";
        }
        _iniciarNavbar() {
            const nav = $("#navbar");
            const ham = $("#hamburger");
            const menu = $("#mobile-menu");
            window.addEventListener("scroll", () => {
                nav.classList.toggle("scrolled", window.scrollY > 50);
            }, { passive: true });
            ham.addEventListener("click", () => {
                ham.classList.toggle("active");
                menu.classList.toggle("active");
                document.body.style.overflow = menu.classList.contains("active") ? "hidden" : "";
            });
            $$("[data-close]").forEach(a => {
                a.addEventListener("click", () => {
                    ham.classList.remove("active");
                    menu.classList.remove("active");
                    document.body.style.overflow = "";
                });
            });
            $$('.nav-links a[href^="#"]').forEach(a => {
                a.addEventListener("click", e => {
                    e.preventDefault();
                    const target = document.querySelector(a.getAttribute("href"));
                    if (target && this.lenis) {
                        this.lenis.scrollTo(target, { offset: -80 });
                    } else if (target) {
                        target.scrollIntoView({ behavior: "smooth" });
                    }
                });
            });
        }
        _iniciarReveals() {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.classList.add("visible");
                        observer.unobserve(e.target);
                    }
                });
            }, { threshold: .15, rootMargin: "0px 0px -50px 0px" });
            $$(".reveal").forEach(el => observer.observe(el));
        }
        _verificarStats() {
            $$(".stat-number").forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight * .85 && rect.bottom > 0) {
                    this.statsAnimator.animar(el);
                }
            });
        }
        _iniciarManifiesto() {
            const el = $("#manifesto-text");
            if (el) this.manifesto = new TextoManifiesto(el);
        }
        _actualizarManifiesto() {
            if (!this.manifesto) return;
            const section = $("#manifesto");
            const rect = section.getBoundingClientRect();
            const progress = clamp(1 - (rect.bottom / (window.innerHeight + rect.height)), 0, 1);
            this.manifesto.actualizar(progress);
        }
        _iniciarGaleria() {
            const track = $("#gallery-track");
            if (track) this.galeria = new GaleriaParallax(track);
        }
        _iniciarHeroAnimacion() {
            if (typeof anime === "undefined") return;
            anime({
                targets: ".hero-title .word",
                translateY: [80, 0],
                opacity: [0, 1],
                easing: "easeOutExpo",
                duration: 1600,
                delay: anime.stagger(200, { start: 400 }),
            });
            anime({
                targets: ".hero-label",
                opacity: [0, 1],
                translateY: [20, 0],
                easing: "easeOutExpo",
                duration: 1200,
                delay: 200,
            });
            anime({
                targets: ".hero-subtitle",
                opacity: [0, 1],
                translateY: [40, 0],
                easing: "easeOutExpo",
                duration: 1400,
                delay: 1100,
            });
            anime({
                targets: ".hero-ctas",
                opacity: [0, 1],
                translateY: [30, 0],
                easing: "easeOutExpo",
                duration: 1200,
                delay: 1400,
            });
            anime({
                targets: ".hero-scroll-indicator",
                opacity: [0, 1],
                translateY: [20, 0],
                easing: "easeOutExpo",
                duration: 1000,
                delay: 2000,
            });
        }
    }

    const app = new App();
    document.addEventListener("DOMContentLoaded", () => app.iniciar());

})();