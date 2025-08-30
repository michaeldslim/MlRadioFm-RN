import { IPodcastEpisode, RadioError } from '../types';

export class PodcastService {
  private static instance: PodcastService;

  public static getInstance(): PodcastService {
    if (!PodcastService.instance) {
      PodcastService.instance = new PodcastService();
    }
    return PodcastService.instance;
  }

  async parseLatestEpisode(rssURL: string): Promise<IPodcastEpisode> {
    try {
      const response = await fetch(rssURL, {
        headers: {
          'User-Agent': 'MLRadioFM/1.0 (Podcast Player)',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        },
        redirect: 'follow'
      });
      
      if (!response.ok) {
        throw new Error(`RSS fetch failed: ${response.status} ${response.statusText}`);
      }

      const rssString = await response.text();
      
      // Find the first <item> element (latest episode)
      const itemPattern = /<item[^>]*>([\s\S]*?)<\/item>/;
      const itemMatch = rssString.match(itemPattern);
      
      if (!itemMatch || !itemMatch[1]) {
        throw new Error('No episodes found in RSS feed');
      }

      const itemContent = itemMatch[1];
      
      // Extract title
      const titlePattern = /<title>([^<]+)<\/title>/;
      const titleMatch = itemContent.match(titlePattern);
      const rawTitle = titleMatch ? titleMatch[1] : 'Unknown Episode';
      
      // Extract episode number (look for XXX: or #XXX pattern in title)
      const numberPattern = /^(\d+):|#(\d+)/;
      let number: string | undefined;
      let cleanTitle = rawTitle;
      
      const numberMatch = rawTitle.match(numberPattern);
      if (numberMatch) {
        // Check first capture group (XXX:) then second (#XXX)
        if (numberMatch[1]) {
          number = numberMatch[1];
          // Remove "928: " from the beginning of title
          cleanTitle = rawTitle.replace(/^\d+:\s*/, '');
        } else if (numberMatch[2]) {
          number = numberMatch[2];
          // Remove "#928 " from the beginning of title
          cleanTitle = rawTitle.replace(/^#\d+\s*/, '');
        }
      }
      
      // Extract audio URL from enclosure - try multiple patterns
      let audioURL: string | null = null;
      
      // Pattern 1: Standard enclosure with type
      const enclosurePattern1 = /<enclosure[^>]*url="([^"]+)"[^>]*type="audio\/[^"]+"[^>]*\/?>/;
      const enclosureMatch1 = itemContent.match(enclosurePattern1);
      
      if (enclosureMatch1 && enclosureMatch1[1]) {
        audioURL = enclosureMatch1[1];
      } else {
        // Pattern 2: Enclosure without type requirement
        const enclosurePattern2 = /<enclosure[^>]*url="([^"]+)"[^>]*\/?>/;
        const enclosureMatch2 = itemContent.match(enclosurePattern2);
        
        if (enclosureMatch2 && enclosureMatch2[1]) {
          audioURL = enclosureMatch2[1];
        } else {
          // Pattern 3: Look for media:content or other media tags
          const mediaPattern = /<media:content[^>]*url="([^"]+)"[^>]*\/?>/;
          const mediaMatch = itemContent.match(mediaPattern);
          
          if (mediaMatch && mediaMatch[1]) {
            audioURL = mediaMatch[1];
          }
        }
      }
      
      if (!audioURL) {
        throw new Error('No audio URL found in episode');
      }

      const episode = {
        title: cleanTitle,
        number,
        audioURL
      };
      
      return episode;
      
    } catch (error) {
      throw new Error(`Podcast parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
