import { useMemo, useState } from "react";

const DEFAULT_STATE = {
  "--tilt-rotate-x": "0deg",
  "--tilt-rotate-y": "0deg",
  "--tilt-glow-x": "50%",
  "--tilt-glow-y": "50%",
  "--tilt-shine-opacity": 0,
  "--tilt-scale": 1,
};

export function useTilt({ maxRotate = 10, scale = 1.015, disabled = false } = {}) {
  const [styleState, setStyleState] = useState(DEFAULT_STATE);

  const tiltHandlers = useMemo(
    () => ({
      onMouseMove(event) {
        if (disabled) {
          return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const percentX = (event.clientX - rect.left) / rect.width;
        const percentY = (event.clientY - rect.top) / rect.height;
        const rotateY = (percentX - 0.5) * maxRotate * 2;
        const rotateX = (0.5 - percentY) * maxRotate * 1.4;

        setStyleState({
          "--tilt-rotate-x": `${rotateX.toFixed(2)}deg`,
          "--tilt-rotate-y": `${rotateY.toFixed(2)}deg`,
          "--tilt-glow-x": `${(percentX * 100).toFixed(2)}%`,
          "--tilt-glow-y": `${(percentY * 100).toFixed(2)}%`,
          "--tilt-shine-opacity": 1,
          "--tilt-scale": scale,
        });
      },
      onMouseLeave() {
        setStyleState(DEFAULT_STATE);
      },
    }),
    [disabled, maxRotate, scale],
  );

  return {
    tiltStyle: styleState,
    tiltHandlers,
  };
}
