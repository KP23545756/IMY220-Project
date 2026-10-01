import { useState } from 'react'
import Header from '../components/Header.jsx'
import Feed from '../components/Feed.jsx'
import FeaturedCarousel from '../components/FeaturedCarousel.jsx'

function Home() {
  const [feedType, setFeedType] = useState('global')

  return (
    <div className="min-h-screen bg-neutral-900 text-white page-bg">
      <Header />
      <main className="max-w-6xl mx-auto px-5 py-5">
        <FeaturedCarousel />
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setFeedType('global')}
            className={`rounded-full px-4 py-1 text-sm border cursor-pointer transition-colors ${feedType === 'global' ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white hover:bg-white hover:text-black'}`}
          >
            Global
          </button>
          <button
            onClick={() => setFeedType('local')}
            className={`rounded-full px-4 py-1 text-sm border cursor-pointer transition-colors ${feedType === 'local' ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white hover:bg-white hover:text-black'}`}
          >
            Following
          </button>
        </div>
        <Feed feedType={feedType} />
      </main>
    </div>
  )
}

export default Home