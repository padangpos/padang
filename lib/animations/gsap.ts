import gsap from 'gsap';

export const animateCartAdd = (targetRef: HTMLElement | null) => {
  if (!targetRef) return;
  gsap.fromTo(
    targetRef,
    { scale: 1 },
    { scale: 1.2, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' }
  );
};

export const animateDraftSlideUp = (containerRef: HTMLElement | null) => {
  if (!containerRef) return;
  gsap.fromTo(
    containerRef,
    { y: 60, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
  );
};

export const animatePaymentSuccess = (checkmarkRef: HTMLElement | null) => {
  if (!checkmarkRef) return;
  gsap.fromTo(
    checkmarkRef,
    { scale: 0, rotate: -45 },
    { scale: 1, rotate: 0, duration: 0.4, ease: 'back.out(1.7)' }
  );
};
