# NEXUS — Estudio Digital

Página web informativa de un estudio de diseño digital ficticio. Proyecto práctico orientado a la implementación de efectos visuales avanzados, animaciones fluidas y técnicas modernas de desarrollo frontend.

---

## Descripción

Landing page de alto rendimiento que combina múltiples tecnologías y librerías para lograr una experiencia visual inmersiva. Incluye efectos de glassmorphism, escenas 3D interactivas, animaciones sincronizadas con el scroll, parallax dinámico y un sistema de carga asíncrona de dependencias.

El proyecto fue desarrollado como ejercicio práctico para explorar e integrar herramientas de animación y renderizado 3D en un entorno web estático, manteniendo buenas prácticas de arquitectura y rendimiento.

---

## Tecnologías y Librerías

| Tecnología | Versión | Uso |
|---|---|---|
| HTML5 | - | Estructura semántica |
| CSS3 | - | Estilos, glassmorphism, backdrop-filter, variables CSS, responsive design |
| JavaScript ES6+ | - | Lógica principal, clases, módulos, async/await, Intersection Observer |
| Three.js | r128 | Escena 3D, geometrías, iluminación, renderizado WebGL |
| Anime.js | 3.2.2 | Animaciones de entrada, stagger, easing personalizado |
| Lenis | 1.1.18 | Smooth scroll nativo con easing exponencial |
| Google Fonts | - | Tipografías Syne, Space Grotesk, Space Mono |

---

## Características

- Efecto glassmorphism con backdrop-filter y bordes translúcidos
- Escena Three.js con 6 objetos 3D flotantes que reaccionan al cursor y al scroll
- Mini escenas 3D independientes dentro de cada card del showcase
- Smooth scroll implementado con Lenis.js
- Parallax dinámico en figuras de fondo y galería horizontal
- Texto de manifiesto que se revela palabra por palabra al hacer scroll
- Animaciones de entrada con Anime.js (translateY, opacity, stagger)
- Contadores animados con easing cúbico
- Marquee infinito bidireccional
- Cursor personalizado con efecto hover
- Spinner de carga con barra de progreso real vinculada a la carga de librerías
- Navbar con efecto blur al hacer scroll y menú móvil
- Galería horizontal con imágenes de Unsplash y efecto parallax
- Formulario de contacto con estilos glass
- Diseño completamente responsive (desktop, tablet, móvil)

---

## Arquitectura

El proyecto sigue una arquitectura modular basada en clases ES6+:

```
App                     Clase principal, orquesta todos los módulos
Escena3D                Escena Three.js principal (fondo)
MiniCanvas3D            Escenas 3D individuales para cards
FigurasParallax         Movimiento parallax de figuras y orbs
GaleriaParallax         Desplazamiento horizontal de la galería
TextoManifiesto         Revelado de texto por palabra con scroll
AnimadorStats           Contadores numéricos animados
```

Sistema de carga de librerías:

```
cargarLibreria()        Carga individual (script o CSS) con Promise
cargarTodasLasLibrerias()   Carga paralela con Promise.all y callback de progreso
```

---

## Estructura del Proyecto

```
/
├── index.html          Estructura HTML principal
├── style.css           Estilos CSS (variables, glassmorphism, responsive)
├── main.js             Lógica JavaScript (clases, animaciones, 3D)
├── favicon.ico         Icono del sitio
└── README.md           Documentación del proyecto
```

---

## Instalación

No requiere instalación de dependencias. Las librerías externas se cargan de forma asíncrona desde CDN al iniciar la página.

1. Clonar el repositorio:

```bash
git clone https://github.com/tu-usuario/nexus-landing.git
```

2. Abrir con un servidor local:

```bash
cd nexus-landing
```

Usar Live Server de VS Code o cualquier servidor HTTP estático:

```bash
npx serve .
```

3. Abrir en el navegador en `http://localhost:3000` o `http://127.0.0.1:5500`

---

## Compatibilidad

| Navegador | Soporte |
|---|---|
| Chrome 76+ | Completo |
| Firefox 103+ | Completo |
| Safari 14+ | Completo |
| Edge 79+ | Completo |

Requiere soporte para:
- backdrop-filter
- WebGL 2.0
- Intersection Observer API
- ResizeObserver API
- ES6+ (clases, arrow functions, async/await, template literals)

---

## Rendimiento

- Carga asíncrona y paralela de todas las librerías externas
- Pixel ratio limitado a 2x para optimizar el renderizado WebGL
- will-change aplicado solo en elementos animados
- Imágenes con lazy loading nativo
- CSS variables para consistencia y mantenibilidad
- requestAnimationFrame para todas las animaciones en loop
- IntersectionObserver para activar animaciones solo cuando son visibles

---

## Recursos Externos

- Imágenes: Unsplash (https://unsplash.com)
- Tipografías: Google Fonts (https://fonts.google.com)
- Three.js: https://threejs.org
- Anime.js: https://animejs.com
- Lenis: https://lenis.darkroom.engineering

---

## Licencia

Proyecto con fines educativos y de práctica. Las imágenes pertenecen a sus respectivos autores en Unsplash bajo su licencia correspondiente.

---

## Autor

Desarrollado como proyecto práctico de frontend avanzado.