// 'use client'
// See: https://nextjs.org/docs/app/api-reference/functions/use-link-status#example
// See: https://nextjs.org/docs/app/getting-started/linking-and-navigating#slow-networks
// import { useLinkStatus } from 'next/link'

// export default function LoadingIndicator() {
//   const { pending } = useLinkStatus()
//   return (
//     <span aria-hidden className={`link-hint ${pending ? 'is-pending' : ''}`} />
//   )
// }

function LoadingSkeleton() {
  return <div>Im the loading LoadingSkeleton</div>;
}

export { LoadingSkeleton };
