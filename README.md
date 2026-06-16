# HashPass — Contraseñas sin memoria

> Generador determinístico de contraseñas que funciona 100% en el navegador, sin servidores ni bases de datos.

[![GPL License](https://img.shields.io/badge/licencia-GPL--3.0-blue.svg)](LICENSE)
[![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](index.html)
[![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](style.css)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](app.js)

---

## ¿Qué es HashPass Simple?

HashPass Simple es una herramienta web que genera contraseñas fuertes y reproducibles a partir de dos datos que solo tú conoces: una **frase maestra** y el **nombre del sitio**. La misma combinación siempre produce la misma contraseña, en cualquier dispositivo y momento, sin necesidad de almacenar nada.

La idea central: en lugar de recordar 50 contraseñas distintas o depender de un gestor de contraseñas en la nube, solo necesitas recordar una sola frase maestra. El resto es matemática.

---

## Características

- **Determinístico** — mismos inputs, mismo output, siempre
- **PBKDF2-SHA512** — 100.000 iteraciones usando la Web Crypto API nativa del navegador
- **Sin backend** — no existe servidor, no se envía ningún dato a ningún lado
- **Sin almacenamiento** — nada se guarda en cookies, localStorage ni disco
- **Tema claro / oscuro** — toggle manual con preferencia guardada, respeta `prefers-color-scheme` al primer uso
- **Opciones configurables** — longitud (8–64 chars), mayúsculas, números y símbolos
- **Indicador de fortaleza** — 6 niveles con barra animada
- **Efecto scramble** — animación de "descifrado" al revelar la contraseña
- **Responsive** — funciona en móvil y escritorio
- **Accesible** — navegación por teclado, `aria-label` en controles, `prefers-reduced-motion` respetado

---

## Cómo funciona

```
frase_maestra + sitio → PBKDF2-SHA512 (100k iteraciones) → bytes → contraseña
```

1. El navegador importa tu frase maestra como material de clave con `crypto.subtle.importKey`
2. Ejecuta `crypto.subtle.deriveBits` con PBKDF2, usando el nombre del sitio como salt y SHA-512 como hash interno
3. Los bytes resultantes se mapean al charset elegido (letras, números, símbolos)
4. Un Fisher-Yates determinístico (usando los propios bytes derivados, no `Math.random`) baraja el resultado
5. Se garantiza al menos un carácter de cada grupo activo

Todo esto ocurre dentro del contexto de seguridad del navegador. Ninguna línea de código envía datos a ningún servidor.

---

## Estructura del proyecto

```
hashpass-simple/
├── index.html   # Estructura y marcado semántico
├── style.css    # Tokens de tema, layout, componentes
├── app.js       # Lógica: tema, crypto, scramble, reveal
└── README.md
```

No hay dependencias externas, sin frameworks, sin bundler, sin `node_modules`. Abre `index.html` en el navegador y ya funciona.

---

## Uso local

```bash
git clone https://github.com/miangedev/hashpass-simple.git
cd hashpass-simple
# Abre index.html en tu navegador
# O con cualquier servidor estático:
npx serve .
```

No requiere instalación de nada. Al ser puro HTML/CSS/JS puede alojarse en GitHub Pages, Netlify, Vercel o cualquier hosting estático de forma gratuita.

---

## Seguridad — lo que HashPass Simple hace y lo que no hace

### Lo que hace bien
- Usa criptografía real (PBKDF2, no un hash simple como MD5 o SHA1 directo)
- El coste computacional de 100k iteraciones hace que un ataque de fuerza bruta sea significativamente más lento
- No deja rastro local de ninguna contraseña generada

### Lo que debes tener en cuenta
- La seguridad depende directamente de la fortaleza de tu frase maestra. Una frase maestra débil compromete todas tus contraseñas
- Si alguien conoce tu frase maestra y el nombre del sitio, puede regenerar cualquier contraseña
- HashPass no protege contra keyloggers ni malware en tu propio dispositivo
- No es un reemplazo para un gestor de contraseñas en entornos profesionales o de alta seguridad

### Recomendaciones
- Usa una frase maestra larga (15+ caracteres), no una sola palabra
- Activa siempre mayúsculas, números y símbolos
- Usa longitud de 20 caracteres o más cuando el sitio lo permita

---

## Sobre el diseño y el desarrollo

Este proyecto fue creado por **Mikel (Angel Osorio Orduz)** con fines educativos: aprendizaje de desarrollo web, exploración de la Web Crypto API y práctica con diseño de interfaces.

### Vibecoding

El diseño visual fue desarrollado mediante **vibecoding**

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 semántico | Estructura y accesibilidad |
| CSS custom properties | Sistema de temas dark/light |
| Web Crypto API | PBKDF2-SHA512 nativo del navegador |
| Vanilla JavaScript | Lógica de UI, tema, animaciones |
| Google Fonts | DM Serif Display, DM Mono, Syne |
| IntersectionObserver | Animaciones de scroll reveal |

---

## Licencia

GPL-3.0 — puedes usar, modificar y distribuir este código, pero cualquier trabajo derivado debe publicarse bajo la misma licencia. Ver [LICENSE](LICENSE) para más detalles.

---

*Desarrollado por Mikel (Miguel Angel Osorio Orduz) · Proyecto educativo · 2026*
