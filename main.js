//* ==================== UTILS ==================== */
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const $ = (s, root) => (root || document).querySelector(s);
const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));

/* ==================== DOM READY SETUP ==================== */
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initPrivacy();
  initMastheadFloats();
  initHeroAnimation();
  initOverlay();
  initCoachingBoxes();
  initNavigation();
  initLogo();
});

/* ==================== MASTHEAD FLOATING ELEMENTS ==================== */
function initMastheadFloats() {
  const masthead = $('#masthead');
  if (!masthead) return;
  
  // Create three additional floating circle elements
  for (let i = 1; i <= 3; i++) {
    const float = document.createElement('div');
    float.className = `masthead-float-${i}`;
    masthead.appendChild(float);
  }
}

/* ==================== YEAR + PRIVACY SETUP ==================== */
function initYear() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initPrivacy() {
  const emailSpan = $('#contact-email');
  if (emailSpan) {
    const link = document.createElement('a');
    link.href = 'mailto:studio@designstamp.com';
    link.textContent = 'studio@designstamp.com';
    emailSpan.appendChild(link);
  }

  const dateSpan = $('#policy-updated');
  if (dateSpan) {
    const past = new Date();
    past.setMonth(past.getMonth() - 2);
    dateSpan.textContent = past.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Wire privacy details expand/collapse
  const details = $('.footer-legal details');
  if (!details) return;

  // Listen for details open state change
  details.addEventListener('toggle', () => {
    if (details.open) {
      // Scroll the details element into view after it opens
      requestAnimationFrame(() => {
        const rect = details.getBoundingClientRect();
        const scrollTop = window.scrollY + rect.top - 100;
        window.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      });
    }
  });

  // Wire close link inside privacy panel
  const closeLink = $('.privacy-back a', details);
  const closeX = $('.privacy-close-x', details);

  function closePrivacy(e) {
    e.preventDefault();
    details.open = false;
    // Scroll back to footer after closing
    setTimeout(() => {
      const footer = $('footer');
      if (footer) {
        window.scrollTo({
          top: footer.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  if (closeLink) {
    closeLink.addEventListener('click', closePrivacy);
  }

  if (closeX) {
    closeX.addEventListener('click', closePrivacy);
  }
}




/* ==================== HERO SENTENCE ANIMATION ==================== */
let isScrolling = false; // Global flag to prevent nav shifting during smooth scroll

function initHeroAnimation() {
  const masthead = $('#masthead');
  const row = $('#sentenceRow');
  const inner = $('#sentenceInner');
  const rests = $$('.nav-rest', row);
  const words = $$('.nav-word', row);

  if (!masthead || !row) return;

  const css = getComputedStyle(document.documentElement);
  const BOX_SIZE = parseFloat(css.getPropertyValue('--boxSize'));
  const BOX_INSET = parseFloat(css.getPropertyValue('--boxInset'));
  const HERO_H_PX = () => window.innerHeight * (parseFloat(css.getPropertyValue('--heroHvh')) / 100);
  const ROW_GAP_START = parseFloat(css.getPropertyValue('--rowGapStart'));
  const ROW_GAP_END = parseFloat(css.getPropertyValue('--rowGapEnd'));

  const SCROLL_TOTAL = 520;
  const FADE_END_POINT = 0.4;
  let scrollProgress = 0;
  let restWidths = [];
  let isNavigating = false; // Navigation lock flag

  function measureRestWidths() {
    restWidths = rests.map(r => {
      const prev = r.style.maxWidth;
      r.style.maxWidth = 'none';
      const w = r.scrollWidth;
      r.style.maxWidth = prev;
      return w;
    });
  }

  function fitSentence() {
    if (isNavigating) return; // Don't recalculate during navigation
    
    const isMobile = window.innerWidth < 900;
    const leftGap = lerp(ROW_GAP_START, ROW_GAP_END, scrollProgress);
    
    if (isMobile) {
      const mobileLeft = 12;
      const finalLeft = BOX_INSET + BOX_SIZE + 18;
      const transitionProgress = Math.min(scrollProgress * 2.5, 1);
      
      row.style.left = `${lerp(mobileLeft, finalLeft, transitionProgress)}px`;
      
      const mobileWidth = window.innerWidth - 24;
      const desktopWidth = window.innerWidth - finalLeft - 12;
      const avail = lerp(mobileWidth, desktopWidth, transitionProgress);
      const scale = Math.min(1, avail / inner.scrollWidth);
      row.style.setProperty('--fit', scale);
    } else {
      const left = BOX_INSET + BOX_SIZE + leftGap + 6;
      row.style.left = `${left}px`;
      const rightBuffer = 40;
      const avail = Math.max(140, window.innerWidth - left - rightBuffer);
      const scale = Math.min(1, avail / inner.scrollWidth);
      row.style.setProperty('--fit', scale);
    }
  }

  function onScroll() {
    if (isScrolling) return; // Skip all recalculations during smooth scroll
    
    scrollProgress = clamp(window.scrollY / SCROLL_TOTAL, 0, 1);
    const fadePhase = clamp(scrollProgress / FADE_END_POINT, 0, 1);

    rests.forEach((r, i) => {
      r.style.setProperty('--rest-fade', fadePhase);
      r.style.maxWidth = (restWidths[i] || 0) * (1 - fadePhase) + 'px';
      r.style.marginRight = 0.2 * (1 - fadePhase) + 'em';
    });

    words.forEach(w => {
      w.style.marginLeft = 0.25 * (1 - fadePhase) + 'em';
    });

    let boxProgress = 0;
    if (scrollProgress > FADE_END_POINT) {
      boxProgress = (scrollProgress - FADE_END_POINT) / (1 - FADE_END_POINT);
    }
    const e = easeOutCubic(boxProgress);
    const heroH = HERO_H_PX();

    masthead.style.transform = `translate(${lerp(0, BOX_INSET, e)}px,${lerp(0, BOX_INSET, e)}px) scale(${lerp(1, BOX_SIZE / window.innerWidth, e)},${lerp(1, BOX_SIZE / heroH, e)})`;
    
    const isMobile = window.innerWidth < 900;
    const startTop = isMobile ? window.innerHeight * 0.45 : window.innerHeight * 0.425;
    const endTop = isMobile ? BOX_INSET + BOX_SIZE + 15 : BOX_INSET + BOX_SIZE * 1.35;
    row.style.top = `${lerp(startTop, endTop, e)}px`;

    fitSentence();
  }

  measureRestWidths();
  fitSentence();
  onScroll();

  window.addEventListener('resize', () => { measureRestWidths(); fitSentence(); }, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Expose function to manually fade sentence
  window.fadeSentence = () => {
    rests.forEach((r) => {
      r.style.setProperty('--rest-fade', 1);
      r.style.maxWidth = '0px';
      r.style.marginRight = '0em';
    });
    words.forEach(w => {
      w.style.marginLeft = '0em';
    });
    
    // Force hero animation to complete state
    const isMobile = window.innerWidth < 900;
    const endTop = isMobile ? BOX_INSET + BOX_SIZE + 15 : BOX_INSET + BOX_SIZE * 1.35;
    
    masthead.style.transform = `translate(${BOX_INSET}px,${BOX_INSET}px) scale(${BOX_SIZE / window.innerWidth},${BOX_SIZE / HERO_H_PX()})`;
    row.style.top = `${endTop}px`;
    
    // Force scroll progress to 1 and position nav words
    scrollProgress = 1;
    
    // Position nav words to right of logo
    const leftGap = ROW_GAP_END;
    if (isMobile) {
      const finalLeft = BOX_INSET + BOX_SIZE + 18;
      row.style.left = `${finalLeft}px`;
      const desktopWidth = window.innerWidth - finalLeft - 12;
      const scale = Math.min(1, desktopWidth / inner.scrollWidth);
      row.style.setProperty('--fit', scale);
    } else {
      const left = BOX_INSET + BOX_SIZE + leftGap + 6;
      row.style.left = `${left}px`;
      const rightBuffer = 40;
      const avail = Math.max(140, window.innerWidth - left - rightBuffer);
      const scale = Math.min(1, avail / inner.scrollWidth);
      row.style.setProperty('--fit', scale);
    }
  };
}


/* ==================== OVERLAY + CASE LOGIC ==================== */
function initOverlay() {
  const overlay = $('#overlay');
  const pClient = $('#panel-client');
  const pQuestion = $('#panel-question');
  const pContent = $('#panel-content');
  const closeBtn = $('#closeBtn');

  if (!overlay) return;

  let lastFocus = null;

  function markLoaded(img) {
    img.classList.add('img-loaded');
  }

  function wireImages(root) {
    $$('img', root).forEach(img => {
      if (img.complete) markLoaded(img);
      else {
        img.addEventListener('load', () => markLoaded(img), { once: true });
        img.addEventListener('error', () => markLoaded(img), { once: true });
      }
    });
  }

  function openCase(id) {
    const tpl = $(`#case-templates template#${id}`);
    if (!tpl) return;

    lastFocus = document.activeElement;
    pClient.textContent = tpl.dataset.client || '';
    pQuestion.textContent = tpl.dataset.question || '';
    pContent.innerHTML = '';
    pContent.appendChild(tpl.content.cloneNode(true));

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('overlay-open');

    wireImages(pContent);
    closeBtn.focus();
  }

  function closeCase() {
    overlay.classList.remove('open');
    pClient.textContent = '';
    pQuestion.textContent = '';
    pContent.innerHTML = '';
    document.body.style.overflow = '';
    document.body.classList.remove('overlay-open');

    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Wire all work-row buttons
  $$('.work-row button').forEach(btn => {
    btn.addEventListener('click', () => openCase(btn.dataset.target));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeCase);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCase();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeCase();
  });
}

/* ==================== COACHING BOXES (ACCORDION) ==================== */
function initCoachingBoxes() {
  $$('.coaching-box').forEach(box => {
    box.addEventListener('click', () => {
      const wasActive = box.classList.contains('active');
      $$('.coaching-box').forEach(b => b.classList.remove('active'));

      if (!wasActive) {
        box.classList.add('active');
      } else {
        const coaching = $('#coaching');
        if (coaching) {
          setTimeout(() => {
            coaching.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    });
  });

  // Stagger animation indices
  $$('.work-row').forEach((row, i) => {
    row.style.setProperty('--i', i);
  });
}

/* ==================== BADGE INJECTION ==================== */
(function initBadges() {
  const badgeMap = {
    'Central 1': ['Banking', 'banking'],
    'Johns Hopkins University': ['Global Health', 'health'],
    'REBC Forms App': ['Public Sector', 'public'],
    'United Way': ['Nonprofit', 'nonprofit'],
    'BlueShore Financial': ['Banking', 'banking'],
    'LTSA': ['Public Sector', 'public'],
    'RECBC Knowledge Base': ['Public Sector', 'public'],
    'Rouxbe': ['Education', 'education'],
    'PEPFAR': ['Global Health', 'health'],
    'OECD': ['Public Sector', 'public'],
    'CanWaCH': ['Global Health', 'health']
  };

  function addBadge(root) {
    const h = $('h1, h2, h3', root);
    if (!h || h.previousElementSibling?.classList.contains('case-badge')) return;

    for (const [key, [label, cls]] of Object.entries(badgeMap)) {
      if (h.textContent.toLowerCase().includes(key.toLowerCase())) {
        const span = document.createElement('span');
        span.className = `work-badge case-badge ${cls}`;
        span.textContent = label;
        h.parentNode.insertBefore(span, h);
        h.parentNode.insertBefore(document.createElement('br'), h);
        break;
      }
    }
  }

  $$('.panel, .panel-body, .overlay-content').forEach(addBadge);

  new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.matches?.('.panel, .panel-body')) addBadge(node);
          $$('.panel, .panel-body', node).forEach(addBadge);
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: true });
})();

/* ==================== NAVIGATION SETUP ==================== */

function initNavigation() {
  const navShield = $('#navShield');
  const navWords = $$('.nav-word[data-link^="#"]');
  const globalNavWords = $$('.nav-word[data-link^="#"]:not(.footer-link)');

  if (!navShield) createNavShield();

  const sectionMap = {
    '#coaching': $('section#coaching h1, section#coaching h2'),
    '#work': $('section#work h1, section#work h2'),
    '#about': $('section#about h1, section#about h2')
  };

  function updateNavActive() {
    const shield = $('#navShield');
    if (!shield) return;

    const shieldRect = shield.getBoundingClientRect();
    let activeLink = null;

    for (const [link, heading] of Object.entries(sectionMap)) {
      if (!heading) continue;
      const rect = heading.getBoundingClientRect();
      if (rect.top <= shieldRect.bottom + 10) { // Slight buffer
        activeLink = link;
      }
    }

    globalNavWords.forEach(w => {
      w.classList.toggle('active', w.dataset.link === activeLink);
    });
  }

  window.addEventListener('scroll', updateNavActive, { passive: true });
  window.addEventListener('resize', updateNavActive, { passive: true });

  navWords.forEach(nav => {
    nav.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = nav.dataset.link;
      const section = $(targetId);
      if (!section) return;

      const heading = $('h1, h2', section) || section;
      const shield = $('#navShield');
      const navHeight = shield?.offsetHeight || 100;
      const isMobile = window.innerWidth < 900;

      // 1. Force state update if navigating to prevent height shifts
      if (isMobile && window.fadeSentence) {
        window.fadeSentence();
      }

      // 2. Calculate direction and target
      const rect = heading.getBoundingClientRect();
      const currentScroll = window.scrollY;
      const absoluteHeadingTop = currentScroll + rect.top;
      const isMovingUp = absoluteHeadingTop < currentScroll;

      let extraLift = 0;

      if (isMobile) {
        // Mobile specific logic
        if (targetId === '#coaching' && isMovingUp) {
          extraLift = 80; // Significant extra room for the bounce when coming from bottom
        } else if (targetId === '#work' && isMovingUp) {
          extraLift = 40;
        } else {
          // Standard downward or neutral offsets
          extraLift = { '#coaching': 10, '#work': -10, '#about': -30 }[targetId] || 0;
        }
      } else {
        // Desktop specific logic
        if (targetId === '#coaching' && isMovingUp) {
          extraLift = -140; // Less negative = more space at top
        } else {
          extraLift = { '#coaching': -220, '#work': -240, '#about': -260 }[targetId] || -280;
        }
      }

      const target = Math.max(0, absoluteHeadingTop - (navHeight + extraLift));

      // 3. Execute Scroll
      if (isMobile) {
        isScrolling = true;
        window.scrollTo({
          top: target,
          behavior: 'smooth'
        });
        
        setTimeout(() => {
          isScrolling = false;
        }, 1000);
      } else {
        scrollToWithBounce(target, 1300);
      }

      // 4. UI Update
      globalNavWords.forEach(w => w.classList.remove('active'));
      if (!nav.classList.contains('footer-link')) {
        nav.classList.add('active');
      }
    });
  });
}
function createNavShield() {
  const shield = document.createElement('div');
  shield.id = 'navShield';
  document.body.appendChild(shield);

  function toggleShield() {
    shield.style.opacity = window.scrollY > window.innerHeight * 0.35 ? 1 : 0;
  }

  window.addEventListener('scroll', toggleShield, { passive: true });
  window.addEventListener('load', toggleShield);
}

/* ==================== LUXURY SCROLL ==================== */
function scrollToWithBounce(targetY, duration = 1300) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  const startTime = performance.now();

  const easeOutSpring = t => {
    const damping = 5.6;
    const frequency = 2.0;
    return 1 - Math.pow(2, -damping * t) * Math.cos(t * frequency * Math.PI);
  };

  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = easeOutSpring(t);
    let nextY = startY + diff * eased;

    if (diff < 0 && nextY < targetY) {
      nextY = lerp(nextY, targetY, 0.25);
    }

    window.scrollTo(0, nextY);
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

window.scrollToWithBounce = scrollToWithBounce;

/* ==================== LOGO SETUP ==================== */
function initLogo() {
  const logo = $('.logoBox');
  const logoLink = $('#logo-link');

  if (!logo) return;

  // Create and style logo backer
  let backer = $('.logo-backer', logo);
  if (!backer) {
    backer = document.createElement('div');
    backer.className = 'logo-backer';
    logo.prepend(backer);
  }

  const brandColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--brand')
    .trim() || '#fb5449';

  Object.assign(backer.style, {
    position: 'absolute',
    inset: '0',
    background: brandColor,
    zIndex: '0'
  });

  const svg = $('svg', logo);
  if (svg) svg.style.position = 'relative';

  // Lock logo to square
  function lockSquare() {
    const w = logo.offsetWidth;
    logo.style.height = w + 'px';
  }

  window.addEventListener('resize', lockSquare, { passive: true });
  window.addEventListener('load', lockSquare);
  lockSquare();

  // Logo click handler
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();

      // Close overlay
      const overlay = $('#overlay');
      if (overlay) {
        overlay.classList.remove('open');
        document.body.classList.remove('overlay-open');
      }

      // Clear nav highlights
      $$('.nav-word').forEach(w => w.classList.remove('active'));

      // Scroll to top with bounce
      scrollToWithBounce(0, 900);

      // Reload when at top
      let tries = 0;
      const tick = () => {
        tries++;
        if (window.scrollY <= 1 || tries >= 180) {
          if (history.replaceState) {
            history.replaceState(null, '', location.pathname + location.search);
          }
          location.reload();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }
}

/* --- CLEAN PRIVACY OPEN/CLOSE --- */
document.addEventListener("DOMContentLoaded", () => {
  const privacyToggle = document.querySelector(".footer-privacy-toggle");
  const privacyPanel = document.querySelector("#privacy-panel");
  const privacyClose = document.querySelector(".privacy-close-link");
  const footer = document.querySelector("footer");

  if (!privacyPanel) return;

  // OPEN
  if (privacyToggle) {
    privacyToggle.addEventListener("click", e => {
      e.preventDefault();
      privacyPanel.classList.add("open");

      requestAnimationFrame(() => {
        privacyPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  // CLOSE
  if (privacyClose) {
    privacyClose.addEventListener("click", e => {
      e.preventDefault();
      privacyPanel.classList.remove("open");

      requestAnimationFrame(() => {
        footer.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }
});




window.addEventListener('scroll', () => {
  const tag = document.getElementById('anniv-tag');
  if (!tag) return;
  
  // Scrolled past hero section
  if (window.scrollY > (window.innerHeight * 0.35)) {
    tag.classList.add('on-white');
  } else {
    tag.classList.remove('on-white');
  }
});