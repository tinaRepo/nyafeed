export type ReactionKey =
    | 'cute'
    | 'sniff'
    | 'healing'
    | 'pressure'
    | 'fluffy';

export type Reactions = Record<ReactionKey, number>;

export type Cat = {
    id: string;
    imageUrl: string;
    comment: string;
    reactions: Reactions;
};