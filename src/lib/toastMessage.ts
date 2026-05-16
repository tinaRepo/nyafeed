// サーバーと同じ判定ロジックをフロントで実行
import { VisionLabel } from './api'

type MessageRule = {
    labels: string[]
    message: string
}

const MESSAGE_RULES: MessageRule[] = [
    // 人間+猫
    { labels: ['Baby', 'Infant', 'Toddler'], message: 'あかちゃんと猫、反則級のかわいさ😭 投稿完了にゃ！' },
    { labels: ['Child', 'Girl', 'Boy'], message: 'ちびっこと猫の最強コンビ🌟 投稿完了にゃ！' },
    { labels: ['Lap', 'Lap cat'], message: '膝の上に猫、もう動けない😂 投稿完了にゃ！' },
    { labels: ['Woman', 'Lady', 'Female'], message: '猫に選ばれし者…🌸 投稿完了にゃ！' },
    { labels: ['Man', 'Male', 'Guy'], message: '猫に心を許された男、投稿完了にゃ🤝' },
    { labels: ['Person', 'Human', 'People'], message: '猫と人間の共存、尊い…🥹 投稿完了にゃ！' },
    // 種類
    { labels: ['Kitten'], message: 'こねこちゃん、とうじょう🐣 投稿完了にゃ！' },
    { labels: ['Persian cat'], message: 'ふわっふわのペルシャ様、投稿完了でございます👑' },
    { labels: ['Maine coon'], message: 'おおきい…もふもふ…投稿完了にゃ🦁' },
    { labels: ['Siamese cat'], message: 'シャム猫さま、ご降臨🙏 投稿完了にゃ！' },
    { labels: ['Tabby cat'], message: 'トラねこさん登場にゃ🐯 投稿完了！' },
    { labels: ['White'], message: 'しろねこさん、眩しい…💫 投稿完了にゃ！' },
    { labels: ['Black'], message: 'くろねこさん、ミステリアス🌙 投稿完了にゃ！' },
    { labels: ['Orange'], message: '茶トラさん、元気いっぱい🍊 投稿完了にゃ！' },
    // 状態
    { labels: ['Sleeping', 'Sleep'], message: 'すやすやにゃ〜💤 起こさないでね、投稿完了！' },
    { labels: ['Yawning', 'Yawn'], message: 'ふわあ〜っ😪 眠そうだけど投稿完了にゃ！' },
    { labels: ['Playing', 'Play'], message: '遊んでる遊んでる🎾 投稿完了にゃ！' },
    { labels: ['Sitting', 'Sit'], message: 'おすわりえらい🪑 投稿完了にゃ！' },
    // 場所
    { labels: ['Window', 'Windowsill'], message: '窓辺でまったり、投稿完了にゃ🪟' },
    { labels: ['Cardboard box', 'Box'], message: '箱に入らずにはいられない…📦 投稿完了にゃ！' },
    { labels: ['Food', 'Eating'], message: 'ごはん中に失礼します🍚 投稿完了にゃ！' },
    { labels: ['Blanket', 'Bed', 'Pillow'], message: '毛布でぬくぬく、投稿完了にゃ🛋️' },
    { labels: ['Grass', 'Garden', 'Outdoor', 'Street'], message: 'のらねこさんかな？投稿完了にゃ🌿' },
]

const DEFAULT_MESSAGES = [
    '投稿しました 🐾',
    '今日もかわいい猫をありがとう🐱 投稿完了にゃ！',
    '猫、来た。投稿完了にゃ🐾',
]

export const getToastMessage = (labels: VisionLabel[]): string => {
    // API側でスコア降順ソート済みのため、そのまま上から評価
    for (const { description } of labels) {
        for (const rule of MESSAGE_RULES) {
            if (rule.labels.includes(description)) {
                return rule.message
            }
        }
    }

    return DEFAULT_MESSAGES[
        Math.floor(Math.random() * DEFAULT_MESSAGES.length)
    ] as string
}