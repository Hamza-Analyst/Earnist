type MotionOrbitProps = { compact?: boolean };
export default function MotionOrbit({ compact = false }: MotionOrbitProps) {
  return <span className={compact ? 'motion-orbit-loader compact' : 'motion-orbit-loader'} aria-hidden="true">
    <span className="motion-orbit-track"><span className="motion-orbit-ball"/></span>
    <span className="motion-orbit-core">E</span>
  </span>;
}
