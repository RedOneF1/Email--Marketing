/* ============================================================
   MOVIMIENTO: partículas, parallax, luz, hoodies repartidos y
   botones magnéticos. En celular el movimiento se genera solo.
   No toca el formulario ni EmailJS.
   ============================================================ */
(function () {
  "use strict";

  // Pon true para que TODOS los efectos funcionen aunque el celular de la
  // persona tenga activado "Reducir movimiento" (por defecto se respeta ese ajuste).
  const FORZAR_MOVIMIENTO = false;

  const root = document.documentElement;
  if (FORZAR_MOVIMIENTO) root.classList.add("force-motion");
  const reduce = !FORZAR_MOVIMIENTO &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // El botón del menú lleva el cursor directo al campo de correo
  const navCta = document.getElementById("nav-cta");
  if (navCta) {
    navCta.addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("email").focus();
    });
  }

  // Copia el hoodie principal en las demás zonas de la página
  const baseHoodie = document.querySelector(".hd--main .hoodie");
  if (baseHoodie) {
    document.querySelectorAll("[data-hoodie]").forEach(function (slot) {
      slot.appendChild(baseHoodie.cloneNode(true));
    });
  }

  // Con "Reducir movimiento" activo no hay parallax, partículas ni luz
  if (reduce) return;

  const hero = document.querySelector(".hero");
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------- 1. Botones magnéticos (solo con mouse) ---------- */
  if (!isTouch) {
    document.querySelectorAll(".nav__cta, .brand-btn").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.2;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = "translate(" + x + "px," + y + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- 2. Partículas grises ---------- */
  let W = 0, H = 0, particles = [];

  function newParticle(randomY) {
    return {
      x: Math.random() * W,
      y: randomY ? Math.random() * H : H + 10,
      r: Math.random() * 1.8 + 0.4,
      v: Math.random() * 0.4 + 0.12,
      a: Math.random() * 0.5 + 0.15
    };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = canvas.width = rect.width;
    H = canvas.height = rect.height;
    const count = Math.max(30, Math.min(70, Math.floor(W / 16)));
    particles = Array.from({ length: count }, function () { return newParticle(true); });
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---------- 3. Parallax + luz ---------- */
  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  let mouseX = innerWidth / 2, mouseY = innerHeight / 2, glowX = mouseX, glowY = mouseY;
  let lastPointer = -99999;

  const glow = document.createElement("div");
  glow.className = "glow";
  document.body.appendChild(glow);

  // Mouse, o dedo arrastrando / tocando la pantalla
  window.addEventListener("pointermove", function (e) {
    lastPointer = performance.now();
    targetX = (e.clientX / innerWidth) * 2 - 1;   // -1 a 1
    targetY = (e.clientY / innerHeight) * 2 - 1;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener("pointerdown", function (e) {
    lastPointer = performance.now();
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  /* ---------- Bucle de animación ---------- */
  function frame(now) {
    // Partículas
    ctx.clearRect(0, 0, W, H);
    particles.forEach(function (p, i) {
      p.y -= p.v;
      p.x += Math.sin(p.y / 40) * 0.25;
      if (p.y < -10) particles[i] = newParticle(false);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200,200,208," + p.a + ")";
      ctx.fill();
    });

    // En celular no hay mouse: si nadie toca la pantalla, el movimiento se hace solo
    if (isTouch && now - lastPointer > 1500) {
      targetX = Math.sin(now / 2600) * 0.9;
      targetY = Math.cos(now / 3400) * 0.7;
      mouseX = innerWidth * (0.5 + targetX * 0.35);
      mouseY = innerHeight * (0.45 + targetY * 0.25);
    }

    // Parallax suave (interpolación)
    curX += (targetX - curX) * 0.06;
    curY += (targetY - curY) * 0.06;
    hero.style.setProperty("--px", curX.toFixed(3));
    hero.style.setProperty("--py", curY.toFixed(3));

    // Luz
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    glow.style.transform = "translate3d(" + glowX + "px," + glowY + "px,0)";

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();