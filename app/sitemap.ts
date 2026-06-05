import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/post";
import { getDynamicCategories } from "@/constant";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fazhouji.vercel.app";
  const posts = getAllPosts();
  const categories = getDynamicCategories(posts);

  // 静态页面
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/skill`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // 文章页面
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.frontmatter.date
      ? new Date(post.frontmatter.date)
      : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 分类页面
  const categoryRoutes: MetadataRoute.Sitemap = Object.keys(categories).map(
    (slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })
  );

  return [...staticRoutes, ...postRoutes, ...categoryRoutes];
}
