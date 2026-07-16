<template>
  <div class="d-flex flex-column align-items-center justify-content-center bg-brown text-warning rustic-404 min-vh-100 w-100">
    <h1 class="fw-bold rustic-shadow">404</h1>
    <h2 class="mb-3 fw-bold rustic-title">Oops! Pagina non trovata</h2>
    <p class="mb-4 rustic-desc">
      Sembra che tu abbia imboccato una stradina di campagna...<br>
      Torna al <span class="fst-italic">Vecchio Torchio</span>!
    </p>
    <router-link to="/" class="btn btn-outline-warning px-4 py-2 fw-bold rustic-btn">
      Torna alla Home
    </router-link>
  </div>
</template>

<style scoped>
/* --- Utility layout --- */
.d-flex{ display:flex; }
.flex-column{ flex-direction:column; }
.align-items-center{ align-items:center; }
.justify-content-center{ justify-content:center; }
.min-vh-100{ min-height:100vh; }
.w-100{ width:100%; }
.fw-bold{ font-weight:700; }
.fst-italic{ font-style:italic; }
.mb-3{ margin-bottom:1rem; }
.mb-4{ margin-bottom:1.5rem; }
.px-4{ padding-left:1.5rem; padding-right:1.5rem; }
.py-2{ padding-top:0.5rem; padding-bottom:0.5rem; }

/* --- Colori base --- */
.bg-brown{
  background: radial-gradient(ellipse 80% 60% at 50% 0%, #3a2418, transparent 60%), #1c120b;
}
.text-warning{
  color:#e6c777;
}

/* --- Bottone --- */
.btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border-radius:999px;
  text-decoration:none;
  cursor:pointer;
  border:2px solid transparent;
  font-family:inherit;
  white-space:nowrap;
}
.btn-outline-warning{
  background:transparent;
  color:#e6c777;
  border-color:#e6c777;
}

/* --- Pagina 404 — responsive --- */
.rustic-404{
  text-align:center;
  box-sizing:border-box;
  padding: 1.5rem clamp(1rem, 6vw, 3rem);
  font-family:"Sora", sans-serif;
  overflow-x:hidden;
}
.rustic-404 *{ box-sizing:border-box; max-width:100%; }

.rustic-shadow{
  margin:0;
  font-size:clamp(3.5rem, 16vw, 10rem);
  color:#e6c777;
  text-shadow: 0 4px 0 rgba(0,0,0,0.35), 0 8px 18px rgba(0,0,0,0.4);
  line-height:1;
  font-family:"Fraunces", serif;
  font-style:italic;
}

.rustic-title{
  margin:0.6rem 0 0;
  font-family:"Fraunces", serif;
  font-size:clamp(1.2rem, 5vw, 2.2rem);
  color:#f2e6d3;
  line-height:1.25;
}

.rustic-desc{
  width:100%;
  max-width:28rem;
  margin-left:auto;
  margin-right:auto;
  color:#b39a8d;
  font-weight:300;
  font-size:clamp(0.85rem, 2.2vw, 1rem);
  line-height:1.6;
}

.rustic-btn{
  letter-spacing:0.06em;
  text-transform:uppercase;
  font-size:clamp(0.72rem, 2vw, 0.85rem);
  transition:transform 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
.rustic-btn:hover{
  transform:translateY(-2px);
  box-shadow:0 10px 20px rgba(0,0,0,0.35);
  background:#e6c777;
  color:#241019;
  border-color:#e6c777;
}

@media (max-width: 360px){
  .px-4{ padding-left:1rem; padding-right:1rem; }
  .py-2{ padding-top:0.4rem; padding-bottom:0.4rem; }
}

@media (prefers-reduced-motion: reduce){
  .rustic-btn{ transition:none; }
}
</style>