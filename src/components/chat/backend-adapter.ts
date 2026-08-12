import { toast } from 'sonner'

export function notifyLocalOnly(feature: string) {
  toast.info(
    `${feature} is available in this browser session; server persistence is not configured.`
  )
}

export async function unsupportedServerAction(feature: string): Promise<never> {
  throw new Error(
    `${feature} requires a persistence backend that is not configured for this demo.`
  )
}
