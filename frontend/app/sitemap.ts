import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all courses for dynamic URLs
  let courseUrls: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`);
    const courses = await res.json();

    if (Array.isArray(courses)) {
      courseUrls = courses.map((c: any) => ({
        url: `https://nskillindia.com/courses/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      }));
    }
  } catch {
    // If fetch fails, just skip course URLs
  }

  return [
    {
      url: "https://nskillindia.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://nskillindia.com/courses",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://nskillindia.com/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://nskillindia.com/infrastructure",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://nskillindia.com/course_calender",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://nskillindia.com/placements/register",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: "https://nskillindia.com/corporate-training",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://nskillindia.com/consulting",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...courseUrls,
  ];
}