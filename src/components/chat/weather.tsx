import { CloudSunIcon, DropletsIcon, WindIcon } from 'lucide-react'

type WeatherData = {
  location?: string
  temperature?: number
  condition?: string
  humidity?: number
  windSpeed?: number
}
export function Weather({
  weatherAtLocation,
}: {
  weatherAtLocation: WeatherData
}) {
  return (
    <div className='w-full rounded-xl border bg-card p-4'>
      <div className='flex items-center gap-3'>
        <CloudSunIcon className='size-8' />
        <div>
          <p className='font-medium'>
            {weatherAtLocation.location ?? 'Weather'}
          </p>
          <p className='text-2xl font-semibold'>
            {weatherAtLocation.temperature ?? '--'}°
          </p>
        </div>
      </div>
      <p className='mt-3 text-sm text-muted-foreground'>
        {weatherAtLocation.condition ?? 'Conditions unavailable'}
      </p>
      <div className='mt-3 flex gap-4 text-xs text-muted-foreground'>
        <span className='flex items-center gap-1'>
          <DropletsIcon className='size-3' />
          {weatherAtLocation.humidity ?? '--'}%
        </span>
        <span className='flex items-center gap-1'>
          <WindIcon className='size-3' />
          {weatherAtLocation.windSpeed ?? '--'}
        </span>
      </div>
    </div>
  )
}
