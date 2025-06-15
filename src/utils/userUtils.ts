import { fetchUserAttributes } from 'aws-amplify/auth';

export interface UserDisplayInfo {
  displayName: string;
  email?: string;
}

export async function getUserDisplayInfo(user: any): Promise<UserDisplayInfo> {
  try {
    // If user is a guest, return guest info
    if (!user || user.username === 'Guest') {
      return {
        displayName: 'Guest Player',
      };
    }

    // Try to fetch user attributes for authenticated users
    try {
      const attributes = await fetchUserAttributes();
      const email = attributes.email || '';
      const nickname = attributes.nickname || ''; // Custom username
      
      let displayName = '';
      
      // Priority: Custom username (nickname) > Email-based name > Fallback
      if (nickname && nickname.trim()) {
        displayName = nickname.trim();
      } else if (email) {
        // Create friendly name from email as fallback
        const emailUsername = email.split('@')[0];
        displayName = emailUsername
          .replace(/[._]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      } else {
        displayName = 'Player';
      }
      
      return {
        displayName,
        email,
      };
    } catch (attributeError) {
      console.log('Could not fetch user attributes:', attributeError);
      
      // Fallback to basic user info
      return getQuickDisplayInfo(user);
    }
  } catch (error) {
    console.error('Error getting user display info:', error);
    return {
      displayName: 'Player',
    };
  }
}

export function getQuickDisplayInfo(user: any): UserDisplayInfo {
  if (!user || user.username === 'Guest') {
    return {
      displayName: 'Guest Player',
    };
  }
  
  // Try to extract meaningful name from username (which is usually email)
  if (user.username && user.username.includes('@')) {
    const emailUsername = user.username.split('@')[0];
    const displayName = emailUsername
      .replace(/[._]/g, ' ')
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return {
      displayName,
      email: user.username,
    };
  } else if (user.username && user.username !== user.userId) {
    return {
      displayName: user.username,
    };
  } else {
    return {
      displayName: 'Player',
    };
  }
}

export function getQuickDisplayName(user: any): string {
  return getQuickDisplayInfo(user).displayName;
}
