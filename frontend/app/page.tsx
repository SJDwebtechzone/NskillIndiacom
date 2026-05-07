import BannerSection from "./components/BannerSection";
import AboutSection from "./components/AboutSection";
import VisionSection from "./components/VisionSection";
import WhyUsSection from "./components/WhyUsSection";
import TeamSection from "./components/TeamSection";
import LatestNewsSection from "./components/LatestNewsSection";
import AccreditationsSection from "./components/AccreditationsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import GoogleReviewsSection from "./components/GoogleReviewsSection";
import VideoTestimonialsSection from "./components/VideoTestimonialsSection";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-white w-full">
      {/* Banner Section - Full Width */}
      <div className="w-full">
        <BannerSection />
      </div>

      {/* About Section */}
      <div className="w-full">
        <AboutSection />
      </div>

      {/* Vision, Mission, Values Section */}
      <div className="w-full">
        <VisionSection />
      </div>

      {/* Why Us Section */}
      <div className="w-full">
        <WhyUsSection />
      </div>

      {/* Team Section */}
      <div className="w-full">
        <TeamSection />
      </div>



      


<div className="w-full">
  <TestimonialsSection />
</div>


<div className="w-full"><GoogleReviewsSection /></div>
<div className="w-full"><VideoTestimonialsSection /></div>
      {/* Latest News Section */}
      <div className="w-full">
        <LatestNewsSection />
      </div>

      {/* Accreditations Section */}
      <div className="w-full">
        <AccreditationsSection />
      </div>
    </div>
  );
}