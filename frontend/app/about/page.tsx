import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-sarn-oat py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-sarn-charcoal mb-4">
          Our Story
        </h1>
        <p className="text-lg text-sarn-charcoal/80 max-w-2xl mx-auto font-medium">
          Purity, safety, and complete peace of mind for your little one's journey.
        </p>
      </div>

      {/* Story Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        
        {/* Text Side */}
        <div className="md:w-1/2 space-y-8">
          <h2 className="text-3xl lg:text-4xl font-serif text-sarn-charcoal leading-snug">
            Born from a simple realization.
          </h2>
          
          <div className="text-gray-600 space-y-6 leading-relaxed text-lg">
            <p>
              Welcome to SARN. We believe that what goes on your baby’s sensitive skin—and into their little hands—should be as pure as their smile. Our journey began when we realized that finding truly safe, organic, and strictly halal-certified baby products shouldn't be a struggle.
            </p>
            <p>
              Parents already have enough to worry about. Reading complex ingredient lists and double-checking certifications shouldn't be one of them. We set out to curate and craft premium essentials so you can shop with absolute confidence.
            </p>
            <p>
              Every item in our boutique is carefully selected to meet the highest standards of safety, ethics, and quality. Because your family deserves nothing less.
            </p>
          </div>
          
          <div className="pt-4">
            <Link 
              href="/"
              className="inline-block bg-sarn-sage text-white px-10 py-3.5 rounded-full hover:bg-sarn-sage-dark transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
            >
              Shop the Collection
            </Link>
          </div>
        </div>

        {/* Image Side - Relatable Teether Photo */}
        <div className="md:w-1/2 w-full">
          <div className="relative h-[550px] w-full rounded-3xl overflow-hidden shadow-lg border border-sarn-oat">
            <Image
              src="/products/teether-baby.jpg" 
              alt="Baby with a natural wooden teething ring"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

      </div>
    </div>
  );
}