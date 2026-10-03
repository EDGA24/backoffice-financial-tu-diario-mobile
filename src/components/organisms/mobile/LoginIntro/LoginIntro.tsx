import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { brand } from '@/theme/tokens';
import { motionDelay, motionDuration, motionEasing } from '@/theme/motionTokens';
import type { IntroVariant } from '@/components/atoms/IntroCascadeItem/IntroCascadeItem';

export interface LoginIntroProps {
    variant: Extract<IntroVariant, 'full' | 'reduced'>;
    // Ref al logo REAL del <BrandHeader /> — destino del viaje FLIP. Vive
    // fuera de este componente porque BrandHeader se renderiza dentro de
    // AuthScreenLayout, no aquí.
    headerLogoRef: React.RefObject<HTMLDivElement | null>;
    onSkip: () => void;
    onComplete: () => void;
}

// Overlay de la intro del Login: el bloque de logo+texto centrado (idéntico
// al splash nativo) que se desvanece hacia el <BrandHeader /> real usando la
// técnica FLIP (se mide el destino en vivo con getBoundingClientRect — así
// "aterriza" exacto sin importar el tamaño de pantalla). No dibuja su propio
// fondo: se apoya en que el panel de marca ya tiene el mismo color
// (brand.surface) detrás.
export const LoginIntro: React.FC<LoginIntroProps> = ({ variant, headerLogoRef, onSkip, onComplete }) => {
    const logoRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const animationsRef = useRef<Animation[]>([]);
    const finishedRef = useRef(false);

    useEffect(() => {
        const schedule = (fn: () => void, delayMs: number) => {
            const id = setTimeout(fn, delayMs);
            timeoutsRef.current.push(id);
        };

        // Algunos WebView de Android antiguos no implementan bien (o nada)
        // Element.animate() — si llegara a tirar un error, que no se lleve
        // entre manos el resto de la coreografía ni, sobre todo, los
        // setTimeout de onComplete que ya están programados aparte.
        const safeAnimate = (
            el: Element | null | undefined,
            keyframes: Keyframe[],
            options: KeyframeAnimationOptions
        ): Animation | undefined => {
            if (!el || typeof el.animate !== 'function') return undefined;
            try {
                return el.animate(keyframes, options);
            } catch {
                return undefined;
            }
        };

        if (variant === 'reduced') {
            // prefers-reduced-motion: nada de viaje ni escalas — solo un
            // fade de la superposición hacia el Login ya armado detrás.
            const anim = safeAnimate(
                logoRef.current?.parentElement,
                [{ opacity: 1 }, { opacity: 0 }],
                { duration: motionDuration.reducedMotionFade, easing: 'ease', fill: 'forwards' }
            );
            if (anim) animationsRef.current.push(anim);
            schedule(onComplete, motionDuration.reducedMotionFade);
            return () => timeoutsRef.current.forEach(clearTimeout);
        }

        // 900ms: el logo centrado viaja a la posición real del header
        // (FLIP) mientras el texto se desvanece.
        schedule(() => {
            const sourceEl = logoRef.current;
            const destEl = headerLogoRef.current;

            if (sourceEl && destEl) {
                const sourceRect = sourceEl.getBoundingClientRect();
                const destRect = destEl.getBoundingClientRect();
                const scale = destRect.width / sourceRect.width;
                const dx = (destRect.left + destRect.width / 2) - (sourceRect.left + sourceRect.width / 2);
                const dy = (destRect.top + destRect.height / 2) - (sourceRect.top + sourceRect.height / 2);

                const travelAnim = safeAnimate(
                    sourceEl,
                    [
                        { transform: 'translate(0px, 0px) scale(1)' },
                        { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
                    ],
                    { duration: motionDuration.logoTravel, easing: motionEasing.travel, fill: 'forwards' }
                );
                if (travelAnim) animationsRef.current.push(travelAnim);
            }

            const textFade = safeAnimate(
                textRef.current,
                [{ opacity: 1 }, { opacity: 0 }],
                { duration: 300, easing: 'ease', fill: 'forwards' }
            );
            if (textFade) animationsRef.current.push(textFade);
        }, motionDelay.logoTravelStart);

        // Al llegar, el logo viajero se desvanece mientras el header real
        // (animado aparte, vía CSS, en AuthScreenLayout) hace crossfade.
        schedule(() => {
            const fadeOut = safeAnimate(
                logoRef.current,
                [{ opacity: 1 }, { opacity: 0 }],
                { duration: motionDuration.crossfade, easing: 'ease', fill: 'forwards' }
            );
            if (fadeOut) animationsRef.current.push(fadeOut);
        }, motionDelay.logoTravelStart + motionDuration.logoTravel - 100);

        schedule(onComplete, motionDelay.logoTravelStart + motionDuration.logoTravel + motionDuration.crossfade);

        return () => timeoutsRef.current.forEach(clearTimeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSkip = () => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        timeoutsRef.current.forEach(clearTimeout);
        animationsRef.current.forEach((anim) => anim.cancel());
        onSkip();
        onComplete();
    };

    return (
        <Box
            onClick={handleSkip}
            onTouchStart={handleSkip}
            role="presentation"
            sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Box
                    ref={logoRef}
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '18px',
                        bgcolor: brand.onSurface,
                        color: brand.surface.light,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 26,
                        fontWeight: 600,
                        opacity: 0,
                        animation: variant === 'full'
                            ? `login-intro-logo-in ${motionDuration.logoFadeIn}ms ${motionEasing.entrance} forwards`
                            : 'none',
                        ...(variant === 'reduced' ? { opacity: 1 } : {}),
                    }}
                >
                    G
                </Box>

                <Box
                    ref={textRef}
                    sx={{
                        mt: 2,
                        opacity: 0,
                        animation: variant === 'full'
                            ? `login-intro-logo-in ${motionDuration.logoFadeIn}ms ${motionEasing.entrance} forwards`
                            : 'none',
                        ...(variant === 'reduced' ? { opacity: 1 } : {}),
                    }}
                >
                    <Box component="p" sx={{ m: 0, fontSize: 18, fontWeight: 600, color: brand.onSurface }}>
                        Gestión de créditos
                    </Box>
                    <Box component="p" sx={{ m: 0, mt: 0.5, fontSize: 12, color: brand.onSurfaceMuted }}>
                        Plataforma para equipos de crédito
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default LoginIntro;
