// src/utils/types.ts

export type UserRole = 'yarismaci' | 'kaptan' | 'danisman' | 'yonetici' | 'misafir';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    teamName?: string;
    teamId?: string;
    institution?: string;
    phone?: string;
    bio?: string;
    skills?: string[];
    avatarUrl?: string; // <-- Eklendi
    createdDate?: string;
}

export interface Competition {
    id: string;
    title: string;
    category: string;
    description?: string;
    prize_pool?: string;
    first_prize: string;
    second_prize?: string;
    third_prize?: string;
    application_deadline: string;
    delivery_milestone_title?: string;
    delivery_milestone_date?: string;
    announcement_milestone_title?: string;
    announcement_milestone_date?: string;
    status: 'Başvurular Açık' | 'Rapor Değerlendirmede' | 'Final Aşaması' | 'Tamamlandı';
    organizer?: string;
    specification_pdf_url?: string;
    kys_portal_url?: string;
    created_at?: string;
}

export interface ChatMessage {
    id: string;
    group_id: string;
    sender_id: string;
    sender_name: string;
    sender_team?: string;
    content: string;
    created_at: string;
}

export interface ForumPost {
    id: string;
    title: string;
    author_id: string;
    author_name: string;
    team?: string;
    competition?: string;
    category?: string;
    content: string;
    votes: number;
    views: number;
    is_solved: boolean;
    tags?: string[];
    created_at: string;
    replies?: ForumReply[];
}

export interface ForumReply {
    id: string;
    post_id: string;
    author_id: string;
    author_name: string;
    team?: string;
    content: string;
    is_accepted_solution: boolean;
    votes: number;
    created_at: string;
}

export interface TeamFinderPost {
    id: string;
    type: 'looking_for_team' | 'recruiting_members';
    author_id: string;
    author_name: string;
    author_team?: string;
    author_institution?: string;
    title: string;
    competition?: string;
    skills?: string[];
    description: string;
    looking_for_role?: string;
    location?: string;
    team_size_current?: number;
    team_size_target?: number;
    contact_preference?: 'chat' | 'email' | 'phone';
    contact_info?: string;
    created_at: string;
}