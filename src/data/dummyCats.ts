import { Cat } from '../types/cat';

export const dummyCats: Cat[] = [
    {
        id: '1',
        imageUrl: 'https://placecats.com/400/300',
        comment: 'ひなたぼっこ中。邪魔しないでにゃ🐱',
        reactions: { cute: 12, sniff: 5, healing: 8, pressure: 1, fluffy: 6 },
    },
    {
        id: '2',
        imageUrl: 'https://placecats.com/401/300',
        comment: 'ごはんまだ？ってずっと見てくる',
        reactions: { cute: 34, sniff: 10, healing: 4, pressure: 22, fluffy: 3 },
    },
    {
        id: '3',
        imageUrl: 'https://placecats.com/402/300',
        comment: '箱があれば入る。それが猫。',
        reactions: { cute: 8, sniff: 3, healing: 11, pressure: 0, fluffy: 14 },
    },
    {
        id: '4',
        imageUrl: 'https://placecats.com/403/300',
        comment: '深夜2時に全力ダッシュ。理由は不明。',
        reactions: { cute: 57, sniff: 20, healing: 2, pressure: 41, fluffy: 9 },
    },
    {
        id: '5',
        imageUrl: 'https://placecats.com/404/300',
        comment: 'このこたつ、私のものにしました。',
        reactions: { cute: 21, sniff: 7, healing: 30, pressure: 5, fluffy: 18 },
    },
    {
        id: '6',
        imageUrl: 'https://placecats.com/405/300',
        comment: 'カリカリよりチュールがいい。絶対に。',
        reactions: { cute: 44, sniff: 15, healing: 9, pressure: 3, fluffy: 27 },
    },
];