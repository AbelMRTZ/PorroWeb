import { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

const HIDE_PATTERNS = ['floor', 'platform', 'base', 'ground', 'stage', 'plane', 'shadow', 'disc', 'circle']

function onLoad(spline) {
  // Official API: set background to black so CSS mix-blend-mode:screen makes it transparent
  try { spline.setBackgroundColor('#000000') } catch {}

  // Hide scene platform/floor objects by name
  try {
    spline.getAllObjects().forEach(obj => {
      const name = obj.name?.toLowerCase() ?? ''
      if (HIDE_PATTERNS.some(p => name.includes(p))) obj.visible = false
    })
  } catch {}
}

export function RobotSpline({ scene }) {
  return (
    <Suspense fallback={<div className="robot-fallback" />}>
      <Spline
        scene={scene}
        onLoad={onLoad}
        style={{ width: '100%', height: '100%' }}
      />
    </Suspense>
  )
}
