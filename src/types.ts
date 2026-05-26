export interface JournalReflection {
  id: string;
  text: string;
  createdAt: string;
  category: 'Pressure' | 'Isolation' | 'Expectation' | 'Clarity' | 'Hope';
  reactions: number;
}

export interface InvitationRequest {
  name: string;
  email: string;
  company: string;
  stage: string;
  challenges: string;
}

export interface RsvpRequest {
  name: string;
  email: string;
  dietaryNote?: string;
  bringingPlusOne: boolean;
}

export interface WaitlistRequest {
  name: string;
  email: string;
  reason: string;
}

export interface FounderStory {
  id: string;
  author: string;
  role: string;
  company: string;
  quote: string;
  story: string;
}
