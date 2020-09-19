export interface RedditConfig {
    admin: string;
    userAgent: string;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    requestDelay: number;
    requestTimeout: number;
    maxRetryAttempts: number;
    continueAfterRatelimitError: boolean;
    networks: string[];
}

export interface RedditMessage {
    author: Author;
    name: string;
    body: string;
    was_comment?: boolean;
    id: string;
    parent_id?: string;
}

export interface Author {
    name;
}
