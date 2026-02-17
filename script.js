// Navbar scroll
const nb = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    nb.classList.toggle('scrolled', scrollPos > 50);
});

// ===== MOUSE PLANET & BUBBLES =====
const mousePlanet = document.getElementById('mouse-planet');
let mPosX = 0, mPosY = 0;
let cPosX = 0, cPosY = 0;

window.addEventListener('mousemove', (e) => {
    mPosX = e.clientX;
    mPosY = e.clientY;

    // Create bubble on move
    if (Math.random() > 0.7) {
        createBubble(e.pageX, e.pageY);
    }
});

function createBubble(x, y) {
    const bubble = document.createElement('div');
    bubble.className = 'mouse-bubble';

    // Randomize color (blue or white)
    const isBlue = Math.random() > 0.5;
    bubble.style.background = isBlue ? 'var(--accent)' : '#fff';
    bubble.style.boxShadow = `0 0 10px ${isBlue ? 'var(--accent)' : '#fff'}`;

    // Randomize size
    const size = Math.random() * 6 + 2;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;

    // Random trajectory for animation
    const tx = (Math.random() - 0.5) * 100;
    const ty = (Math.random() - 0.5) * 100 - 50; // Tend to go up
    bubble.style.setProperty('--tx', `${tx}px`);
    bubble.style.setProperty('--ty', `${ty}px`);

    document.body.appendChild(bubble);
    setTimeout(() => {
        bubble.remove();
    }, 2000);
}

// Loop for mouse follower (lerp for latency)
function updateMouseFollower() {
    cPosX += (mPosX - cPosX) * 0.15; // 0.15 creates the subtle latency
    cPosY += (mPosY - cPosY) * 0.15;

    mousePlanet.style.left = `${cPosX}px`;
    mousePlanet.style.top = `${cPosY}px`;

    requestAnimationFrame(updateMouseFollower);
}
updateMouseFollower();

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        btn.classList.add('success');
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.classList.remove('success');
        }, 2000);
    });
}
// Loader handle
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 600);
    }, 1000);
});

// Three.js Background
let mx = 0, my = 0;
window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth) - 0.5;
    my = (e.clientY / window.innerHeight) - 0.5;
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25; // Pushed back a bit more for depth
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg-canvas'), antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Stars
const mobileMenu = document.getElementById('mob');
const hamburger = document.getElementById('ham');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
        });
    });
}

// Create blurred circle for stars
const createStarTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
};

const geo = new THREE.BufferGeometry();
const count = 10000; // Increased for better depth
const pos = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
const originalPos = new Float32Array(count * 3); // For interaction logic

const colorGrey = new THREE.Color(0x444444);
const colorBlue = new THREE.Color(0x00d2ff);

for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const x = (Math.random() - 0.5) * 400;
    const y = (Math.random() - 0.5) * 400;
    const z = (Math.random() - 0.5) * 400;

    pos[i3] = x;
    pos[i3 + 1] = y;
    pos[i3 + 2] = z;

    originalPos[i3] = x;
    originalPos[i3 + 1] = y;
    originalPos[i3 + 2] = z;

    const mix = Math.random() > 0.85 ? colorBlue : colorGrey;
    colors[i3] = mix.r;
    colors[i3 + 1] = mix.g;
    colors[i3 + 2] = mix.b;
}

geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const mat = new THREE.PointsMaterial({
    size: 1.2,
    map: createStarTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false, // Prevents square edges clipping
    blending: THREE.AdditiveBlending
});
const stars = new THREE.Points(geo, mat);
scene.add(stars);

function animate() {
    requestAnimationFrame(animate);

    // Subtle rotation
    stars.rotation.y += 0.0003;
    stars.rotation.x += 0.0001;

    // POINT-WISE INTERACTION (Stars react to mouse)
    const positions = geo.attributes.position.array;
    const mouseX_world = mx * 200;
    const mouseY_world = -my * 200;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const px = originalPos[i3];
        const py = originalPos[i3 + 1];

        // Calculate distance from mouse in world-ish coords
        const dx = px - mouseX_world;
        const dy = py - mouseY_world;
        const distSq = dx * dx + dy * dy;
        const force = Math.max(0, (5000 - distSq) / 5000) * 8;

        // Shift positions slightly
        positions[i3] = px + (dx / Math.sqrt(distSq + 1)) * force;
        positions[i3 + 1] = py + (dy / Math.sqrt(distSq + 1)) * force;
    }
    geo.attributes.position.needsUpdate = true;

    // Perspective Parallax
    camera.position.x += (mx * 30 - camera.position.x) * 0.05;
    camera.position.y += (-my * 30 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}
animate();

// Lighting for glass effect
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0x00d2ff, 2);
pointLight.position.set(20, 20, 20);
scene.add(pointLight);
const blueLight = new THREE.PointLight(0x0045ff, 2);
blueLight.position.set(-20, -20, 20);
scene.add(blueLight);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Roller Logic
const roller = document.querySelector('.roller');
if (roller) {
    let rollIdx = 0;
    const items = roller.querySelectorAll('.roll-item');
    setInterval(() => {
        rollIdx = (rollIdx + 1) % (items.length - 1);
        roller.style.transform = `translateY(-${rollIdx * 25}%)`;
        if (rollIdx === 0) {
            roller.style.transition = 'none';
            setTimeout(() => roller.style.transition = 'transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)', 50);
        }
    }, 2500);
}

// WhatsApp Lead Gen
const getVal = (id) => document.getElementById(id)?.value.trim() || '';
const whatsappBtn = document.getElementById('whatsapp-btn');
if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const data = {
            name: getVal('name'),
            email: getVal('email'),
            phone: getVal('contact-number') || 'N/A',
            city: getVal('city'),
            company: getVal('company-name') || 'N/A',
            linkedin: getVal('linkedin') || 'N/A'
        };
        if (!data.name || !data.email || !data.city) {
            alert('Please fill in required fields: Name, Email, and City');
            return;
        }
        const text = `Hellow!! \nI am *${data.name}*\nThese are my credentials\nEmail: ${data.email}\n*Contact:* ${data.phone}\n*City:* ${data.city}\n*Company:* ${data.company}\n*LinkedIn:* ${data.linkedin}`;
        window.open(`https://wa.me/919933760243?text=${encodeURIComponent(text)}`, '_blank');
    });
}

// Scroll reveal
const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1 });
document.querySelectorAll('.rv').forEach(el => obs.observe(el));

// Magnetic Buttons
document.querySelectorAll('.btn-p, .btn-s').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
        btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0,0)');
});

