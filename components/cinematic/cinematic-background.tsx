// 全局背景已由 layout.tsx 的 AnimatedBackground 统一提供。
// 这个组件曾给每个 dashboard 页挂紫青粉渐变 + 极光 + 胶片颗粒，已废弃。
// 保留空壳以避免 10+ 个页面的引用报错；theme 参数不再生效。
export type CinematicTheme =
  | 'default'
  | 'listing'
  | 'messages'
  | 'social'
  | 'reviews'
  | 'announcement'
  | 'keywords'
  | 'translate'
  | 'optimizer'
  | 'pricing'

export default function CinematicBackground({ theme = 'default' }: { theme?: CinematicTheme }) {
  return null
}
