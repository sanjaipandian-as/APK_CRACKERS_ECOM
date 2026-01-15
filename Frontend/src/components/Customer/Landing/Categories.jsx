import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"

const Categories = () => {
    const navigate = useNavigate()
    const [index, setIndex] = useState(0)
    const [visibleCards, setVisibleCards] = useState(1)
    const [cardWidth, setCardWidth] = useState(280)
    const [gap, setGap] = useState(24)

    const categories = useMemo(() => [
        {
            name: "Sparklers",
            slug: "sparklers",
            image: "https://content.jdmagicbox.com/comp/def_content_category/sparkler-cracker-manufacturers/360-f-806742497-9hlmrm0cwruwipbnbmrqscnrzfauspgh-sparkler-cracker-manufacturers-3-04sws.jpg"
        },
        {
            name: "Rockets",
            slug: "rockets",
            image: "https://static.vecteezy.com/system/resources/previews/042/049/628/non_2x/realistic-firecrackers-with-light-explosive-effect-firework-rockets-with-sparkling-fireworks-explosions-illustration-vector.jpg"
        },
        {
            name: "Fountains",
            slug: "fountains",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnI2-zH6EVyTiMaHQNtIwT3tUBdIWAeVO9fQ&s"
        },
        {
            name: "Gift Boxes",
            slug: "gift-boxes",
            image: "https://st.depositphotos.com/1052036/1919/v/450/depositphotos_19195715-stock-illustration-festival-gift.jpg"
        },
        {
            name: "Chakras",
            slug: "chakras",
            image: "https://img.freepik.com/premium-photo/nice-forceful-bright-sparking-lighting-from-fire-crackers-chakra-diwali-festival_653429-2595.jpg"
        },
        {
            name: "Flower Pots",
            slug: "flower-pots",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXAjQwT-IKuLWwejxPIjC1NPddAHIpL6wwhg&s"
        },
        {
            name: "Others",
            slug: "others",
            image: "https://png.pngtree.com/png-vector/20250830/ourmid/pngtree-diwali-gifts-with-bows-and-ribbon-png-image_17337363.webp"
        }
    ], [])

    useEffect(() => {
        const calculateLayout = () => {
            const width = window.innerWidth
            let calculatedCardWidth = 280
            let calculatedGap = 24
            let padding = 0

            if (width < 640) {
                calculatedCardWidth = 260
                calculatedGap = 16
                padding = 32
            } else if (width < 768) {
                calculatedCardWidth = 270
                calculatedGap = 20
                padding = 48
            } else if (width < 1024) {
                calculatedCardWidth = 280
                calculatedGap = 20
                padding = 96
            } else {
                calculatedCardWidth = 280
                calculatedGap = 24
                padding = 112
            }

            padding += 48
            const availableWidth = width - padding
            const cards = Math.floor(availableWidth / (calculatedCardWidth + calculatedGap))

            setCardWidth(calculatedCardWidth)
            setGap(calculatedGap)
            setVisibleCards(Math.max(1, cards))
        }

        let timeoutId
        const debouncedCalculate = () => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(calculateLayout, 150)
        }

        calculateLayout()
        window.addEventListener('resize', debouncedCalculate)
        return () => {
            clearTimeout(timeoutId)
            window.removeEventListener('resize', debouncedCalculate)
        }
    }, [])

    const prev = useCallback(() => {
        setIndex(prev => Math.max(0, prev - 1))
    }, [])

    const next = useCallback(() => {
        setIndex(prev => Math.min(categories.length - visibleCards, prev + 1))
    }, [categories.length, visibleCards])

    const handleCategoryClick = useCallback((slug) => {
        navigate(`/category/${slug}`)
    }, [navigate])

    const handleDotClick = useCallback((i) => {
        setIndex(i)
    }, [])

    const isAtStart = index === 0
    const isAtEnd = index >= categories.length - visibleCards
    const totalSlides = Math.ceil(categories.length / visibleCards)

    return (
        <section className="w-full py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:pl-12 md:pr-16">
            <div className="max-w-8xl mx-auto px-2 sm:px-4 md:px-6">
                <div className="mb-6 sm:mb-8 md:mb-10">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Shop by Category
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                        Explore premium crackers & fireworks
                    </p>
                </div>

                <div className="relative">
                    {!isAtStart && (
                        <button
                            onClick={prev}
                            className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all border border-gray-200"
                            aria-label="Previous categories"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                    )}

                    <div
                        className="w-full overflow-x-auto md:overflow-hidden scrollbar-hide scroll-smooth snap-x snap-mandatory"
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                    >
                        <div
                            className="flex gap-4 md:gap-5 lg:gap-6 transition-transform duration-500 ease-in-out md:transition-transform pb-2 md:pb-0"
                            style={{
                                transform: window.innerWidth >= 768 ? `translateX(-${index * (cardWidth + gap)}px)` : 'none',
                                willChange: 'transform'
                            }}
                        >
                            {categories.map((cat, i) => (
                                <div
                                    key={cat.slug}
                                    onClick={() => handleCategoryClick(cat.slug)}
                                    className="flex-shrink-0 w-[260px] sm:w-[270px] md:w-[280px] bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group snap-start"
                                    style={{ minWidth: `${cardWidth}px` }}
                                >
                                    <div className="h-36 sm:h-40 md:h-44 w-full overflow-hidden bg-gray-100">
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = '/Monkey.jpg';
                                                e.target.onerror = null;
                                            }}
                                        />
                                    </div>

                                    <div className="p-3 sm:p-4">
                                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                            {cat.name}
                                        </h3>
                                        <button className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md">
                                            View Products
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {!isAtEnd && (
                        <button
                            onClick={next}
                            className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all border border-gray-200"
                            aria-label="Next categories"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    )}
                </div>

                <div className="md:hidden flex justify-center items-center gap-2 mt-4 text-xs text-gray-500">
                    <ChevronLeft className="w-3 h-3" />
                    <span>Swipe to explore more</span>
                    <ChevronRight className="w-3 h-3" />
                </div>

                <div className="hidden md:flex justify-center items-center gap-2 mt-6">
                    {Array.from({ length: totalSlides }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handleDotClick(i)}
                            className={`h-2 rounded-full transition-all ${i === index
                                ? 'w-8 bg-orange-500'
                                : 'w-2 bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    )
}

export default Categories
