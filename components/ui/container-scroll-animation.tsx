'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';

type ContainerScrollProps = {
  titleComponent: ReactNode;
  children: ReactNode;
};

export function ContainerScroll({ titleComponent, children }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mobileMQ = window.matchMedia('(max-width: 768px)');
    const motionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncMobile = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    const syncMotion = (e: MediaQueryListEvent | MediaQueryList) => setReducedMotion(e.matches);

    syncMobile(mobileMQ);
    syncMotion(motionMQ);

    mobileMQ.addEventListener('change', syncMobile);
    motionMQ.addEventListener('change', syncMotion);
    return () => {
      mobileMQ.removeEventListener('change', syncMobile);
      motionMQ.removeEventListener('change', syncMotion);
    };
  }, []);

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.7, 0.9] : [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  if (reducedMotion) {
    return (
      <div ref={containerRef} className="relative flex flex-col items-center gap-10 py-12 md:py-20">
        <StaticHeader>{titleComponent}</StaticHeader>
        <StaticCard>{children}</StaticCard>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-[60rem] items-center justify-center p-2 md:h-[80rem] md:p-20"
    >
      <div className="relative w-full py-10 md:py-40" style={{ perspective: '1000px' }}>
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
}

type HeaderProps = {
  translate: MotionValue<number>;
  titleComponent: ReactNode;
};

export function Header({ translate, titleComponent }: HeaderProps) {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="mx-auto max-w-5xl text-center"
    >
      {titleComponent}
    </motion.div>
  );
}

type CardProps = {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: ReactNode;
};

export function Card({ rotate, scale, children }: CardProps) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
      }}
      className="mx-auto -mt-12 h-[30rem] w-full max-w-5xl rounded-[30px] border-4 border-[#6C6C6C] bg-[#222222] p-2 shadow-2xl md:h-[40rem] md:p-6"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 md:rounded-2xl md:p-4 dark:bg-zinc-900">
        {children}
      </div>
    </motion.div>
  );
}

function StaticHeader({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl text-center">{children}</div>;
}

function StaticCard({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto h-[24rem] w-full max-w-5xl rounded-[30px] border-4 border-[#6C6C6C] bg-[#222222] p-2 shadow-2xl md:h-[32rem] md:p-6">
      <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 md:rounded-2xl md:p-4 dark:bg-zinc-900">
        {children}
      </div>
    </div>
  );
}
