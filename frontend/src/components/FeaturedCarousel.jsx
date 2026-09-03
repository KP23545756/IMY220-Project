import { useState } from 'react'
import Carousel1 from '../assets/carousel1_GaryBendig_FurryFriend.avif'
import Carousel2 from '../assets/carousel2_DamianoBashciera_MountainView.avif'
import Carousel3 from '../assets/carousel3_AChosenSoul_FlowerTunnel.avif'

// TODO: replace with real featured/trending posts fetched from the 
// backend once that functionality exists.
const dummyFeatured = [
  { id: 1, name: 'Furry Friend', creator: 'Gary Bendig', image: Carousel1 },
  { id: 2, name: 'Mountain View', creator: 'Damiano Bashciera', image: Carousel2 },
  { id: 3, name: 'Flower Tunnel', creator: 'A Chosen Soul', image: Carousel3 },
]

function FeaturedCarousel() {
  const [index, setIndex] = useState(0)
  const current = dummyFeatured[index]

  const goPrev = () =>
    setIndex((i) => (i === 0 ? dummyFeatured.length - 1 : i - 1))
  const goNext = () =>
    setIndex((i) => (i === dummyFeatured.length - 1 ? 0 : i + 1))

  return (
    <div className="featured-carousel placeholder-box">
      <button type="button" className="carousel-arrow" onClick={goPrev} aria-label="Previous">
        &#8592;
      </button>

      <div className="carousel-content">
        {/* TODO: replace with the actual featured post's image*/}
        <img src={current.image} alt={current.name} className="carousel" />
      </div>
      <div>
        <p className="carousel-caption">
          {current.name}
          <br />{current.creator}
        </p>
      </div>

      <button type="button" className="carousel-arrow" onClick={goNext} aria-label="Next">
        &#8594;
      </button>
    </div>
  )
}

export default FeaturedCarousel