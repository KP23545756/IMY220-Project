import Header from '../components/Header.jsx'
import FeaturedCarousel from '../components/FeaturedCarousel.jsx'
import Feed from '../components/Feed.jsx'

function Home() {
  return (
    <div className="page page--home">
      <Header />
      <main>
        <FeaturedCarousel />
        <Feed />
      </main>
    </div>
  )
}

export default Home