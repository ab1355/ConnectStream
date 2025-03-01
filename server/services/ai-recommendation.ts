
import { db } from "../db";
import { posts, users } from "@shared/schema";
import { eq } from "drizzle-orm";

type RecommendationResult = {
  id: number;
  title: string;
  score: number;
  reason: string;
};

export class AIRecommendationService {
  // Simulated AI recommendation in this version
  // In a real implementation, you'd call an external AI API like OpenAI
  async getPostRecommendations(userId: number, limit = 5): Promise<RecommendationResult[]> {
    try {
      // Get user's posts to understand their interests
      const userPosts = await db.select()
        .from(posts)
        .where(eq(posts.authorId, userId))
        .limit(10);
      
      // Get all posts except the user's own posts
      const allPosts = await db.select()
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))
        .where(userId ? eq(posts.authorId, userId) : undefined)
        .limit(20);
      
      // In a real implementation, you'd send content to an AI service
      // For now, we'll do simple keyword matching
      const userInterests = this.extractKeywords(userPosts.map(p => p.content || "").join(" "));
      
      // Score posts based on matching keywords
      const scoredPosts = allPosts.map(post => {
        const postKeywords = this.extractKeywords(post.posts.content || "");
        const matchingKeywords = userInterests.filter(k => postKeywords.includes(k));
        const score = matchingKeywords.length / Math.max(userInterests.length, 1);
        
        return {
          id: post.posts.id,
          title: post.posts.title || "Untitled Post",
          score: score,
          reason: matchingKeywords.length > 0 
            ? `Matches your interests in: ${matchingKeywords.slice(0, 3).join(", ")}`
            : "Recommended based on popularity"
        };
      });
      
      // Sort by score and return top results
      return scoredPosts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return [];
    }
  }
  
  // Simple keyword extraction (would be done by AI in production)
  private extractKeywords(text: string): string[] {
    if (!text) return [];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'have', 'they'].includes(word));
    
    // Count word frequency
    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get top keywords
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }
}

export const aiRecommendationService = new AIRecommendationService();
