import BannerSection from "./components/BannerSection";
import AboutSection from "./components/AboutSection";
import VisionSection from "./components/VisionSection";
import WhyUsSection from "./components/WhyUsSection";
import TeamSection from "./components/TeamSection";
import PopularCoursesSection from "./components/PopularCoursesSection";
import UpcomingBatchesSection from "./components/UpcomingBatchesSection";
import LatestNewsSection from "./components/LatestNewsSection";
import AccreditationsSection from "./components/AccreditationsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import GoogleReviewsSection from "./components/GoogleReviewsSection";
import JustDialReviewsSection from "./components/JustDialReviewsSection";
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

      {/* Popular Courses Section */}
      <div className="w-full">
        <PopularCoursesSection />
      </div>

      {/* Upcoming Batches & Why Choose N-Skill Section */}
      <div className="w-full">
        <UpcomingBatchesSection />
      </div>



      


<div className="w-full">
  <TestimonialsSection />
</div>


<div className="w-full"><GoogleReviewsSection /></div>
<div className="w-full"><JustDialReviewsSection /></div>
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