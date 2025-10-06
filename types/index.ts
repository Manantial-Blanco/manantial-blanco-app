export type UserRole = 'creator' | 'creative';

export interface User {
  id: string;
  role: UserRole;
  walletAddress: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Piece {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  creatorUserId: string;
  tokenId?: string;
  tokenContract?: string;
  provenanceHash: string;
  canRemix: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Remix {
  id: string;
  originalPieceId: string;
  remixPieceId: string;
  createdAt: string;
}

export type Locale = 'en' | 'es';

export interface Dictionary {
  common: {
    home: string;
    register: string;
    explore: string;
    about: string;
    contact: string;
    search: string;
    sortBy: string;
    category: string;
    viewMore: string;
    subscribe: string;
    loading: string;
    error: string;
    logout: string;
  };
  landing: {
    promoBanner: string;
    heroTitle: string;
    heroDescription: string;
    registerCTA: string;
    exploreCTA: string;
    tagline: string;
    exploreTitle: string;
    recommendedTitle: string;
    searchPlaceholder: string;
    categories: {
      audioVisual: string;
      illustrations: string;
      music: string;
      sculptures: string;
    };
    features: {
      registerIP: {
        title: string;
        description: string;
      };
      remixArt: {
        title: string;
        description: string;
      };
      releaseRemix: {
        title: string;
        description: string;
      };
    };
    whyCulturalIP: {
      title: string;
      description: string;
      description2: string;
    };
    testimonials: {
      title: string;
    };
    footer: {
      company: string;
      support: string;
      newsletter: string;
      newsletterDescription: string;
      emailPlaceholder: string;
      aboutUs: string;
      careers: string;
      press: string;
      blog: string;
      contactUs: string;
      faqs: string;
      shippingReturns: string;
      privacyPolicy: string;
    };
  };
  auth: {
    connectWallet: string;
    disconnect: string;
    signIn: string;
    signOut: string;
  };
  pieces: {
    registerNew: string;
    title: string;
    description: string;
    uploadImage: string;
    tags: string;
    canRemix: string;
    submit: string;
    myPieces: string;
  };
}
