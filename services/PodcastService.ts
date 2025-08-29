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
    console.log('🎧 Starting podcast RSS parsing for:', rssURL);
    
    try {
      console.log('🎧 Fetching RSS feed...');
      const response = await fetch(rssURL, {
        headers: {
          'User-Agent': 'MLRadioFM/1.0 (Podcast Player)',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        },
        redirect: 'follow'
      });
      
      console.log('🎧 RSS Response status:', response.status);
      
      if (!response.ok) {
        console.log('🎧 RSS fetch failed:', response.statusText);
        throw new Error(`RSS fetch failed: ${response.status} ${response.statusText}`);
      }

      const rssString = await response.text();
      console.log('🎧 RSS content length:', rssString.length);
      console.log('🎧 RSS preview:', rssString.substring(0, 500) + '...');
      
      // Find the first <item> element (latest episode)
      const itemPattern = /<item[^>]*>([\s\S]*?)<\/item>/;
      const itemMatch = rssString.match(itemPattern);
      
      if (!itemMatch || !itemMatch[1]) {
        console.log('🎧 No <item> found in RSS');
        throw new Error('No episodes found in RSS feed');
      }

      const itemContent = itemMatch[1];
      console.log('🎧 Episode content preview:', itemContent.substring(0, 300) + '...');
      
      // Extract title
      const titlePattern = /<title>([^<]+)<\/title>/;
      const titleMatch = itemContent.match(titlePattern);
      const rawTitle = titleMatch ? titleMatch[1] : 'Unknown Episode';
      console.log('🎧 Episode title:', rawTitle);
      
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
      
      console.log('🎧 Clean title:', cleanTitle, 'Episode number:', number);
      
      // Extract audio URL from enclosure - try multiple patterns
      let audioURL: string | null = null;
      
      // Pattern 1: Standard enclosure with type
      const enclosurePattern1 = /<enclosure[^>]*url="([^"]+)"[^>]*type="audio\/[^"]+"[^>]*\/?>/;
      const enclosureMatch1 = itemContent.match(enclosurePattern1);
      
      if (enclosureMatch1 && enclosureMatch1[1]) {
        audioURL = enclosureMatch1[1];
        console.log('🎧 Found audio URL (pattern 1):', audioURL);
      } else {
        // Pattern 2: Enclosure without type requirement
        const enclosurePattern2 = /<enclosure[^>]*url="([^"]+)"[^>]*\/?>/;
        const enclosureMatch2 = itemContent.match(enclosurePattern2);
        
        if (enclosureMatch2 && enclosureMatch2[1]) {
          audioURL = enclosureMatch2[1];
          console.log('🎧 Found audio URL (pattern 2):', audioURL);
        } else {
          // Pattern 3: Look for media:content or other media tags
          const mediaPattern = /<media:content[^>]*url="([^"]+)"[^>]*\/?>/;
          const mediaMatch = itemContent.match(mediaPattern);
          
          if (mediaMatch && mediaMatch[1]) {
            audioURL = mediaMatch[1];
            console.log('🎧 Found audio URL (media pattern):', audioURL);
          }
        }
      }
      
      if (!audioURL) {
        console.log('🎧 No audio URL found in episode');
        console.log('🎧 Full episode content:', itemContent);
        throw new Error('No audio URL found in episode');
      }

      const episode = {
        title: cleanTitle,
        number,
        audioURL
      };
      
      console.log('🎧 Successfully parsed episode:', episode);
      return episode;
      
    } catch (error) {
      console.error('🎧 Podcast parsing error:', error);
      throw new Error(`Podcast parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
